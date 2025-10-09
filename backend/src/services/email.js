function armarCorreoVerificacion({ email, codigo }) {
  const asunto = 'Verificación de correo — Super Milas';
  const texto = `Tu código de verificación es: ${codigo}. Vence en 15 minutos.`;
  // En producción: integrar proveedor (SendGrid, SES, etc.)
  return { para: email, asunto, texto };
}

module.exports = { armarCorreoVerificacion };