import React, { useState, useEffect } from 'react';
import { List, Avatar, Button, message, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import styled from 'styled-components';

const StyledList = styled(List)`
  .ant-list-item {
    padding: 16px;
    margin-bottom: 8px;
    background: white;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
  }

  .ant-list-item-meta-title {
    font-size: 16px;
  }

  .ant-list-item-meta-description {
    color: #8e8e8e;
  }
`;

const StyledAvatar = styled(Avatar)`
  width: 44px;
  height: 44px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #8e8e8e;
`;

const FriendSuggestions = ({ onUpdate }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    // 获取推荐好友列表
    const fetchSuggestions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/friends/suggestions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuggestions(response.data);
        } catch (error) {
            message.error('获取推荐好友失败');
            console.error('获取推荐好友失败:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const handleSendRequest = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/friends/request/${userId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            message.success('已发送好友请求');
            // 从推荐列表中移除已发送请求的用户
            setSuggestions(prev => prev.filter(user => user._id !== userId));
            if (onUpdate) onUpdate();
        } catch (error) {
            if (error.response?.status === 400) {
                message.warning(error.response.data.message || '已经发送过好友请求');
            } else {
                message.error('发送请求失败');
            }
            console.error('发送好友请求失败:', error);
        }
    };

    const renderUserInfo = (user) => {
        const displayInfo = {
            _id: user._id,
            username: user.username,
            avatar: user.avatar,
            bio: user.privacy?.profileVisibility === 'private' 
                ? '这是一个私密账户'
                : (user.bio || '这个人很懒，什么都没写~'),
            statistics: user.privacy?.profileVisibility === 'private'
                ? null
                : user.statistics
        };

        return (
            <List.Item.Meta
                avatar={
                    <StyledAvatar 
                        src={user.avatar ? `http://localhost:5000${user.avatar}` : null} 
                        icon={!user.avatar && <UserOutlined />}
                    />
                }
                title={
                    <span>
                        {user.username}
                        {user.privacy?.profileVisibility === 'private' && 
                            <span style={{ marginLeft: 8, color: '#8e8e8e', fontSize: 12 }}>
                                (私密账户)
                            </span>
                        }
                    </span>
                }
                description={
                    <div>
                        <div>{displayInfo.bio}</div>
                        {displayInfo.statistics && (
                            <div style={{ marginTop: 8, color: '#8e8e8e', fontSize: 12 }}>
                                {displayInfo.statistics.postsCount} 帖子 · 
                                {displayInfo.statistics.friendsCount} 好友
                            </div>
                        )}
                    </div>
                }
            />
        );
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin tip="加载中..." />
            </div>
        );
    }

    if (!suggestions.length) {
        return (
            <EmptyMessage>
                暂时没有推荐好友
            </EmptyMessage>
        );
    }

    return (
        <StyledList
            dataSource={suggestions}
            renderItem={user => (
                <List.Item
                    key={user._id}
                    actions={[
                        <Button 
                            type="primary" 
                            onClick={() => handleSendRequest(user._id)}
                            style={{ backgroundColor: '#43a047', borderColor: '#43a047' }}
                        >
                            添加好友
                        </Button>
                    ]}
                >
                    {renderUserInfo(user)}
                </List.Item>
            )}
        />
    );
};

export default FriendSuggestions; 