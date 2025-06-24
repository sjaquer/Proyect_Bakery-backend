// Basic request body validator middleware
// Usage: router.post('/', validate({ name: { required: true } }), handler)

function validate(schema = {}) {
  return (req, res, next) => {
    const errors = [];
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      // Required field check
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      // Skip further checks if value is undefined or null
      if (value === undefined || value === null) continue;

      // Type validations
      if (rules.type) {
        const type = rules.type;
        if (type === 'email' && typeof value === 'string' && !/^\S+@\S+\.\S+$/.test(value)) {
          errors.push(`${field} must be a valid email`);
        } else if (type === 'number' && typeof value !== 'number' && isNaN(Number(value))) {
          errors.push(`${field} must be a number`);
        } else if (type === 'integer' && !Number.isInteger(Number(value))) {
          errors.push(`${field} must be an integer`);
        } else if (type === 'boolean' && typeof value !== 'boolean') {
          if (value !== 'true' && value !== 'false' && value !== 1 && value !== 0) {
            errors.push(`${field} must be a boolean`);
          }
        } else if (type === 'array' && !Array.isArray(value)) {
          errors.push(`${field} must be an array`);
        }
      }

      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of ${rules.enum.join(', ')}`);
      }

      // Custom regex
      if (rules.regex && typeof value === 'string' && !rules.regex.test(value)) {
        errors.push(`${field} is invalid`);
      }
    }

    if (errors.length) {
      return res.status(400).json({ errors });
    }
    next();
  };
}

module.exports = validate;
