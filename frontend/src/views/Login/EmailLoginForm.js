import React, { useState } from 'react';
import useApi from "../../Hooks/useApi";
import useLocalStore from "../../Hooks/useLocalStore";
import { message } from 'antd';
function EmailLoginForm({ onBack, onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState(null);
    const [loading, setLoading] = useState(false);
    const api = useApi();
    const localStore = useLocalStore();

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post("/api/auth/email-login", {
                email,
                password,
            });
            if (response) {
                localStore.saveLoginData(response.data, true);
                localStore.setPageData('user', response.data.user);
                localStorage.setItem("isAuthenticated", true);
                onLoginSuccess(response.data.user_role_id);
            }
        } catch (error) {
            console.error('登录失败:', error);
            if (error.response?.status === 405) {
                message.error(error.response.data.message || '请求方法不允许');
            } else {
                message.error(error.response?.data?.message || '登录失败，请重试');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>邮箱登录</h2>
            <form onSubmit={handleEmailLogin}>
                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="email"
                        placeholder="请输入邮箱"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                        }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="password"
                        placeholder="请输入密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                        }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '10px',
                        color: 'white',
                        backgroundColor: '#007bff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginBottom: '10px'
                    }}
                >
                    {loading ? '登录中...' : '登录'}
                </button>
                <button
                    onClick={onBack}
                    style={{
                        width: '100%',
                        padding: '10px',
                        color: '#007bff',
                        backgroundColor: 'white',
                        border: '1px solid #007bff',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    返回
                </button>
                {loginError && (
                    <p style={{ color: '#ff6b6b', textAlign: 'center', marginTop: '10px' }}>
                        {loginError}
                    </p>
                )}
            </form>
        </div>
    );
}

export default EmailLoginForm;