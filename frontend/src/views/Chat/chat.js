import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { message } from 'antd';
import useApi from '../../Hooks/useApi';
import useAuth from '../../Hooks/useAuth';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { io } from "socket.io-client";
import useId from '@mui/material/utils/useId';

// WebSocket 服务器地址
const WS_URL = 'ws://localhost:8060';

const Chat = () => {
  const location = useLocation();
  const api = useApi();
  const auth = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  // 组件加载时获取用户信息和聊天表
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      // console.log('location:',location );
      setCurrentUser(userData);
      initWebSocket(userData.id);

      console.log('location.state:',location.state );
      if (location.state?.productInfo) {
        addContacts(userData.id, location.state.productInfo.id).then(() => {
          setTimeout(() => {
            fetchChatList(userData.id);
          }, 1000);
        });
      } else {
        fetchChatList(userData.id);
      }
    } else {
      message.error('用户未登录');
    }

    if (location.state?.targetUser && location.state?.productInfo) {
      const { targetUser, productInfo } = location.state;
      handleInitChat(targetUser, productInfo);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const addContacts =  async (userId, targetUserId) => {
    try {
      console.log('addContacts req !',userId, targetUserId);
      const response = await api.post('/api/chat/add', { 
        uid: userId,
        targetUid : targetUserId,
       });
      if (response.data && response.data.success) {
        console.log('添加联系人成功');
      }
      return true;
    } catch (error) {
      // console.error('添加联系人失败:', error);
      // message.error('添加联系人失败');
      return false;
    }
  };

  // 初始化WebSocket连接
  const initWebSocket = (userId) => {
    try {
      // 使用 Socket.io 客户端替代原生 WebSocket
      const socket = io(WS_URL);

      socket.on('connect', () => {
        console.log('WebSocket连接已建立');
        setConnected(true);

        // 连接后发送用户ID
        socket.emit('add-user', userId);
      });

      socket.on('msg-receive', (data) => {
        console.log('收到消息:', data);
        handleNewMessage(data);
      });

      socket.on('msg-sent', (data) => {
        // 处理消息发送确认
        console.log('消息已发送:', data);
      });

      socket.on('messages-read', (data) => {
        // 处理消息已读通知
        console.log('消息已读:', data);
      });

      socket.on('disconnect', () => {
        console.log('WebSocket连接已关闭');
        setConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket错误:', error);
        message.error('聊天服务连接失败');
      });

      socketRef.current = socket;
    } catch (error) {
      console.error('初始化WebSocket失败:', error);
      message.error('初始化聊天服务失败');
    }
  };

  // 获取聊天列表
  const fetchChatList = async (userId) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/chat/list/${userId}`);
      if (response.data && response.data.success) {
        setChatList(response.data.data);
      }
    } catch (error) {
      console.error('获取聊天列表失败:', error);
      message.error('获取聊天列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取与特定用户的聊天记录
  const fetchMessages = async (channelId) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/chat/messages/${channelId}`);
      if (response.data && response.data.success) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error('获取聊天记录失败:', error);
      message.error('获取聊天记录失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理新消息
  const handleNewMessage = (messageData) => {
    // 更新消息列表
    setMessages(prevMessages => [...prevMessages, messageData]);

    // 更新聊天列表中的最新消息
    setChatList(prevList => {
      const updatedList = [...prevList];
      const chatIndex = updatedList.findIndex(chat => chat.channelId === messageData.channelId);

      if (chatIndex !== -1) {
        updatedList[chatIndex] = {
          ...updatedList[chatIndex],
          lastMessage: messageData.content,
          lastTime: messageData.timestamp,
          unreadCount: currentChat && currentChat.channelId === messageData.channelId ? 0 : (updatedList[chatIndex].unreadCount || 0) + 1
        };
      } else {
        // 如果是新的聊天，添加到列表
        updatedList.push({
          channelId: messageData.channelId,
          userId: messageData.senderId,
          username: messageData.senderName,
          avatar: messageData.senderAvatar,
          lastMessage: messageData.content,
          lastTime: messageData.timestamp,
          unreadCount: 1
        });
      }

      // 按最后消息时间排序
      return updatedList.sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));
    });
  };

  // 发送消息函数
  const sendMessage = (content, type = 'text') => {
    if (!socketRef.current || !socketRef.current.connected) {
      message.error('聊天服务未连接');
      return;
    }
  
    if (!currentChat) {
      message.error('请先选择聊天对象');
      return;
    }
  
    const messageData = {
      type: 'chat',
      channelId: currentChat.channelId,
      senderId: currentUser.id,
      senderName: currentUser.username,  // 添加发送者用户名
      senderAvatar: currentUser.avatar,  // 添加发送者头像
      receiverId: currentChat.userId,
      content,
      contentType: type,
      timestamp: new Date().toISOString()
    };
  
    socketRef.current.emit('send-msg', messageData);
  
    handleNewMessage({
      ...messageData,
      id: `temp-${Date.now()}`
    });
  };

  // 选择聊天
  const selectChat = (chat) => {
    setCurrentChat(chat);
    fetchMessages(chat.channelId);

    // 标记为已读
    setChatList(prevList => {
      return prevList.map(item => {
        if (item.channelId === chat.channelId) {
          return { ...item, unreadCount: 0 };
        }
        return item;
      });
    });
  };

  // 初始化新聊天
  const handleInitChat = async (targetUserId, productInfo) => {
    try {
      if (!currentUser) return;

      // 检查是否已有与该用户的聊天
      const existingChat = chatList.find(chat => chat.userId === targetUserId);
      if (existingChat) {
        selectChat(existingChat);
        return;
      }

      // 创建新的聊天频道
      const response = await api.post('/api/chat/create', {
        userId1: currentUser.id,
        userId2: targetUserId,
        productId: productInfo.id
      });

      if (response.data && response.data.success) {
        const newChat = {
          channelId: response.data.data.channelId,
          userId: targetUserId,
          username: response.data.data.targetUsername,
          avatar: response.data.data.targetAvatar,
          lastMessage: '',
          lastTime: new Date().toISOString(),
          unreadCount: 0,
          productInfo
        };

        setChatList(prevList => [newChat, ...prevList]);
        selectChat(newChat);

        // 发送一条关于商品的消息
        setTimeout(() => {
          sendMessage(`我对您的商品"${productInfo.name}"(${productInfo.price} QZK)感兴趣`, 'product');
        }, 500);
      }
    } catch (error) {
      console.error('创建聊天失败:', error);
      message.error('创建聊天失败');
    }
  };

  return (
    <ChatContainer>
      <ChatList
        chatList={chatList}
        currentChat={currentChat}
        loading={loading}
        onSelectChat={selectChat}
        currentUserId={currentUser?.id}
      />
      <ChatWindow
        currentChat={currentChat}
        messages={messages}
        currentUserId={currentUser?.id}
        loading={loading}
        onSendMessage={sendMessage}
        connected={connected}
      />
    </ChatContainer>
  );
};

// 样式
const ChatContainer = styled.div`
  display: flex;
  height: calc(100vh - 64px);
  background-color: #f0f2f5;
`;

export default Chat;