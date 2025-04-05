import React, {useEffect, useState ,useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useApi from "../../Hooks/useApi";
import useLocalStore from "../../Hooks/useLocalStore";
import Web3 from "web3"; 
import EmailLoginForm from "./EmailLoginForm";

function LoginPage() {
    const [loginError, setLoginError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userRoleId, setUserRoleId] = useState(null);
    const api = useApi();
    const localStore = useLocalStore();
    const navigate = useNavigate();
    const [nonce, setNonce] = useState(""); 
    const isNonceFetched = useRef(false); 
    const [showEmailLogin, setShowEmailLogin] = useState(false);
    
    // 请求后端生成一个随机的 nonce
    const getNonce = async () => {
        try {
            const response = await api.post("/api/auth/nonce");
            setNonce(response.data[0]); 
            console.log("response.data.nonce:",response.data[0])
        } catch (error) {
            console.error("Error fetching nonce:", error);
            setLoginError("无法获取登录数据，请重试");
        }
    };

   const signNonce = async (nonce) => {
    try {
        // 检查 MetaMask 是否安装
        if (typeof window.ethereum !== "undefined") {
            const web3 = new Web3(window.ethereum);

            // 请求用户授权
            await window.ethereum.request({ method: "eth_requestAccounts" });

            // 获取钱包账户列表
            const accounts = await web3.eth.getAccounts();
            if (accounts.length === 0) {
                throw new Error("No account found in the wallet");
            }

            const selectedAccount = accounts[0]; // 获取第一个账户
            console.log("Selected account:", selectedAccount);

            // 使用 personal_sign 进行签名
            const signature = await window.ethereum.request({
                method: "personal_sign",
                params: [web3.utils.utf8ToHex(nonce), selectedAccount],
            });
            
            console.log("signuture:",signature)
            // 发送签名和账户信息到后端
            await handleLogin(signature, selectedAccount);
        } else {
            alert("请安装 MetaMask 或其他以太坊钱包插件！");
        }
    } catch (error) {
        console.error("签名过程出错:", error);
    }
};

    // 发送签名数据给后端进行验证
    const handleLogin = async (signature, publicKey) => {
        setLoading(true);
        try {
            const response = await api.post("/api/auth/login", {
                publicKey,
                signature,
            });
            if (response) {
                console.log("respose.data:",response.data)
                localStore.saveLoginData(response.data, true);
                localStore.setPageData('user', response.data.user);
                setUserRoleId(response.data.user_role_id);
                localStorage.setItem("isAuthenticated", true);
                // booleanUser();
            }
        } catch (error) {
            console.error('登录失败:', error);
            setLoginError(error.response ? error.response.data : error.message);
        } finally {
            setLoading(false);
        }
    };

    const booleanUser = () => {
        try {
            api.get('/api/account').then((response) => {
                localStorage.setItem("userData", JSON.stringify(response.data));
                if (userRoleId === 1) {
                    navigate('/');
                } else if (userRoleId === 2) {
                    navigate('/user');
                }
            });
        } catch (error) {
            console.error('Error fetching account data:', error);
        }
    };

    useEffect(() => {
        if (!isNonceFetched.current) {
            getNonce();
            isNonceFetched.current = true;
        }
    }, []);

    useEffect(() => {
        if (userRoleId) {
            booleanUser();
        }
    }, [userRoleId]);

    const handleLoginSuccess = (roleId) => {
        setUserRoleId(roleId);
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
            <div style={{
                width: '300px',
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
            }}>
                {!showEmailLogin ? (
                    <>
                        <h1>登录 - 二手交易平台</h1>
                        <button
                            onClick={() => signNonce(nonce)}
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
                            disabled={loading}
                        >
                            使用钱包登录
                        </button>
                        <button
                            onClick={() => setShowEmailLogin(true)}
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
                            使用邮箱登录
                        </button>
                        {loginError && <p style={{ color: '#ff6b6b', textAlign: 'center' }}>登录错误: {loginError}</p>}
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            没有账号？<Link to="/register">注册</Link>
                        </div>
                    </>
                ) : (
                    <EmailLoginForm
                        onBack={() => setShowEmailLogin(false)}
                        onLoginSuccess={handleLoginSuccess}
                    />
                )}
            </div>
        </div>
    );
}

export default LoginPage;
