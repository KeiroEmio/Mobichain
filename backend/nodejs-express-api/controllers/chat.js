import express from 'express';
import mongoose from 'mongoose';
import { authMiddleware } from '../helpers/auth_middleware.js';
import ChatContacts from '../models/chat_contacts.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import DB from '../models/db.js';

// 创建聊天频道模型
const ChatChannelSchema = new mongoose.Schema({
  channelId: { type: String, required: true, unique: true },
  participants: [{ type: String, required: true }], // 用户ID数组
  productId: { type: String, default: null }, // 关联的商品ID
  createdAt: { type: Date, default: Date.now },
  lastMessageTime: { type: Date, default: Date.now }
});

// 创建聊天消息模型
const ChatMessageSchema = new mongoose.Schema({
  channelId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderAvatar: { type: String, default: null },
  content: { type: String, required: true },
  contentType: { type: String, default: 'text' }, // text, image, product
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

const ChatChannel = mongoose.model('ChatChannel', ChatChannelSchema);
const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'assets/uploads/chat';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 限制5MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("只支持图片文件!"));
  }
});

const router = express.Router();

// 获取用户的聊天列表
router.get('/list/:userId', async (req, res) => {
  try {
    console.log('获取聊天列表请求:', req.params.userId);
    const userId = req.params.userId;
    
    // 查找用户参与的所有聊天频道
    const channels = await ChatChannel.find({ participants: userId }).sort({ lastMessageTime: -1 });
    
    // 获取每个频道的最后一条消息和对话者信息
    const chatList = await Promise.all(channels.map(async (channel) => {
      // 获取最后一条消息
      const lastMessage = await ChatMessage.findOne({ channelId: channel.channelId })
        .sort({ timestamp: -1 })
        .limit(1);
      
      // 获取对话者ID (非当前用户的参与者)
      const otherParticipantId = channel.participants.find(id => id !== userId);
      
      console.log('otherParticipantId:', otherParticipantId);
      // 从MySQL用户表获取对话者信息
      const otherUser = await DB.User.findOne({ 
        where: { id: otherParticipantId } 
      });
      
      console.log('otherUser:', otherUser);
      // 获取未读消息数量
      const unreadCount = await ChatMessage.countDocuments({
        channelId: channel.channelId,
        senderId: { $ne: userId },
        isRead: false
      });
      
      return {
        channelId: channel.channelId,
        userId: otherParticipantId,
        username: otherUser ? otherUser.username : '未知用户',
        photo: otherUser ? otherUser.photo : null,
        lastMessage: lastMessage ? lastMessage.content : '',
        lastTime: lastMessage ? lastMessage.timestamp : channel.createdAt,
        unreadCount: unreadCount,
        productId: channel.productId
      };
    }));
    
    res.json({ success: true, data: chatList });
  } catch (error) {
    console.error('获取聊天列表失败:', error);
    res.status(500).json({ success: false, message: '获取聊天列表失败' });
  }
});

// 获取聊天消息
router.get('/messages/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.id;
    
    // 验证用户是否是该频道的参与者
    const channel = await ChatChannel.findOne({ channelId, participants: userId });
    if (!channel) {
      return res.status(403).json({ success: false, message: '无权访问此聊天' });
    }
    
    // 获取消息
    const messages = await ChatMessage.find({ channelId })
      .sort({ timestamp: 1 });
    
    // 标记消息为已读
    await ChatMessage.updateMany(
      { channelId, senderId: { $ne: userId }, isRead: false },
      { $set: { isRead: true } }
    );
    
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('获取聊天消息失败:', error);
    res.status(500).json({ success: false, message: '获取聊天消息失败' });
  }
});

// 创建新的聊天频道
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { userId1, userId2, productId } = req.body;
    
    // 生成唯一的频道ID (确保userId1和userId2的组合是唯一的，不管顺序如何)
    const participants = [userId1, userId2].sort();
    const channelId = `${participants[0]}_${participants[1]}`;
    
    // 检查频道是否已存在
    let channel = await ChatChannel.findOne({ channelId });
    
    if (!channel) {
      // 创建新频道
      channel = new ChatChannel({
        channelId,
        participants,
        productId
      });
      await channel.save();
    }
    
    // 获取对话者信息
    const User = mongoose.model('User');
    const targetUser = await User.findOne({ id: userId1 === req.user.id ? userId2 : userId1 });
    
    res.json({
      success: true,
      data: {
        channelId,
        targetUsername: targetUser ? targetUser.username : '未知用户',
        targetAvatar: targetUser ? targetUser.avatar : null
      }
    });
  } catch (error) {
    console.error('创建聊天频道失败:', error);
    res.status(500).json({ success: false, message: '创建聊天频道失败' });
  }
});

// 上传聊天图片
router.post('/upload', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '没有上传文件' });
    }
    
    const imageUrl = `/assets/uploads/chat/${req.file.filename}`;
    res.json({ success: true, url: imageUrl });
  } catch (error) {
    console.error('上传图片失败:', error);
    res.status(500).json({ success: false, message: '上传图片失败' });
  }
});

// 添加联系人并创建/更新聊天频道
router.post('/add', async (req, res) => {
  try {
    const { uid, targetUid } = req.body;
    const currentUserId = uid;
    
    // 验证目标用户ID
    if (!targetUid) {
      return res.status(400).json({ success: false, message: '目标用户ID不能为空' });
    }
    
    // 生成唯一的频道ID
    const participants = [currentUserId, targetUid].sort();
    const channelId = `${participants[0]}_${participants[1]}`;
    
    // 检查频道是否已存在
    let channel = await ChatChannel.findOne({ channelId });
    
    if (!channel) {
      channel = new ChatChannel({
        channelId,
        participants,
        createdAt: new Date(),
        lastMessageTime: new Date()
      });
      await channel.save();
    } else {
      channel.lastMessageTime = new Date();
      await channel.save();
    }
    
    res.json({ 
      success: true, 
      message: '聊天频道创建成功',
      data: {
        channelId
      }
    });
  } catch (error) {
    console.error('创建聊天频道失败:', error);
    res.status(500).json({ success: false, message: '创建聊天频道失败' });
  }
});

export default router;