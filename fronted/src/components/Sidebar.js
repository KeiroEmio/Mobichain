// Sidebar.js
import React from 'react';
// import UserAvatar from './UserAvatar'; // 假设你有一个单独的组件用于显示用户头像

export default function Sidebar() {
    // 在实际应用中，可能需要从context或props获取用户信息
    const userInfo = { name: '用户名', avatarUrl: 'path-to-avatar-image' };

    return (
        <div className="sidebar">
            {/* <UserAvatar userInfo={userInfo} /> */}
            {/* 导航链接 */}
            <nav>
                <ul>
                    <li>链接1</li>
                    <li>链接2</li>
                    {/* 更多链接 */}
                </ul>
            </nav>
        </div>
    );
}

