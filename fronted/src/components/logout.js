import React from 'react';
import { useHistory } from 'react-router-dom';
import useLocalStore from '../../Hooks/useLocalStore'; // 确保路径正确

function LogoutButton() {
    const localStore = useLocalStore();
    const history = useHistory();

    const handleLogout = () => {
        localStore.removeLoginData(); // 调用退出功能，清除登录数据
        history.push('/login'); // 重定向到登录页面
    };

    return (
        <button onClick={handleLogout}>退出登录</button>
    );
}

export default LogoutButton;
