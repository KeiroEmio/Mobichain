import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Breadcrumb } from 'antd';
import { UserOutlined, SmileTwoTone, CarryOutTwoTone, MessageTwoTone, LogoutOutlined, RocketTwoTone, ApiTwoTone } from '@ant-design/icons';
import { Link, Outlet, useLocation } from 'react-router-dom';
import logo from '../../asserts/a2086ca7aff1eb04d3d585c95b30c27.png';
import useApi from '../../Hooks/useApi'
import useLocalStore from "../../Hooks/useLocalStore";
import './CustomMenu.css'

const { Header, Content } = Layout;

const UserLayout = () => {
    // 用户数据
    const navigate = useNavigate();
    const api = new useApi();
    const location = useLocation();
    const pathSnippets = location.pathname.split('/').filter(i => i);
    const [user, setUser] = useState({
        name: 'Loading...', // 初始状态
        avatar: '/path/to/default/avatar.png', // 初始头像
    });
    const localStore = useLocalStore();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await api.get('/api/account'); // 发起请求
                if (response.status === 200) {
                    const accountData = response.data;
                    setUser({
                        name: accountData.email,
                        avatar: `/assets/images${accountData.photo}`, // 更新头像路径
                    });
                } else {
                    throw new Error(`Error fetching user data: ${response.status}`);
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };

        fetchUserData(); // 仅在组件首次加载时运行
    }, []); // 空依赖项数组确保只运行一次

    // 登出逻辑
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


    const handleProfileClick = async () => {
        try {
            // Call the appropriate method from useApi to send a request to /account endpoint
            const response = await api.get('/api/account');
            console.log('Account data:', response.data);
            navigate('/user/person', { state: { accountData: response.data } }); // Navigate to /person page
        } catch (error) {
            console.error('Error fetching account data:', error);
        }
    };

    const communcation = async () => {
        try {
            navigate('/user/communcation'); // Navigate to /person page
        } catch (error) {
            console.error('Error fetching account data:', error);
        }
    }

    const explorer = async () => {
        try {
            navigate('/user/blockchain-explorer'); // Navigate to /person page
        } catch (error) {
            console.error('Error fetching account data:', error);
        }
    }

    const handlePossessedClick = async () => {
        try {
            navigate('/user/possessed'); // Navigate to /person page
        } catch (error) {
            console.error('Error fetching account data:', error);
        }
    }
    const handleSellClick = async () => {
        try {
            navigate('/user/selling'); // Navigate to /person page
        } catch (error) {
            console.error('Error fetching account data:', error);
        }
    }
    // 用户下拉菜单
    const menu = (
        <Menu>
            <Menu.Item key="profile" onClick={handleProfileClick} icon={<SmileTwoTone />}>
                个人信息
            </Menu.Item>
            <Menu.Item key="possessed" onClick={handlePossessedClick} icon={<CarryOutTwoTone />}>
                已购买的
            </Menu.Item>
            <Menu.Item key="selling" onClick={handleSellClick} icon={<RocketTwoTone />}>
                正在售卖
            </Menu.Item>
            <Menu.Item key="communication" onClick={communcation} icon={<MessageTwoTone />}>
                聊天记录
            </Menu.Item>
            <Menu.Item key="explorer" onClick={explorer} icon={<ApiTwoTone />}>
                上链查询
            </Menu.Item>
            <Menu.Item key="logout" onClick={handleLogout} icon={<LogoutOutlined />}>
                退出账户
            </Menu.Item>
        </Menu>
    );

    // 用户信息下拉组件
    const userDropdown = (
        <Dropdown overlay={menu}>
            <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
                {user.name}
                {handleLogout}
            </a>
        </Dropdown>
    );

    // 导航菜单项
    const navItems = [
        { key: 'home', label: <Link to="/user/home">主页面</Link> },
        { key: 'phone', label: <Link to="/user/android">二手市场</Link> },
        { key: 'selling', label: <Link to='/user/sellPhone'>售卖</Link> }
    ];

    const breadcrumbItems = pathSnippets.map((snippet, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        return (
            <Breadcrumb.Item key={url}>
                <Link to={url}>{snippet}</Link>
            </Breadcrumb.Item>
        );
    });

    breadcrumbItems.unshift(
        // <Breadcrumb.Item key="user">
        //     <Link to="/user">user</Link>
        // </Breadcrumb.Item>
    );
    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <Header className="header" style={{ padding: '0 50px', display: 'flex', alignItems: 'center' }}>
                <div className="logo" style={{ marginTop: '3px', height: '60px' }}>
                    <img src={logo} alt="Logo" style={{ height: '100%' }} />
                </div>
                <Menu theme="dark" mode="horizontal" items={navItems} style={{ lineHeight: '64px', marginLeft: 'auto', marginRight: 'auto' }} />
                {userDropdown}
            </Header>
            <Content style={{ padding: '0 50px', marginTop: 64 }}>
                <Outlet />
            </Content>
        </Layout>
    );
};

export default UserLayout;
