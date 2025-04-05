import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useApi from "../../Hooks/useApi";
import useLocalStore from "../../Hooks/useLocalStore";
import { message } from 'antd';
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

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB 限制
                message.error('图片大小不能超过 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                message.error('请上传图片文件');
                return;
            }
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            message.error("密码和确认密码不匹配");
            return;
        }

        try {
            let photoPath = "";
            
            if (image) {
                const photoData = new FormData();
                photoData.append('photo', image);
                try {
                    const uploadResponse = await api.upload("/api/auth/avatar", photoData);
                    console.log('头像上传成功:', uploadResponse);
                    if (uploadResponse.data && uploadResponse.data.photo) {
                        photoPath = uploadResponse.data.photo;
                    }
                } catch (photoError) {
                    console.error('头像上传失败:', photoError);
                    message.warning('头像上传失败，将使用默认头像');
                }
            }

            const registerData = {
                email,
                password,
                confirm_password: confirmPassword,
                photo: photoPath  
            };

            const registerResponse = await api.post("/api/auth/register", registerData);
            
            if (registerResponse.data && registerResponse.data.token) {
                localStore.saveLoginData(registerResponse.data, true);
                message.success('注册成功');
                navigate('/');
            }
        } catch (error) {
            console.error('注册失败:', error);
            if (error.response?.status === 405) {
                message.error(error.response.data.message || '请求方法不允许');
            } else {
                message.error(error.response?.data?.message || '注册失败，请重试');
            }
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
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    marginBottom: '20px' 
                }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '60px',
                        border: '2px dashed #ccc',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: 'pointer',
                        marginBottom: '10px'
                    }}>
                        {preview ? (
                            <img
                                src={preview}
                                alt="头像预览"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        ) : (
                            <span style={{ color: '#666' }}>点击上传头像</span>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                cursor: 'pointer'
                            }}
                        />
                    </div>
                    <span style={{ color: '#666', fontSize: '12px' }}>支持 jpg、png 格式，最大 5MB</span>
                </div>
                <input 
                    placeholder="邮箱"
                    style={{ padding: '10px', margin: '10px 0', width: '100%' }} 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <input 
                    placeholder="密码"
                    style={{ padding: '10px', margin: '10px 0', width: '100%' }} 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <input 
                    placeholder="确认密码"
                    style={{ padding: '10px', margin: '10px 0', width: '100%' }} 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                />
                <button style={{ padding: '10px', color: 'white', backgroundColor: '#007bff', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' }} type="submit">注册</button>
                <button style={{ padding: '10px', marginTop: '10px', color: 'white', backgroundColor: 'gray', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' }} onClick={handleBack}>返回</button>
            </form>
        </div>
    );
}

export default RegisterPage;
