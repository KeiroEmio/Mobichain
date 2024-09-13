import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useApi from "../../Hooks/useApi";
import useLocalStore from "../../Hooks/useLocalStore";

function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [user_role_id, setUser_role_id] = useState(null)
    const [loginError, setLoginError] = useState(null);
    const api = useApi();
    const localStore = useLocalStore();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        const loginUrl = "/api/auth/login";
        try {
            const response = await api.post(loginUrl, { username, password });
            if (response) {
                console.log('response:', response)
                localStore.saveLoginData(response.data, true);
                localStore.setPageData('user', response.data.user);
                // setUser_role_id(data.user)

                setUser_role_id(response.data.user_role_id)
                console.log('response.data.user_role_id:', user_role_id)
                localStorage.setItem("isAuthenticated", true);
                console.log('Redirecting to home...');
                console.log(localStorage.getItem('isAuthenticated'));
                booleanUser();
                console.log('Navigation command sent');
            }
        } catch (error) {
            console.error('Login failed:', error);
            setLoginError(error.response ? error.response.data : error.message);
        } finally {
            setLoading(false);
        }
    };

    const booleanUser = async () => {
        try {
            await api.get('/api/account').then((response) => {
                console.log('respins:', response)
                localStorage.setItem("userData", JSON.stringify(response.data));
                if (user_role_id === 1) {
                    navigate('/');
                } else if (user_role_id === 2) {
                    navigate('/user');
                }
            })

        } catch (error) {
            console.error('Error fetching account data:', error);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            backgroundImage: 'url("../../asserts/beij.webp")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
            <div style={{ width: '300px', padding: '20px', backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
                <h1>登录 - 二手交易平台</h1>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="username">用户名</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="password">密码</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <button type="submit" style={{ padding: '10px', color: 'white', backgroundColor: '#007bff', border: 'none', borderRadius: '4px', cursor: 'pointer' }} disabled={loading}>
                        登录
                    </button>
                </form>
                {loginError && <p style={{ color: '#ff6b6b', textAlign: 'center' }}>登录错误: {loginError}</p>}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    没有账号？<Link to="/register">注册</Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
