import React, { useState } from 'react';
import { Form, message, Card, Divider, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    AuthContainer,
    StyledForm,
    StyledInput,
    StyledPassword,
    StyledButton,
    AuthLink,
    LogoContainer,
    AuthCard,
    AppStoreButtons,
    AppStoreButton,
    GetAppText,
    ButtonContent,
    ButtonOverlay
} from '../../styles/authStyles';
import logoImage from '../../assert/LOGO.png';  
import XIAZAIImage from '../../assert/xiazai.png';

// 新增 Logo 组件
const Logo = () => (
    <LogoContainer>
        <img 
            src={logoImage} 
            alt="Logo" 
            style={{ 
                height: '150px', 
                width: 'auto',  
                margin: '20px 0'
            }} 
        />
    </LogoContainer>
);

// 新增下载按钮组件
const DownloadButton = ({ image, storeName }) => (
    <AppStoreButton>
        <ButtonContent>
            <img 
                src={image}
                alt={storeName} 
                style={{ 
                    height: '35px',
                    width: 'auto',
                    objectFit: 'contain',
                    filter: 'brightness(1.1) contrast(1.1)',
                    transition: 'transform 0.2s ease'
                }} 
            />
            <ButtonOverlay />
        </ButtonContent>
    </AppStoreButton>
);

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const res = await axios.post('http://localhost:5000/api/users/login', values);
            
            console.log('登录响应:', res.data);
            
            if (!res.data.token || !res.data.user) {
                throw new Error('登录返回数据不完整');
            }

            const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24小时
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('tokenExpiry', expiryTime.toString());
            localStorage.setItem('user', JSON.stringify(res.data.user));
            
            message.success('登录成功！');
            
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 100);

        } catch (error) {
            console.error('登录错误:', error);
            message.error(error.response?.data?.message || '登录失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContainer>
            <div style={{ maxWidth: '350px', width: '100%' }}>
                <AuthCard>
                    <Logo />
                    <StyledForm onFinish={onFinish}>
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: '请输入邮箱' },
                                { type: 'email', message: '请输入有效的邮箱地址' }
                            ]}
                        >
                            <StyledInput 
                                prefix={<UserOutlined />} 
                                placeholder="邮箱" 
                            />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: '请输入密码' }]}
                        >
                            <StyledPassword 
                                prefix={<LockOutlined />} 
                                placeholder="密码"
                            />
                        </Form.Item>
                        <Form.Item>
                            <StyledButton type="primary" htmlType="submit" loading={loading} block>
                                登录
                            </StyledButton>
                        </Form.Item>
                        
                        <Divider>或</Divider>
                        
                        <AuthLink>
                            <Link to="/forgot-password">忘记密码?</Link>
                        </AuthLink>
                    </StyledForm>
                </AuthCard>

                <AuthCard style={{ marginTop: '10px' }}>
                    <AuthLink>
                        还没有账号？<Link to="/register">立即注册</Link>
                    </AuthLink>
                </AuthCard>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <GetAppText>获取应用</GetAppText>
                    <AppStoreButtons>
                        <DownloadButton 
                            image={XIAZAIImage} 
                            storeName="App Store"
                        />
                        <DownloadButton 
                            image={XIAZAIImage} 
                            storeName="Google Play"
                        />
                    </AppStoreButtons>
                </div>
            </div>
        </AuthContainer>
    );
};

export default Login; 