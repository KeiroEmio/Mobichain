import React from 'react';
import styled from 'styled-components';
import { Typography, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ChatMessage = ({ message, isSelf, showAvatar }) => {
  const userData = JSON.parse(localStorage.getItem('userData'));
  
  return (
    <MessageContainer isSelf={isSelf}>
      {showAvatar && !isSelf && (
        <Avatar 
          src={message.senderAvatar ? `http://localhost:8060/${message.senderAvatar}` : null}
          icon={<UserOutlined />}
          size={36}
        />
      )}
      
      <MessageContent isSelf={isSelf}>
        <MessageBubble isSelf={isSelf}>
          {message.content}
        </MessageBubble>
        <MessageTime>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </MessageTime>
      </MessageContent>
      
      {showAvatar && isSelf && (
        <Avatar 
          src={userData.photo ? `http://localhost:8060/${userData.photo}` : null}
          icon={<UserOutlined />}
          size={36}
        />
      )}
    </MessageContainer>
  );
};

const MessageContainer = styled.div`
  display: flex;
  flex-direction: ${props => props.isSelf ? 'row-reverse' : 'row'};
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isSelf ? 'flex-end' : 'flex-start'};
  max-width: 70%;
`;

const MessageBubble = styled.div`
  padding: 10px 16px;
  background-color: ${props => props.isSelf ? '#1890ff' : 'white'};
  color: ${props => props.isSelf ? 'white' : 'rgba(0, 0, 0, 0.85)'};
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-break: break-word;
`;

const MessageTime = styled(Text)`
  font-size: 12px;
  color: #999;
  margin-top: 4px;
`;

export default ChatMessage;