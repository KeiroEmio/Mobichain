import React, { useState, useEffect, useRef } from 'react';

function useWebSocket(url, onMessageReceived) {
    const ws = useRef(null);

    useEffect(() => {
        // 如果url未定义或为null，则不尝试连接
        if (!url) return;

        // 创建WebSocket连接
        ws.current = new WebSocket('ws://localhost:3001');
        ws.current.onmessage = (event) => {
            onMessageReceived(event);
        };

        // ws.send(JSON.stringify({ text: 'Hello, client!' }));
        // 在effect清理函数中关闭连接
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [url, onMessageReceived]);

    const sendMessage = (message) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
        }
    };

    return sendMessage;
}


export default useWebSocket;