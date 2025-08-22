import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs, Form, Input, Button, Card, message, Space, Avatar, Upload, Alert } from 'antd'; // 导入 message 组件
import useApi from '../../Hooks/useApi';
import { WalletOutlined, EditOutlined, UserOutlined, CameraOutlined } from '@ant-design/icons';
import Web3 from 'web3';
import contractInstance from '../../contract/contract';
// import useAuth from '../../Hooks/useAuth';

const { TabPane } = Tabs;
const cardStyle = {
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
    marginTop: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)'
};

const fieldLabels = {
    username: '用户名',
    email: '邮箱',
    address: '钱包地址',
    tokenBalance: 'QZK 余额'
};

const formatAddress = (address) => {
    if (!address || address === '') return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};


const PersonComponent = () => {
    const location = useLocation();
    const api = useApi();
    const [accountData, setAccountData] = useState(location.state?.accountData || {});
    const [form] = Form.useForm();
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    const [tokenBalance, setTokenBalance] = useState('0');

    const fetchAccountData = async () => {
        try {
            const response = await api.get('/api/account');
            if (response.status === 200) {
                setAccountData(response.data);
                form.setFieldsValue({
                    username: response.data.username,
                    email: response.data.email,
                    photo: response.data.photo,

                });
            }
        } catch (error) {
            message.error('获取账户信息失败');
        }
    };

    // 获取代币余额
    const fetchTokenBalance = async () => {
        if (!accountData.address) return;

        try {
            await contractInstance.init();
            const tokenContract = contractInstance.getTokenContract();
            const balance = await tokenContract.methods.balanceOf(accountData.address).call();
            // 转换为可读格式，保留6位小数
            const formattedBalance = parseFloat(Web3.utils.fromWei(balance, 'ether')).toFixed(6);
            console.log('Token Balance:', formattedBalance);
            setTokenBalance(formattedBalance);
        } catch (error) {
            console.error('获取代币余额失败:', error);
            message.error('获取代币余额失败');
        }
    };

    useEffect(() => {
        // 获取账户信息
        fetchAccountData();

        console.log('accountData:', accountData.address);
        if (accountData.address) {
            fetchTokenBalance();
        }
    }, [accountData.address]);

    const handleChangePassword = async (values) => {
        try {
            const response = await api.post('/api/account/changepassword', {
                oldpassword: values.oldPassword,
                newpassword: values.newPassword,
                confirmpassword: values.confirmPassword
            });

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

            const nonceResponse = await api.get('/api/account/nonce');
            const nonce = nonceResponse.data.nonce;

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

            const nonceResponse = await api.get('/api/account/nonce');
            const nonce = nonceResponse.data.nonce;

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

    const handleUpdateUserInfo = async (values) => {
        try {
            console.log('values:', values)
            const response = await api.post(`/api/account/update`, {
                uid: userData.id,
                username: values.username,
                email: values.email,
            });

            if (response.status === 200) {
                message.success('用户信息更新成功！');
                fetchAccountData(); // 重新获取用户信息
            } else {
                message.error('更新用户信息失败');
            }
        } catch (error) {
            console.error('更新用户信息错误:', error);
            message.error('更新用户信息时发生错误: ' + (error.response?.data?.message || error.message || '未知错误'));
        }
    };

    const handleAvatarUpload = async (info) => {
        if (info.file.status === 'uploading') {
            return;
        }
        if (info.file.status === 'done') {
            try {
                // 创建 FormData 对象
                const photoData = new FormData();
                photoData.append('photo', info.file.originFileObj);

                // 使用 api.upload 上传头像
                const uploadResponse = await api.upload("/api/auth/avatar", photoData);
                // console.log('头像上传成功:', uploadResponse);

                let photoPath = '';
                if (uploadResponse.data && uploadResponse.data.photo) {
                    photoPath = uploadResponse.data.photo;

                    // 更新用户头像信息
                    const updateResponse = await api.post(`/api/account/updateAvatar`, {
                        uid: userData.id,
                        photo: photoPath
                    });

                    if (updateResponse.status === 200) {
                        message.success('头像更新成功！');
                        fetchAccountData();
                    }
                } else {
                    message.error('头像上传失败');
                }
            } catch (error) {
                console.error('头像上传错误:', error);
                message.error('头像上传失败: ' + (error.message || '未知错误'));
            }
        }
    };


    return (
        <div>
            <Tabs defaultActiveKey="1" style={{ paddingTop: '20px' }} centered>
                <TabPane tab="个人信息" key="1">
                    <Card style={cardStyle}>
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '20px',
                            padding: '20px 0',
                            borderBottom: '1px solid #f0f0f0',
                            position: 'relative'
                        }}>
                            <Upload
                                name="photo"
                                action="http://localhost:8060/api/auth/avatar"
                                showUploadList={false}
                                onChange={handleAvatarUpload}
                            >
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <Avatar
                                        size={100}
                                        icon={<UserOutlined />}
                                        src={accountData.photo ? `http://localhost:8060/${accountData.photo}` : null}
                                        style={{
                                            cursor: 'pointer',
                                            border: '2px solid #f0f0f0'
                                        }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        background: '#1890ff',
                                        borderRadius: '50%',
                                        padding: '4px',
                                        color: '#fff',
                                        cursor: 'pointer'
                                    }}>
                                        <CameraOutlined />
                                    </div>
                                </div>
                            </Upload>
                        </div>
                        {Object.entries(accountData)
                            .filter(([key]) => fieldLabels[key]) // 只显示定义的字段
                            .map(([key, value]) => (
                                <div key={key} style={{ margin: '15px 0', padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
                                    <Space align="baseline" style={{ width: '100%', justifyContent: 'space-between' }}>
                                        <div>
                                            <strong style={{ color: '#333', fontSize: '16px' }}>
                                                {fieldLabels[key]}:
                                            </strong>
                                            <span style={{ color: '#666', marginLeft: '10px' }}>
                                                {key === 'address' ? formatAddress(value) : (value || '')}
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
                        {accountData.address && (
                            <div style={{ margin: '15px 0', padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
                                <Space align="baseline" style={{ width: '100%', justifyContent: 'space-between' }}>
                                    <div>
                                        <strong style={{ color: '#333', fontSize: '16px' }}>
                                            {fieldLabels.tokenBalance}:
                                        </strong>
                                        <span style={{ color: '#666', marginLeft: '10px' }}>
                                            {tokenBalance} QZK
                                        </span>
                                    </div>
                                </Space>
                            </div>
                        )}
                    </Card>
                </TabPane>

                <TabPane tab="编辑信息" key="2">
                    <Card style={cardStyle} title="编辑个人信息">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleUpdateUserInfo}
                            initialValues={{
                                username: accountData.username,
                                email: accountData.email,
                                uid: userData.id,
                            }}
                        >
                            <Form.Item
                                name="username"
                                label="用户名"
                                rules={[{ required: true, message: '请输入用户名!' }]}
                            >
                                <Input prefix={<EditOutlined />} placeholder="用户名" />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label="邮箱"
                                rules={[
                                    { required: true, message: '请输入邮箱!' },
                                    { type: 'email', message: '请输入有效的邮箱地址!' }
                                ]}
                            >
                                <Input prefix={<EditOutlined />} placeholder="邮箱" />
                            </Form.Item>

                            {/* 可以根据需要添加更多字段 */}

                            <Form.Item>
                                <Button type="primary" htmlType="submit" icon={<EditOutlined />}>
                                    更新信息
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </TabPane>

                <TabPane tab="修改密码" key="3">
                    <Card style={cardStyle} title="修改密码">
                        {(
                            <Alert
                                message="安全提示"
                                description={`如果您初次钱包进行登录并设置了邮箱账户，那么您的邮箱默认密码为钱包地址的后六位。为了账户安全，建议您立即修改密码。`}
                                type="warning"
                                showIcon
                                style={{ marginBottom: '20px' }}
                            />
                        )}
                        <Form
                            layout="vertical"
                            onFinish={handleChangePassword}
                        >
                            <Form.Item
                                name="oldPassword"
                                label="旧密码"
                                rules={[{ required: true, message: '请输入旧密码!' }]}
                            >
                                <Input.Password />
                            </Form.Item>
                            <Form.Item
                                name="newPassword"
                                label="新密码"
                                rules={[{ required: true, message: '请输入新密码!' }]}
                            >
                                <Input.Password />
                            </Form.Item>
                            <Form.Item
                                name="confirmPassword"
                                label="确认新密码"
                                dependencies={['newPassword']}
                                hasFeedback
                                rules={[
                                    { required: true, message: '请确认新密码!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('两次输入的密码不一致!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    修改密码
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default PersonComponent;

