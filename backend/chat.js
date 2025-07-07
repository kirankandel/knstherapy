/* -------------------------------------------------------------------------- */
/*  Dependencies                                                              */
/* -------------------------------------------------------------------------- */
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

/* -------------------------------------------------------------------------- */
/*  Basic server setup                                                        */
/* -------------------------------------------------------------------------- */
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // In production, specify allowed origins here
    methods: ['GET', 'POST'],
  },
});

const PORT = 3500;
const users = {}; // Stores connected users: { userId: socketId }

app.use(cors());

app.get('/', (req, res) => {
  res.send('✅ Socket.IO server is running.');
});

/* -------------------------------------------------------------------------- */
/*  Socket.IO logic                                                           */
/* -------------------------------------------------------------------------- */
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  /* --------------------------- USER REGISTRATION -------------------------- */
  socket.on('register', (userId) => {
    users[userId] = socket.id;
    console.log(`👤 User registered: ${userId}`);
  });

  /* ------------------------------ MESSAGING ------------------------------- */
  socket.on('send-message', ({ to, from, message }) => {
    const recipientSocket = users[to];
    const payload = {
      from,
      message,
      time: new Date().toLocaleTimeString(),
    };

    if (recipientSocket) {
      io.to(recipientSocket).emit('receive-message', payload);
      console.log(`💬 ${from} ➜ ${to}: ${message}`);
    } else {
      socket.emit('receive-message', {
        from: 'System',
        message: `User ${to} is not connected.`,
        time: new Date().toLocaleTimeString(),
      });
    }
  });

  /* ---------------------------- DISCONNECTION ----------------------------- */
  socket.on('disconnect', () => {
    const disconnectedUser = Object.keys(users).find((key) => users[key] === socket.id);

    if (disconnectedUser) {
      delete users[disconnectedUser];
      console.log(`❌ User disconnected: ${disconnectedUser}`);
    } else {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    }
  });
});

/* -------------------------------------------------------------------------- */
/*  Start the server                                                          */
/* -------------------------------------------------------------------------- */
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
