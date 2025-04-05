import React from 'react';
import styled from 'styled-components';
import { List, Avatar, Badge, Spin, Empty, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ChatList = ({ chatList, currentChat, loading, onSelectChat, currentUserId }) => {
  // 格式化最后消息时间
  const formatTime = (timeString) => {
    const date = new Date(timeString);
    const now = new Date();
    const diff = now - date;
    
    // 今天内的消息显示时间
    if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    
    // 一周内的消息显示星期几
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      return days[date.getDay()];
    }
    
    // 更早的消息显示日期
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
  };

  // 截断过长的消息
  const truncateMessage = (message, length = 20) => {
    if (!message) return '';
    return message.length > length ? message.substring(0, length) + '...' : message;
  };

  return (
    <ChatListContainer>
      <ChatListHeader>
        <Text strong style={{ fontSize: '16px' }}>聊天列表</Text>
      </ChatListHeader>
      
      {loading ? (
        <LoadingContainer>
          <Spin />
        </LoadingContainer>
      ) : chatList.length === 0 ? (
        <EmptyContainer>
          <Empty description="暂无聊天记录" />
        </EmptyContainer>
      ) : (
        <List
          dataSource={chatList}
          renderItem={item => (
            <ChatListItem 
              onClick={() => onSelectChat(item)}
              active={currentChat?.channelId === item.channelId}
            >
              <List.Item.Meta
                avatar={
                  <Badge count={item.unreadCount || 0}>
                    <Avatar 
                      src={item.avatar ? `http://localhost:8060/assets/uploads/avatars/${item.avatar}` : null} 
                      icon={!item.avatar && <UserOutlined />}
                      size={40}
                    />
                  </Badge>
                }
                title={<Text strong>{item.username}</Text>}
                description={
                  <MessagePreview>
                    <Text type="secondary" ellipsis>
                      {truncateMessage(item.lastMessage)}
                    </Text>
                    <TimeText>{formatTime(item.lastTime)}</TimeText>
                  </MessagePreview>
                }
              />
            </ChatListItem>
          )}
        />
      )}
    </ChatListContainer>
  );
};

// 样式
const ChatListContainer = styled.div`
  width: 280px;
  border-right: 1px solid #e8e8e8;
  background-color: white;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ChatListHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatListItem = styled(List.Item)`
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  background-color: ${props => props.active ? '#e6f7ff' : 'white'};
  
  &:hover {
    background-color: ${props => props.active ? '#e6f7ff' : '#f5f5f5'};
  }
`;

const MessagePreview = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const TimeText = styled(Text)`
  font-size: 12px;
  color: #999;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const EmptyContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export default ChatList;