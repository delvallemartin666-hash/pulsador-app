const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

let buzzerState = {
  active: true,
  list: []
};

io.on('connection', (socket) => {
  socket.emit('state-update', buzzerState);

  socket.on('buzz', (data) => {
    if (!buzzerState.active) return;

    const yaRegistro = buzzerState.list.some(p => p.name.toLowerCase() === data.name.toLowerCase());
    if (!yaRegistro) {
      const entrada = {
        name: data.name,
        group: data.group,
        time: new Date().toLocaleTimeString('es-CO', { hour12: false })
      };
      buzzerState.list.push(entrada);
      io.emit('state-update', buzzerState);
    }
  });

  socket.on('admin-reset', () => {
    buzzerState.list = [];
    buzzerState.active = true;
    io.emit('state-update', buzzerState);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor en línea en el puerto ${PORT}`);
});

