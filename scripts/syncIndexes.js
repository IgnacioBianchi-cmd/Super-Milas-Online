// backend/src/scripts/syncIndexes.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const mongoose = require('mongoose');

// Importa TODOS los modelos que tengan índices
const Sucursal = require('../models/Sucursal');
const Pedido   = require('../models/Pedido');
// Agrega otros modelos con índices únicos si corresponde:
let Usuario = null;
try {
  Usuario = require('../models/Usuario'); // si no existe, seguimos sin él
} catch (_) {}

(async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI no definido en .env');

    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB');

    const tasks = [Sucursal.syncIndexes(), Pedido.syncIndexes()];
    if (Usuario) tasks.push(Usuario.syncIndexes());

    const results = await Promise.allSettled(tasks);
    results.forEach((r, i) => {
      const name = ['Sucursal', 'Pedido', 'Usuario'][i] || `Modelo#${i}`;
      if (r.status === 'fulfilled') {
        console.log(`✔️  ${name}.syncIndexes ok`);
      } else {
        console.warn(`⚠️  ${name}.syncIndexes error:`, r.reason?.message || r.reason);
      }
    });

    await mongoose.disconnect();
    console.log('🏁 Índices sincronizados.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();