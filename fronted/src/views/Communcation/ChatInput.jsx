import React, { useState } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import styled from "styled-components";
import Picker from "emoji-picker-react";

export default function ChatInput({ handleSendMsg }) {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const handleEmojiPickerhideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (emojiObject, event) => {
    const emoji = emojiObject.emoji;
    if (emoji) {
      setMsg(prevMsg => prevMsg + emoji);
      setShowEmojiPicker(false);  // 选择表情后自动关闭表情选择器
    } else {
      console.error('Failed to insert emoji:', emojiObject);
    }
  };

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.trim().length > 0) {
      handleSendMsg(msg.trim());
      setMsg("");
    }
  };

  return (
    <Container>
      <div className="button-container">
        <BsEmojiSmileFill onClick={handleEmojiPickerhideShow} />
        {showEmojiPicker && (
          <Picker
            onEmojiClick={handleEmojiClick}
            pickerStyle={{ position: 'absolute', bottom: '40px', right: '0px' }}
          />
        )}
      </div>
      <form className="input-container" onSubmit={sendChat}>
        <input
          type="text"
          placeholder="Type your message here..."
          onChange={(e) => setMsg(e.target.value)}
          value={msg}
        />
        <button type="submit">
          <IoMdSend />
        </button>
      </form>
    </Container>
  );
}

const Container = styled.div`
  position: fixed; // Make the container fixed
  bottom: 0;       // Align to the bottom
  left: 390px;
  width: 100%;     // Take full width or adjust as necessary
  max-width: 1000px; // Adjust based on your chat UI width
  display: flex;
  align-items: center;
  background-color: #080420;
  padding: 0.5rem 2rem;
  box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1); // Optional: Adds a shadow above the input for depth

  @media screen and (min-width: 720px) and (max-width: 1080px) {
    padding: 0.5rem 1rem;
  }

  .button-container {
    display: flex;
    align-items: center;
    color: white;
    gap: 1rem;

    .emoji {
      position: relative;
      svg {
        font-size: 1.5rem;
        color: #ffff00c8;
        cursor: pointer;
      }

      .emoji-picker-react {
        position: absolute;
        bottom: 50px; // Position above the input field
        background-color: #080420;
        box-shadow: 0 5px 10px #9a86f3;
        border-color: #9a86f3;
        .emoji-scroll-wrapper::-webkit-scrollbar {
          background-color: #080420;
          width: 5px;
          &-thumb {
            background-color: #9a86f3;
          }
        }
        .emoji-categories {
          button {
            filter: contrast(0);
          }
        }
        .emoji-search {
          background-color: transparent;
          border-color: #9a86f3;
        }
        .emoji-group:before {
          background-color: #080420;
        }
      }
    }
  }

  .input-container {
    flex-grow: 1; // Make the input container fill the space
    display: flex;
    align-items: center;
    background-color: #ffffff34;
    border-radius: 2rem;
    gap: 1rem;

    input {
      flex-grow: 1; // Make input expand to fill available space
      height: 40px; // Set a fixed height for consistency
      background-color: transparent;
      color: white;
      border: none;
      padding-left: 1rem;
      font-size: 1.2rem;

      &::selection {
        background-color: #9a86f3;
      }
      &:focus {
        outline: none;
      }
    }

    button {
      padding: 0.3rem 2rem;
      border-radius: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #9a86f3;
      border: none;
      svg {
        font-size: 2rem;
        color: white;
      }
    }
  }
`;

