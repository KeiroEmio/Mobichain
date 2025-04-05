import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs, Form, Input, Button, Card, message ,Space} from 'antd'; // 导入 message 组件
import useApi from '../../Hooks/useApi'; 
import { WalletOutlined } from '@ant-design/icons';
import Web3 from 'web3';

const { TabPane } = Tabs;

const cardStyle = {
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
    marginTop: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)'
};

const PersonComponent = () => {
    const location = useLocation();
    const api = useApi(); 
    const [accountData, setAccountData] = useState(location.state?.accountData || {});
    const fetchAccountData = async () => {
        try {
            const response = await api.get('/api/account');
            if (response.status === 200) {
                setAccountData(response.data);
            }
        } catch (error) {
            message.error('获取账户信息失败');
        }
    };

    // 组件挂载时获取最新数据
    useEffect(() => {
        fetchAccountData();
    }, []);
  
    const handleChangePassword = async (values) => {
        try {
            // 调用API的post方法，发送JSON格式的请求
            const response = await api.post('/api/account/changepassword', {
                oldpassword: values.oldPassword,
                newpassword: values.newPassword,
                confirmpassword: values.confirmPassword
            });
            console.log('response:', response)

            if (response && response.status === 200) {
                message.success('Password changed successfully');
            } else {
                message.error('Failed to change password');
            }
        } catch (error) {
            console.error('Change password error:', error);
            message.error('An error occurred while changing the password.');
        }
    };

    const handleBindWallet = async () => {
        try {
            if (typeof window.ethereum === "undefined") {
                return message.error('请安装 MetaMask 或其他以太坊钱包插件！');
            }

            const web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: "eth_requestAccounts" });

            const accounts = await web3.eth.getAccounts();
            if (accounts.length === 0) {
                throw new Error("未找到钱包账户");
            }

            const address = accounts[0];
            
            // 获取 nonce
            const nonceResponse = await api.get('/api/account/nonce');
            const nonce = nonceResponse.data.nonce;

            // 使用 web3.utils.utf8ToHex 转换 nonce
            const signature = await window.ethereum.request({
                method: "personal_sign",
                params: [web3.utils.utf8ToHex(nonce), address],
            });

            const response = await api.post('/api/account/bindwallet', { 
                address,
                signature 
            });

            if (response.status === 200) {
                message.success('钱包绑定成功！');
                window.location.reload();
            }
        } catch (error) {
            if (error.response?.status === 405) {
                message.error(error.response.data.message || '绑定失败');
            } else {
                message.error('绑定钱包失败：' + (error.message || '未知错误'));
            }
        }
    };

    const handleChangeWallet = async () => {
        try {
            if (typeof window.ethereum === "undefined") {
                return message.error('请安装 MetaMask 或其他以太坊钱包插件！');
            }

            const web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: "eth_requestAccounts" });

            const accounts = await web3.eth.getAccounts();
            if (accounts.length === 0) {
                throw new Error("未找到钱包账户");
            }

            const newAddress = accounts[0];
            
            // 获取 nonce
            const nonceResponse = await api.get('/api/account/nonce');
            const nonce = nonceResponse.data.nonce;

            // 使用 web3.utils.utf8ToHex 转换 nonce
            const signature = await window.ethereum.request({
                method: "personal_sign",
                params: [web3.utils.utf8ToHex(nonce), newAddress],
            });

            const response = await api.post('/api/account/changewallet', { 
                address: newAddress,
                signature 
            });

            if (response.status === 200) {
                message.success('钱包更换成功！');
                window.location.reload();
            }
        } catch (error) {
            if (error.response?.status === 405) {
                message.error(error.response.data.message || '更换失败');
            } else {
                message.error('更换钱包失败：' + (error.message || '未知错误'));
            }
        }
    };

    return (
        <div>
            <Tabs defaultActiveKey="1" style={{ paddingTop: '20px' }} centered>
                <TabPane tab="个人信息" key="1">
                    <Card style={cardStyle}>
                        {Object.entries(accountData).map(([key, value]) => (
                            <div key={key} style={{ margin: '15px 0', padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
                                <Space align="baseline" style={{ width: '100%', justifyContent: 'space-between' }}>
                                    <div>
                                        <strong style={{ color: '#333', fontSize: '16px' }}>{key}:</strong>
                                        <span style={{ color: '#666', marginLeft: '10px' }}>
                                            {value !== null ? value.toString() : 'N/A'}
                                        </span>
                                    </div>
                                    {key === 'address' && (
                                        value === null || value === 'N/A' ? (
                                            <Button 
                                                type="primary" 
                                                icon={<WalletOutlined />}
                                                onClick={handleBindWallet}
                                                style={{ background: '#4CAF50' }}
                                            >
                                                绑定钱包
                                            </Button>
                                        ) : (
                                            <Button 
                                                type="primary" 
                                                icon={<WalletOutlined />}
                                                onClick={handleChangeWallet}
                                                style={{ background: '#2196F3' }}
                                            >
                                                更换钱包
                                            </Button>
                                        )
                                    )}
                                </Space>
                            </div>
                        ))}
                    </Card>
                </TabPane>

                <TabPane tab="修改密码" key="2">
                    <h2>Change Password</h2>
                    <Form
                        layout="vertical"
                        onFinish={handleChangePassword}
                    >
                        <Form.Item
                            name="oldPassword"
                            label="Old Password"
                            rules={[{ required: true, message: 'Please input your old password!' }]}
                        >
                            <Input.Password />
                        </Form.Item>
                        <Form.Item
                            name="newPassword"
                            label="New Password"
                            rules={[{ required: true, message: 'Please input your new password!' }]}
                        >
                            <Input.Password />
                        </Form.Item>
                        <Form.Item
                            name="confirmPassword"
                            label="Confirm New Password"
                            dependencies={['newPassword']}
                            hasFeedback
                            rules={[
                                { required: true, message: 'Please confirm your new password!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Change Password
                            </Button>
                        </Form.Item>
                    </Form>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default PersonComponent;
