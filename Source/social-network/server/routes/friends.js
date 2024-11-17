const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const friendController = require('../controllers/friendController');
const User = require('../models/User');
const RedisClient = require('../utils/RedisClient');
const Neo4jService = require('../services/neo4jService');
const DataSyncService = require('../services/DataSyncService');

// 添加好友隐私检查中间件
const checkFriendPrivacy = async (req, res, next) => {
    try {
        const targetUser = await User.findById(req.params.userId);
        const requestingUser = await User.findById(req.userId);

        if (!targetUser || !requestingUser) {
            return res.status(404).json({ message: '用户不存在' });
        }

        // 检查是否是好友关系
        const areFriends = requestingUser.friends.includes(targetUser._id);

        // 如果是好友，允许访问基本信息
        if (areFriends) {
            req.isFriend = true;
            return next();
        }

        // 如果不是好友且是私密账户，限制信息访问
        if (targetUser.privacy.profileVisibility === 'private') {
            return res.status(403).json({ 
                message: '该用户是私密账户',
                limitedInfo: {
                    _id: targetUser._id,
                    username: targetUser.username,
                    avatar: targetUser.avatar,
                    isPrivate: true
                }
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
};

// 获取好友请求列表
router.get('/requests', auth, friendController.getFriendRequests);

// 获取好友列表
router.get('/', auth, friendController.getFriends);

// 获取好友推荐
router.get('/suggestions', auth, friendController.getFriendSuggestions);

// 发送好友请求
router.post('/request/:userId', auth, friendController.sendFriendRequest);

// 处理好友请求
router.post('/requests/:requestId/:action', auth, friendController.handleFriendRequest);

// 删除好友
router.delete('/:friendId', auth, friendController.removeFriend);

// 添加获取好友状态的路由
router.get('/status/:userId', auth, checkFriendPrivacy, friendController.getFriendshipStatus);

// Neo4j 相关路由
router.get('/recommendations/graph', auth, friendController.getFriendRecommendationsWithGraph);
router.get('/analytics/social-circle', auth, friendController.getSocialCircleAnalytics);

// 添加新的社交分析路由
router.get('/analysis/common/:targetUserId', auth, friendController.getCommonFriendsAnalysis);
router.get('/analysis/circles', auth, friendController.getSocialCirclesAnalysis);
router.get('/analysis/influence', auth, friendController.getSocialInfluenceAnalysis);


// 智能好友推荐
router.get('/smart-recommendations', auth, friendController.getSmartRecommendations);

// 社交路径分析
router.get('/connection-path/:targetUserId', auth, friendController.getConnectionPath);

// 兴趣群组发现
router.get('/social-groups', auth, friendController.getSocialGroups);

// 用户活跃度分析
router.get('/activity', auth, friendController.getUserActivity);

// 关系强度分析
router.get('/relationship-strength/:targetUserId', auth, friendController.getRelationshipStrength);

// 添加数据同步路由
router.post('/sync', auth, friendController.syncFriendsData);
router.post('/sync/all', auth, friendController.syncAllData);

module.exports = router; 