const translations = {
  bread: 'Pan',
  sweet: 'Dulce',
  special: 'Especial',
  general: 'General'
};

function toSpanish(key) {
  return translations[key] || key;
}

module.exports = { toSpanish };
