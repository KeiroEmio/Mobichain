import React from 'react';
import { Layout, Menu, Dropdown, Avatar, Button } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';  // 引入 useNavigate 钩子
import useApi from '../Hooks/useApi';
import useLocalStore from "../Hooks/useLocalStore";

const { Header } = Layout;

const MainHeader = () => {
    const navigate = useNavigate();  // 创建 navigate 函数实例
    const api = useApi();
    const localStore = useLocalStore();
    // 假设这是你的退出方法
    const handleLogout = () => {
        try {
            localStorage.clear();
            localStore.removeLoginData()
            localStore.clearPageData();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        } finally {
            navigate('/login'); // 导航到登录页面
        }
    };

    // 处理个人中心导航
    const handleProfileClick = async () => {
        try {
            // Call the appropriate method from useApi to send a request to /account endpoint
            const response = await api.get('/api/account');
            console.log('Account data:', response.data);
            navigate('/person', { state: { accountData: response.data } }); // Navigate to /person page
        } catch (error) {
            console.error('Error fetching account data:', error);
        }
    };
    // 下拉菜单项
    const menu = (
        <Menu>
            <Menu.Item key="1" icon={<UserOutlined />} onClick={handleProfileClick}>
                个人中心
            </Menu.Item>
            <Menu.Item key="2" icon={<LogoutOutlined />} onClick={handleLogout}>
                退出登录
            </Menu.Item>
        </Menu>
    );

    return (
        <Header style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff',
            margin: 0,
            padding: 0,
        }}>
            <div className="logo" />
            <div>
                <Dropdown overlay={menu}>
                    <Button type="text" icon={<Avatar icon={<UserOutlined />} />}>
                        用户名
                    </Button>
                </Dropdown>
            </div>
        </Header>
    );
};

export default MainHeader;
