const Joi = require('joi');

function validar(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        error: 'Validación fallida',
        detalles: error.details.map(d => ({ mensaje: d.message, camino: d.path }))
      });
    }
    req[property] = value;
    next();
  };
}

module.exports = { validar, Joi };