import React from 'react';
import styled from 'styled-components';
import { Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ChatMessage = ({ message, isSelf, showAvatar = true }) => {
  // 确保isSelf是基于senderId的比较结果，而不是其他逻辑
  return (
    <MessageContainer isSelf={isSelf}>
      {!isSelf && showAvatar && (
        <AvatarWrapper>
          <Avatar 
            size={36} 
            icon={<UserOutlined />} 
            src={message.senderAvatar ? `http://localhost:8060/assets/uploads/avatars/${message.senderAvatar}` : null}
          />
        </AvatarWrapper>
      )}
      
      <MessageContent isSelf={isSelf}>
        {!isSelf && <SenderName>{message.senderName || '未知用户'}</SenderName>}
        <MessageBubble isSelf={isSelf}>
          {message.content}
        </MessageBubble>
        <MessageTime isSelf={isSelf}>
          {formatTime(message.timestamp)}
        </MessageTime>
      </MessageContent>
      
      {isSelf && showAvatar && (
        <AvatarWrapper>
          <Avatar 
            size={36} 
            icon={<UserOutlined />} 
            src={message.senderAvatar ? `http://localhost:8060/assets/uploads/avatars/${message.senderAvatar}` : null}
          />
        </AvatarWrapper>
      )}
    </MessageContainer>
  );
};

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

const MessageContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: ${props => props.isSelf ? 'flex-end' : 'flex-start'};
  margin-bottom: 16px;
  max-width: 100%;
`;

const AvatarWrapper = styled.div`
  margin: 0 8px;
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isSelf ? 'flex-end' : 'flex-start'};
  max-width: 70%;
`;

const SenderName = styled.div`
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
  padding-left: 12px;
`;

const MessageBubble = styled.div`
  background-color: ${props => props.isSelf ? '#1890ff' : 'white'};
  color: ${props => props.isSelf ? 'white' : 'black'};
  padding: 8px 12px;
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-break: break-word;
  white-space: pre-wrap;
`;

const MessageTime = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  padding: ${props => props.isSelf ? '0 12px 0 0' : '0 0 0 12px'};
`;

export default ChatMessage;