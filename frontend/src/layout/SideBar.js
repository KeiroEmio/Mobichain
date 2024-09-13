import React from 'react';
import { Layout, Menu } from 'antd';
import {
    UserOutlined,
    SendOutlined,
    AppleOutlined,
    AndroidOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Sider } = Layout;

const SideBar = () => {
    // Assuming the footer height is 64 pixels
    const footerHeight = 64;

    return (
        <Sider>
            <Menu
                mode="inline"
                defaultSelectedKeys={['1']}
                style={{ height: '100%', borderRight: 0 }}
            >
                <Menu.Item key="1" icon={<UserOutlined />}>
                    <Link to="/userList">用户列表</Link>
                </Menu.Item>
                <Menu.Item key="2" icon={<SendOutlined />}>
                    <Link to="/Transcations">交易记录</Link>
                </Menu.Item>
                <Menu.Item key="3" icon={<AppleOutlined />}>
                    <Link to="/iphone">苹果</Link>
                </Menu.Item>
                <Menu.Item key="4" icon={<AndroidOutlined />}>
                    <Link to="/android">安卓</Link>
                </Menu.Item>
                <Menu.Item key="5" icon={<SendOutlined />}>
                    <Link to="/blockchain-explorer">上链查询</Link>
                </Menu.Item>
            </Menu>
        </Sider>
    );
};

export default SideBar;
