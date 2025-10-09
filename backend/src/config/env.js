require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 4000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/supermilas',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? JSON.parse(process.env.ALLOWED_ORIGINS)
    : ['http://localhost:3000', 'app://electron'],
  JWT_SECRET: process.env.JWT_SECRET || 'change-me',
  JWT_EXPIRES_DAYS: Number(process.env.JWT_EXPIRES_DAYS || 7),
  TIEMPO_ESTIMADO_MIN: Number(process.env.TIEMPO_ESTIMADO_MIN || 40),
  TZ: process.env.TZ || 'America/Argentina/Cordoba',

  CLAVES_SUCURSALES_JSON:
    process.env.CLAVES_SUCURSALES_JSON ||
    '{"RES":"res-secreta","COR1":"cor1-secreta","COR2":"cor2-secreta"}',

  WABA: {
    BASE_URL: process.env.WABA_BASE_URL || 'https://graph.facebook.com/v20.0',
    PHONE_NUMBER_ID: process.env.WABA_PHONE_NUMBER_ID || '',
    TOKEN: process.env.WABA_TOKEN || '',
    TEMPLATE_NAME: process.env.WABA_TEMPLATE_NAME || '',
    TEMPLATE_LANG: process.env.WABA_TEMPLATE_LANG || 'es_AR'
  }
};

try {
  env.CLAVES_SUCURSALES = JSON.parse(env.CLAVES_SUCURSALES_JSON);
} catch (e) {
  console.error('CLAVES_SUCURSALES_JSON inválido. Usando objeto vacío.');
  env.CLAVES_SUCURSALES = {};
}

module.exports = { env };