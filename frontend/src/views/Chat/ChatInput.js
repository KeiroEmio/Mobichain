import React, { useState } from 'react';
import styled from 'styled-components';
import { Input, Button, Upload, message, Tooltip } from 'antd';
import { SendOutlined, PictureOutlined, SmileOutlined } from '@ant-design/icons';
import Emoji from './Emoji';

const ChatInput = ({ onSendMessage, disabled }) => {
  const [inputValue, setInputValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);

  // 发送文本消息
  const handleSend = () => {
    if (!inputValue.trim()) {
      return;
    }
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  // 处理按键事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 处理图片上传
  const handleImageUpload = (info) => {
    if (info.file.status === 'done') {
      const imageUrl = info.file.response.url;
      onSendMessage(imageUrl, 'image');
      message.success('图片上传成功');
    } else if (info.file.status === 'error') {
      message.error('图片上传失败');
    }
  };

  // 处理表情选择
  const handleEmojiSelect = (emoji) => {
    setInputValue(prev => prev + emoji);
    setShowEmoji(false);
  };

  return (
    <InputContainer>
      {showEmoji && (
        <EmojiContainer>
          <Emoji onSelect={handleEmojiSelect} />
        </EmojiContainer>
      )}
      
      <InputToolbar>
        <Tooltip title="发送表情">
          <ToolButton 
            type="text" 
            icon={<SmileOutlined />} 
            onClick={() => setShowEmoji(!showEmoji)}
            disabled={disabled}
          />
        </Tooltip>
        <Tooltip title="发送图片">
          <Upload
            name="image"
            action="/api/chat/upload"
            showUploadList={false}
            onChange={handleImageUpload}
            disabled={disabled}
          >
            <ToolButton 
              type="text" 
              icon={<PictureOutlined />} 
              disabled={disabled}
            />
          </Upload>
        </Tooltip>
      </InputToolbar>
      
      <InputArea>
        <StyledTextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={disabled ? "聊天服务连接中..." : "输入消息..."}
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={disabled}
        />
        <SendButton 
          type="primary" 
          icon={<SendOutlined />} 
          onClick={handleSend}
          disabled={disabled || !inputValue.trim()}
        />
      </InputArea>
    </InputContainer>
  );
};

// 样式
const InputContainer = styled.div`
  border-top: 1px solid #e8e8e8;
  background-color: white;
  padding: 8px 16px;
  position: relative;
`;

const InputToolbar = styled.div`
  display: flex;
  padding: 8px 0;
  gap: 8px;
`;

const ToolButton = styled(Button)`
  font-size: 18px;
  padding: 0 8px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InputArea = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
`;

const StyledTextArea = styled(Input.TextArea)`
  resize: none;
  border-radius: 4px;
`;

const SendButton = styled(Button)`
  height: 32px;
  width: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmojiContainer = styled.div`
  position: absolute;
  bottom: 100%;
  left: 16px;
  background-color: white;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
`;

export default ChatInput;