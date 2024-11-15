const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    avatar: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: '',
        maxlength: 160
    },
    website: {
        type: String,
        default: ''
    },
    privacy: {
        profileVisibility: {
            type: String,
            enum: ['public', 'private', 'friends'],
            default: 'public'
        },
        showEmail: {
            type: Boolean,
            default: false
        },
        showFollowers: {
            type: Boolean,
            default: true
        },
        showFollowing: {
            type: Boolean,
            default: true
        },
        showPosts: {
            type: Boolean,
            default: true
        },
        allowTagging: {
            type: Boolean,
            default: true
        }
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    likesReceived: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    }
});

// 添加虚拟字段来计算统计数据
userSchema.virtual('stats').get(function() {
    return {
        postsCount: this.posts ? this.posts.length : 0,
        friendsCount: this.friends ? this.friends.length : 0,
        followersCount: this.followers ? this.followers.length : 0,
        followingCount: this.following ? this.following.length : 0,
        likesCount: this.likesReceived || 0
    };
});

// 确保虚拟字段在 JSON 中可见
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema); 