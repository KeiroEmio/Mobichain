import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useApi from "../../Hooks/useApi";
import useLocalStore from "../../Hooks/useLocalStore";

function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");

    const api = useApi();
    const localStore = useLocalStore();
    const navigate = useNavigate();

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            alert("密码和确认密码不匹配");
            return;
        }

        const jsonData = {
            email,
            password,
            confirm_password: confirmPassword
        };

        try {
            const response = await api.post("/api/auth/register", jsonData);
            if (response.data && response.data.token) {
                localStore.saveLoginData(response.data, true);
                alert('注册成功');
                navigate('/');
            }
        } catch (error) {
            console.error('注册失败:', error);
            alert("注册失败，请检查网络或联系管理员。");
        }
    };

    const handleBack = () => {
        navigate(-1); // 返回上一页
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
            <h1 style={{ color: 'blue' }}>二手手机平台-注册页面</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px', alignItems: 'center' }}>
                <input style={{ padding: '10px', margin: '10px 0', width: '100%' }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input style={{ padding: '10px', margin: '10px 0', width: '100%' }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <input style={{ padding: '10px', margin: '10px 0', width: '100%' }} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <button style={{ padding: '10px', color: 'white', backgroundColor: '#007bff', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' }} type="submit">注册</button>
                <button style={{ padding: '10px', marginTop: '10px', color: 'white', backgroundColor: 'gray', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' }} onClick={handleBack}>返回</button>
            </form>
        </div>
    );
}

export default RegisterPage;
