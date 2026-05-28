const Message = require('../models/Message');

module.exports = (io) => {
  const onlineUsers = new Map();
  io.on('connection', (socket) => {
    socket.on('join_group', ({ groupId, userId, userName }) => {
      socket.join(groupId);
      onlineUsers.set(socket.id, { userId, userName, groupId });
      socket.to(groupId).emit('user_joined', { userName, userId });
    });
    socket.on('send_message', async ({ groupId, senderId, senderName, senderAvatar, content }) => {
      try {
        const message = await Message.create({ group: groupId, sender: senderId, content });
        io.to(groupId).emit('receive_message', {
          _id: message._id,
          content: message.content,
          sender: { _id: senderId, name: senderName, avatar: senderAvatar },
          createdAt: message.createdAt,
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    socket.on('leave_group', ({ groupId }) => { socket.leave(groupId); });
    socket.on('disconnect', () => {
      const user = onlineUsers.get(socket.id);
      if (user) {
        socket.to(user.groupId).emit('user_left', { userName: user.userName });
        onlineUsers.delete(socket.id);
      }
    });
  });
};
