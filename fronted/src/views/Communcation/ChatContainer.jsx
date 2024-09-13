import React, { useRef, useEffect } from 'react';
import ChatInput from './ChatInput';
import useApi from '../../Hooks/useApi';
import io from 'socket.io-client';

const ChatContainer = ({
    messages, selectedUser, myUserId, setMessages,
}) => {
    const api = new useApi();
    const socket = useRef(null);

    useEffect(() => {

        socket.current = io('http://localhost:3001', { transports: ['websocket'] });

        socket.current.on("receive-msg", (newMsg) => {
            if (newMsg.to === myUserId) {
                setMessages(prevMessages => [...prevMessages, newMsg]);
            }
        });

        return () => {
            socket.current.disconnect();
        };
    }, [myUserId, setMessages]);

    //消息处理
    const handleSendMsg = async (msg) => {
        const dataString = localStorage.getItem("userData");
        if (!dataString) {
            console.error("No user data available in localStorage");
            return;
        }

        const data = JSON.parse(dataString);
        if (!data || !data.id) {
            console.error("User data is invalid or does not contain an ID");
            return;
        }

        socket.current.emit("send-msg", {
            from: data.id,
            to: selectedUser.id,
            msg,
        });

        //数据库保存路由消息
        await api.post('/api/sendMessageRoute/send', {
            fromId: data.id,
            toId: selectedUser.id,
            msg: msg,
        });

        const newMessage = {
            id: messages.length + 1,
            fromId: data.id, // 确保fromId总是表示发送者ID
            toId: selectedUser.id, // 确保toId总是表示接收者ID
            text: msg,
            userId: data.id // 可以用来判断消息属于当前用户
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    return (
        <div className="chat-area">
            <div className="message-area">

                {messages.map(msg => (
                    <div
                        key={msg.id}
                        className={`message ${msg.userId === myUserId ? 'my-message' : 'other-message'}`}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>
            <ChatInput handleSendMsg={handleSendMsg} />
        </div>
    );
};

export default ChatContainer;
