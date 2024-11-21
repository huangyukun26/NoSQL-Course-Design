import React, { useState } from 'react';
import { Form, message, Card } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  AuthContainer,
  StyledForm,
  StyledInput,
  StyledPassword,
  StyledButton,
  AuthLink,
  Divider
} from '../../styles/authStyles';

const Register = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            setLoading(true);
            console.log('发送注册请求:', values);
            
            const res = await axios.post('http://localhost:5000/api/users/register', values);
            
            console.log('注册响应:', res.data);
            
            if (!res.data.token || !res.data.sessionId || !res.data.user) {
                throw new Error('注册返回数据不完整');
            }

            sessionStorage.setItem('token', res.data.token);
            sessionStorage.setItem('sessionId', res.data.sessionId);
            sessionStorage.setItem('user', JSON.stringify(res.data.user));
            sessionStorage.setItem('tokenExpiry', new Date().getTime() + (24 * 60 * 60 * 1000));

            message.success('注册成功！');
            await navigate('/');
            window.location.reload();

        } catch (error) {
            console.error('注册错误:', error);
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else if (error.message) {
                message.error(error.message);
            } else {
                message.error('注册失败，请稍后重试');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContainer>
            <Card title="创建账号" style={{
                width: '100%',
                maxWidth: '350px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
                <StyledForm onFinish={onFinish}>
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: '请输入用户名' }]}
                    >
                        <StyledInput prefix={<UserOutlined />} placeholder="用户名" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: '请输入邮箱' },
                            { type: 'email', message: '请输入有效的邮箱地址' }
                        ]}
                    >
                        <StyledInput prefix={<MailOutlined />} placeholder="邮箱" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: '请输入密码' },
                            { min: 6, message: '密码至少6个字符' }
                        ]}
                    >
                        <StyledPassword prefix={<LockOutlined />} placeholder="密码" />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: '请确认密码' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('两次输入的密码不一致'));
                                },
                            }),
                        ]}
                    >
                        <StyledPassword 
                            prefix={<LockOutlined />} 
                            placeholder="确认密码"
                        />
                    </Form.Item>
                    <Form.Item>
                        <StyledButton type="primary" htmlType="submit" block loading={loading}>
                            注册
                        </StyledButton>
                    </Form.Item>
                    
                    <Divider>
                        <span>或者</span>
                    </Divider>
                    
                    <AuthLink>
                        已有账号？<Link to="/login">立即登录</Link>
                    </AuthLink>
                </StyledForm>
            </Card>
        </AuthContainer>
    );
};

export default Register; 