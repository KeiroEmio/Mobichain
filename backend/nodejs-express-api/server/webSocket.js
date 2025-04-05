import mongoose from "mongoose";
import DB from '../models/db.js';
// WebSocket 处理函数
const setupSocket = (io) => {
  global.onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log('WebSocket连接已建立', socket.id);
    global.chatSocket = socket;
    
    // 用户连接时，将用户ID与socket ID关联
    socket.on("add-user", (userId) => {
      console.log(`用户 ${userId} 已连接`);
      onlineUsers.set(userId, socket.id);
    });

    // 处理发送消息
    socket.on("send-msg", async (data) => {
      try {
        console.log('收到消息:', data);
        
        // 从MySQL获取发送者信息
        const sender = await DB.User.findOne({
          where: { id: data.senderId }
        });
        
        console.log('发送者信息:', sender.username);
        if (!sender) {
          throw new Error('发送者不存在');
        }
        
        // 保存消息到数据库
        const ChatMessage = mongoose.model('ChatMessage');
        const newMessage = new ChatMessage({
          channelId: data.channelId,
          senderId: data.senderId,
          senderName: sender.username,
          senderAvatar: sender.avatar,
          content: data.content,
          contentType: data.contentType || 'text',
          timestamp: new Date()
        });
        await newMessage.save();
        
        // 更新频道的最后消息时间
        const ChatChannel = mongoose.model('ChatChannel');
        await ChatChannel.updateOne(
          { channelId: data.channelId },
          { $set: { lastMessageTime: new Date() } }
        );
        
        // 发送消息给接收者
        const receiverSocketId = onlineUsers.get(data.receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("msg-receive", {
            ...data,
            id: newMessage._id,
            timestamp: newMessage.timestamp
          });
        }
        
        // 发送确认消息给发送者
        socket.emit("msg-sent", {
          id: newMessage._id,
          timestamp: newMessage.timestamp,
          tempId: data.id // 临时ID用于前端匹配
        });
        
      } catch (error) {
        console.error('处理消息失败:', error);
        socket.emit("error", { message: "消息发送失败" });
      }
    });
    
    // 标记消息为已读
    socket.on("mark-read", async (data) => {
      try {
        const { channelId, userId } = data;
        
        // 更新消息为已读
        const ChatMessage = mongoose.model('ChatMessage');
        await ChatMessage.updateMany(
          { channelId, senderId: { $ne: userId }, isRead: false },
          { $set: { isRead: true } }
        );
        
        // 通知发送者消息已读
        const channel = await mongoose.model('ChatChannel').findOne({ channelId });
        if (channel) {
          const otherUserId = channel.participants.find(id => id !== userId);
          const otherUserSocketId = onlineUsers.get(otherUserId);
          
          if (otherUserSocketId) {
            io.to(otherUserSocketId).emit("messages-read", { channelId });
          }
        }
      } catch (error) {
        console.error('标记消息已读失败:', error);
      }
    });

    // 用户断开连接
    socket.on("disconnect", () => {
      console.log('用户断开连接');
      // 从映射中移除用户
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`用户 ${userId} 已断开连接`);
          break;
        }
      }
    });
  });

  return io;
};

export default setupSocket;