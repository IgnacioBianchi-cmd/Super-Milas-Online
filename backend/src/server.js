const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { env } = require('./config/env');
const { initSocket } = require('./sockets');

const server = http.createServer(app);
initSocket(server);

connectDB(env.MONGO_URI).then(() => {
  console.log('=== CONFIG ===');
  console.log('ENV_TARGET:', env.NODE_ENV);
  console.log('PORT:', env.PORT);
  console.log('BACKEND_BASE_URL:', `http://localhost:${env.PORT}`);
  console.log('ALLOWED_ORIGINS:', env.ALLOWED_ORIGINS);
  console.log('Timezone:', env.TZ);
  console.log('==============');

  server.listen(env.PORT, () => {
    console.log(`🚀 API escuchando en http://localhost:${env.PORT}`);
  });
});