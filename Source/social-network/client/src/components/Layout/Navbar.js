import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Popover } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { HomeOutlined, UserOutlined, LogoutOutlined, BellOutlined, HeartOutlined, HeartFilled, TeamOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Badge } from 'antd';
import axios from 'axios';
import { formatTime } from '../../utils/timeFormat';

const { Header } = Layout;

const StyledHeader = styled(Header)`
  background-color: ${theme.colors.dark} !important;
  border-bottom: 1px solid ${theme.colors.border};
  position: fixed;
  width: 100%;
  z-index: 1000;
  top: 0;
`;

const Logo = styled.div`
  float: left;
  color: ${theme.colors.text.white};
  font-size: 20px;
  font-weight: 600;
  margin-right: 40px;
`;

const StyledMenu = styled(Menu)`
  background-color: ${theme.colors.dark};
  border-bottom: none;
  
  .ant-menu-item {
    color: ${theme.colors.text.white} !important;
    
    &:hover {
      color: ${theme.colors.success} !important;
    }
    
    &.ant-menu-item-selected {
      background-color: ${theme.colors.hover.dark} !important;
      
      &::after {
        border-bottom-color: ${theme.colors.success} !important;
      }
    }
  }
`;

const NotificationPopover = styled.div`
  width: 300px;
  max-height: 400px;
  overflow-y: auto;

  .notification-header {
    padding: 12px 16px;
    font-weight: 600;
    border-bottom: 1px solid ${theme.colors.border};
  }

  .notification-item {
    padding: 8px 16px;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: ${theme.colors.backgroundHover};
    }

    .avatar {
      margin-right: 12px;
    }

    .content {
      flex: 1;
      font-size: 14px;
      
      .username {
        font-weight: 600;
      }
      
      .time {
        font-size: 12px;
        color: ${theme.colors.text.secondary};
      }
    }
  }
`;

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [notifications, setNotifications] = useState([]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/friends/requests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('获取通知失败:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const notificationContent = (
        <NotificationPopover>
            <div className="notification-header">
                通知
            </div>
            {notifications.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center' }}>
                    暂无新通知
                </div>
            ) : (
                notifications.map(notification => (
                    <div 
                        key={notification._id} 
                        className="notification-item"
                        onClick={() => navigate('/friend-requests')}
                    >
                        <Avatar 
                            className="avatar"
                            src={notification.sender.avatar} 
                            icon={<UserOutlined />}
                        />
                        <div className="content">
                            <span className="username">{notification.sender.username}</span>
                            {' 向你发送了好友请求'}
                            <div className="time">
                                {formatTime(notification.createdAt)}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </NotificationPopover>
    );

    return (
        <StyledHeader>
            <Logo>GREEN NET</Logo>
            <StyledMenu mode="horizontal" selectedKeys={[window.location.pathname]}>
                <Menu.Item key="/" icon={<HomeOutlined />}>
                    <Link to="/">首页</Link>
                </Menu.Item>
                {user ? (
                    <>
                        <Menu.Item key="/friends" icon={<TeamOutlined />}>
                            <Link to="/friends">好友</Link>
                        </Menu.Item>
                        <Menu.Item key="/profile" icon={<UserOutlined />}>
                            <Link to="/profile">个人主页</Link>
                        </Menu.Item>
                        <Menu.Item key="/notifications">
                            <Popover 
                                content={notificationContent}
                                trigger="click"
                                placement="bottom"
                                overlayStyle={{ padding: 0 }}
                            >
                                <Badge count={notifications.length}>
                                    {notifications.length > 0 ? <HeartFilled /> : <HeartOutlined />}
                                </Badge>
                            </Popover>
                        </Menu.Item>
                        <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                            退出
                        </Menu.Item>
                    </>
                ) : (
                    <Menu.Item key="/login">
                        <Link to="/login">登录</Link>
                    </Menu.Item>
                )}
            </StyledMenu>
        </StyledHeader>
    );
};

export default Navbar; 