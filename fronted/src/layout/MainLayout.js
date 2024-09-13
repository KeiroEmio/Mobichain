import React from 'react';
import { Layout, Menu, Breadcrumb } from 'antd';
import { Outlet } from 'react-router-dom';
import HeaderAdmin from './HeaderAdmin';
import SideBar from './SideBar';

const { Header, Content, Footer, Sider } = Layout;
const footerHeight = 64;
const headerHeight = 64;
const MainLayout = () => {
    return (
        <Layout style={{ minHeight: '100vh', color: '#fff' }}> { }
            <Header style={{ position: 'fixed', width: '100%', top: 0, color: '#fff', backgroundColor: '#fff' }}>
                <HeaderAdmin />
            </Header>
            <Layout style={{ paddingTop: 64, marginLeft: 200 }}> {/* Offset for the fixed Header and Sider */}
                <Sider
                    width={200}
                    className="site-layout-background"
                    style={{
                        overflow: 'auto',
                        height: `calc(100vh - ${headerHeight}px - ${footerHeight}px)`, // Adjust height to account for both header and footer
                        position: 'fixed',
                        left: 0,
                        top: `${headerHeight}px`, // Start directly below the header
                        background: '#fff' // Set the background color to white
                    }}
                >
                    <SideBar />
                </Sider>
                <Content style={{ padding: '24px 50px 0', overflow: 'initial' }}>
                    <div style={{
                        background: '#fff',
                        padding: 24,
                        minHeight: 360,
                        maxHeight: 500, // Set a max height for scrolling
                        overflowY: 'auto', // Enable vertical scrolling
                        scrollbarWidth: 'none' // Hide scrollbar in Firefox
                    }}>
                        <Outlet /> {/* 子路由在这里渲染 */}
                    </div>
                </Content>
            </Layout>
            <Footer style={{ textAlign: 'center', position: 'fixed', zIndex: 1, width: '100%', bottom: 0 }}>
                <h3>区块链-二手交易平台管理界面</h3>
            </Footer>
        </Layout >
    );
};

export default MainLayout;
