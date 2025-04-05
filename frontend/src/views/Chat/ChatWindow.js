import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Empty, Spin, Typography, Avatar, Alert } from 'antd';
import { UserOutlined, DisconnectOutlined } from '@ant-design/icons';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const { Text } = Typography;

const ChatWindow = ({ currentChat, messages, currentUserId, loading, onSendMessage, connected }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!currentChat) {
    return (
      <EmptyChatWindow>
        <Empty description="选择一个联系人开始聊天" />
      </EmptyChatWindow>
    );
  }

  return (
    <ChatWindowContainer>
      <ChatHeader>
        <Avatar 
          src={currentChat.avatar ? `http://localhost:8060/assets/uploads/avatars/${currentChat.avatar}` : null} 
          icon={!currentChat.avatar && <UserOutlined />}
          size={36}
        />
        <HeaderInfo>
          <Text strong style={{ fontSize: '16px' }}>{currentChat.username}</Text>
          {currentChat.productInfo && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              商品: {currentChat.productInfo.name} ({currentChat.productInfo.price} QZK)
            </Text>
          )}
        </HeaderInfo>
      </ChatHeader>

      {!connected && (
        <ConnectionAlert
          message="聊天服务连接已断开，正在重新连接..."
          type="warning"
          icon={<DisconnectOutlined />}
          showIcon
          banner
        />
      )}

      <MessagesContainer>
        {loading ? (
          <LoadingContainer>
            <Spin size="large" tip="加载消息中..." />
          </LoadingContainer>
        ) : messages.length === 0 ? (
          <EmptyMessageContainer>
            <Empty 
              description={
                <div>
                  <p>还没有任何消息</p>
                  <Text type="secondary">发送一条消息开始交谈吧</Text>
                </div>
              }
            />
          </EmptyMessageContainer>
        ) : (
          // 在 MessagesList 部分
          <MessagesList>
            {messages.map((msg, index) => {
              // 确保使用数字类型比较
              const isSelf = parseInt(msg.senderId) === parseInt(currentUserId);
              return (
                <ChatMessage
                  key={msg.id || `temp-${index}`}
                  message={msg}
                  isSelf={isSelf}
                  showAvatar={true}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </MessagesList>
        )}
      </MessagesContainer>

      <ChatInput 
        onSendMessage={onSendMessage} 
        disabled={!connected} 
        placeholder={connected ? "输入消息..." : "聊天服务连接中..."}
      />
    </ChatWindowContainer>
  );
};

const ChatWindowContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
  border-left: 1px solid #e8e8e8;
`;

const ChatHeader = styled.div`
  padding: 16px;
  background-color: white;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background-color: #f5f5f5;
  position: relative;
`;

const MessagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 8px;
`;

const EmptyChatWindow = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-left: 1px solid #e8e8e8;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 16px;
`;

const EmptyMessageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
`;

const ConnectionAlert = styled(Alert)`
  margin-bottom: 0;
  border-radius: 0;
`;

export default ChatWindow;