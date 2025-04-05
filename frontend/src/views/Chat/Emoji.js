import React from 'react';
import styled from 'styled-components';

// 简单的表情列表
const emojiList = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
  '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
  '👍', '👎', '👏', '🙌', '🤝', '💪', '❤️', '💔', '💯', '🔥'
];

const Emoji = ({ onSelect }) => {
  return (
    <EmojiGrid>
      {emojiList.map((emoji, index) => (
        <EmojiItem key={index} onClick={() => onSelect(emoji)}>
          {emoji}
        </EmojiItem>
      ))}
    </EmojiGrid>
  );
};

const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 5px;
  padding: 10px;
  width: 300px;
  max-height: 200px;
  overflow-y: auto;
`;

const EmojiItem = styled.div`
  font-size: 20px;
  cursor: pointer;
  text-align: center;
  padding: 5px;
  border-radius: 4px;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

export default Emoji;