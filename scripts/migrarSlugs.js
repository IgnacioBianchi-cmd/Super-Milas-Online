// backend/src/scripts/migrarSlugs.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const mongoose = require('mongoose');

// Importar modelos con rutas RELATIVAS desde scripts/
const Sucursal = require('../models/Sucursal');

(async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI no definido en .env');

    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB');

    const sucursales = await Sucursal.find({});
    let updates = 0;

    for (const s of sucursales) {
      if (!s.slug || typeof s.slug !== 'string' || !s.slug.trim()) {
        // estrategia simple: slug en minúsculas a partir del nombre, sin espacios
        const base = (s.nombre || s.codigo || '').toString().toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
          .replace(/[^a-z0-9]+/g, '-')                     // separador guion
          .replace(/(^-|-$)/g, '');

        // evitar slug vacío
        s.slug = base || `suc-${s.codigo?.toLowerCase() || s._id.toString().slice(-6)}`;
        await s.save();
        updates++;
        console.log(`✔️  Sucursal ${s.codigo}: slug -> ${s.slug}`);
      }
    }

    console.log(`\n📌 Listo. Slugs actualizados: ${updates}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();