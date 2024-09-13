import React, { useState, useEffect, useRef } from 'react';
import './ChatUI.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faPlus, faBell } from '@fortawesome/free-solid-svg-icons';
import ChatContainer from './ChatContainer';
import useApi from '../../Hooks/useApi';
import { useLocation } from 'react-router-dom';

const initialUsers = [
    { id: 1 }
];

const ChatUI = () => {
    const location = useLocation();
    const owner = location.state?.owner;
    const ownerLocal = JSON.parse(localStorage.getItem('userData')).address;
    const api = useApi();
    const [selectedUser, setSelectedUser] = useState(initialUsers.length > 0 ? initialUsers[0] : null);
    const [message, setMessage] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showNotifyDialog, setShowNotifyDialog] = useState(false);
    const socket = useRef(null);
    const [users, setUsers] = useState(initialUsers);
    const [fetchedUsers, setFetchedUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const sendNewUserTrue = useRef(false)
    const myUserId = JSON.parse(localStorage.getItem('userData')).id;

    const fetchMessages = async (fromId, toId) => {
        try {
            const response = await api.get(`/api/sendMessageRoute/bySender/${fromId}/${toId}`);
            const formattedMessages = response.data.map(msg => ({
                id: msg.id,
                fromId: msg.fromId,
                toId: msg.toId,
                text: msg.msg,
                userId: msg.fromId
            }));
            setMessages(formattedMessages);
            console.log('messages:', formattedMessages);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    };

    const fetchOwner = async (owner) => {
        try {
            const response = await api.get(`/api/user/index/address/${owner}`);
            const object = response.data.records[0];
            setUsers(prevUsers => {
                const existingIds = new Set(prevUsers.map(user => user.id));
                if (!existingIds.has(object.id)) {
                    const newUser = {
                        id: object.id,
                        name: object.email,
                        avatar: 'https://via.placeholder.com/50'
                    };
                    console.log('sendNewUserTrue', sendNewUserTrue)
                    if (sendNewUserTrue == false) {
                        sendNewUser(newUser);
                        return [...prevUsers, newUser];
                    } else {
                        return prevUsers;
                    }
                }
                return prevUsers;
            });
        } catch (error) {
            console.error("Failed to fetch messages for owner:", error);
        }
    };

    const fetchUsersInitial = async () => {
        try {
            const getResponse = await api.get(`/api/usersMap/get/${ownerLocal}`);
            console.log('Initial users fetched:', getResponse.data);
            if (getResponse.data && getResponse.data.users) {
                setUsers(getResponse.data.users);
                if (getResponse.data.users.length > 0) {
                    setSelectedUser(getResponse.data.users[0]);
                } else {
                    setSelectedUser(null);
                }
            }
        } catch (error) {
            console.error('Failed to fetch initial users:', error);
        }
    };

    useEffect(() => {
        fetchUsersInitial();
    }, [ownerLocal]);

    useEffect(() => {
        if (selectedUser) {
            const fromId = JSON.parse(localStorage.getItem('userData')).id;
            fetchMessages(fromId, selectedUser.id);
        }
    }, [selectedUser]);

    useEffect(() => {
        if (owner && !fetchedUsers.includes(owner)) {
            setFetchedUsers(prevOwners => [...prevOwners, owner]);
            fetchOwner(owner);
        }
    }, []);

    const sendNewUser = async (newUser) => {
        try {
            sendNewUserTrue.current = true
            console.log('sendNewUserTrue2:', sendNewUserTrue)
            const user = {
                id: newUser.id,
                name: newUser.name,
                avatar: newUser.avatar
            };

            const postResponse = await api.post(`/api/usersMap/add/${ownerLocal}`, { user });
            console.log('User sent successfully:', postResponse.data);

            setUsers(prevUsers => {
                const updatedUsers = [...prevUsers, user];
                setSelectedUser(user);
                return updatedUsers;
            });

        } catch (error) {
            console.error('Failed to send new user:', error);
        }
    };

    const handleSendMessage = (msg) => {
        if (msg && socket.current) {
            socket.current.send(JSON.stringify({ userId: myUserId, text: msg }));
            setMessage('');
        }
    };

    const toggleSettings = () => {
        setShowSettings(!showSettings);
    };

    const handleAddClick = () => {
        setShowAddDialog(true);
        setShowSettings(false);
    };

    const handleNotifyClick = () => {
        setShowNotifyDialog(true);
        setShowSettings(false);
    };

    const closeDialogs = () => {
        setShowAddDialog(false);
        setShowNotifyDialog(false);
    };

    const handleDeleteUser = async (userId) => {
        try {
            const response = await api.delete(`/api/usersMap/delete/${userId}`);
            console.log('Message:', response.data);

            setUsers(prevUsers => {
                const updatedUsers = prevUsers.filter(user => user.id !== userId);
                if (selectedUser && selectedUser.id === userId) {
                    setSelectedUser(updatedUsers.length > 0 ? updatedUsers[0] : null);
                }
                return updatedUsers;
            });

        } catch (error) {
            console.error('Error deleting user:', error.message);
        }
    };

    const handleViewUserInfo = (userId) => {
        console.log(`查看用户 ${userId} 的信息`);
    };

    return (
        <div className="chat-ui">
            <div className="user-list">
                {users.map(user => (
                    <div key={user.id} className={`user ${selectedUser && selectedUser.id === user.id ? 'active' : ''}`}>
                        <div className="user-info" onClick={() => setSelectedUser(user)}>
                            <img src={user.avatar} alt={user.name} className="avatar" />
                            <span className="name">{user.name}</span>
                        </div>
                        <div className="dropdown">
                            <button className="dropbtn">⋮</button>
                            <div className="dropdown-content">
                                <button onClick={() => handleDeleteUser(user.id)}>删除</button>
                                <button onClick={() => handleViewUserInfo(user.id)}>查看信息</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="settings-icon" onClick={toggleSettings}>
                <FontAwesomeIcon icon={faCog} />
            </div>

            {showSettings && (
                <ul className="settings-menu">
                    <li onClick={handleAddClick}>
                        <FontAwesomeIcon icon={faPlus} /> Add
                    </li>
                    <li onClick={handleNotifyClick}>
                        <FontAwesomeIcon icon={faBell} /> Notify
                    </li>
                </ul>
            )}

            {showAddDialog && (
                <div className="dialog-overlay" onClick={closeDialogs}>
                    <div className="dialog-box" onClick={e => e.stopPropagation()}>
                        <div className="dialog-header">
                            <FontAwesomeIcon icon={faPlus} className="dialog-icon" />
                            <div className="dialog-title">添加好友</div>
                            <button className="dialog-close" onClick={closeDialogs}>&times;</button>
                        </div>
                        <div className="dialog-content">
                            <p>请输入对方的用户邮箱或地址：</p>
                            <input type="text" placeholder="邮箱/地址" />
                            <button className="dialog-button">添加</button>
                        </div>
                    </div>
                </div>
            )}

            {showNotifyDialog && (
                <div className="dialog-overlay" onClick={closeDialogs}>
                    <div className="notify-dialog-box" onClick={e => e.stopPropagation()}>
                        <div className="notify-dialog-header">
                            <h4 className="notify-dialog-title">新的通知</h4>
                            <button className="notify-dialog-close" onClick={closeDialogs}>&times;</button>
                        </div>
                        <ul className="notify-dialog-list">
                            {users.map(user => (
                                <li key={user.id} className="notify-dialog-item">
                                    <img src={user.avatar} alt={user.name} className="notify-dialog-avatar" />
                                    <div className="notify-dialog-info">
                                        <span className="notify-dialog-name">{user.name}</span>
                                        <span className="notify-dialog-status">请求添加好友</span>
                                    </div>
                                    <button className="notify-dialog-action">接受</button>
                                    <button className="notify-dialog-action">拒绝</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <ChatContainer
                messages={messages}
                selectedUser={selectedUser}
                myUserId={myUserId}
                message={message}
                setMessages={setMessages}
                sendMessage={handleSendMessage}
            />
        </div>
    );
};

export default ChatUI;
