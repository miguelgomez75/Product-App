const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const { PORT, MONGODB_URI, JWT_SECRET } = require('./config');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const chatRoutes = require('./routes/chatRoutes');

const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);

// Servir frontend estático (carpeta public)
app.use(express.static(path.join(__dirname, 'public')));

// Conexión MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('MongoDB conectado'))
  .catch(err => console.error(err));

// -------- SOCKET.IO con autenticación JWT --------
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
  if(!token) return next(new Error('No token provided'));
  const raw = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
  try{
    const payload = jwt.verify(raw, JWT_SECRET);
    socket.user = payload;
    next();
  } catch(err){
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.user.username);

  // anunciar entrada
  socket.broadcast.emit('message', { user: 'system', text: `${socket.user.username} se ha unido.`});

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', { username: socket.user.username });
  });

  socket.on('message', (msg) => {
    // msg: { text }
    const payload = { user: socket.user.username, text: msg.text, createdAt: new Date() };
    io.emit('message', payload);
    // (Opcional) persistir en MongoDB si implementas un modelo Message
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('message', { user: 'system', text: `${socket.user.username} salió.`});
  });
});

// arrancar servidor
server.listen(PORT, () => {
  console.log(`Servidor arrancado en http://localhost:${PORT}`);
});
