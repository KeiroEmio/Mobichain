import React from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs, Form, Input, Button, Card, message } from 'antd'; // 导入 message 组件
import useApi from '../../Hooks/useApi'; // 确保路径正确

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
    const accountData = location.state?.accountData;
    const api = useApi(); // 使用API钩子

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

    return (
        <div>
            <Tabs defaultActiveKey="1" style={{ paddingTop: '20px' }} centered>
                <TabPane tab="个人信息" key="1">
                    <Card style={cardStyle}>
                        {Object.entries(accountData).map(([key, value]) => (
                            <p key={key} style={{ margin: '10px 0', fontSize: '16px' }}>
                                <strong style={{ color: '#555', marginRight: '10px' }}>{key}:</strong>
                                <span style={{ color: '#777' }}>{value !== null ? value.toString() : 'N/A'}</span>
                            </p>
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
