// src/validators/snapshotValidators.js
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateEnterpriseId(req, res, next) {
  const { enterpriseId } = req.params;

  if (!enterpriseId) {
    return res.status(400).json({ error: 'enterpriseId param is required' });
  }

  if (!UUID_REGEX.test(enterpriseId)) {
    return res.status(400).json({ error: 'enterpriseId must be a valid UUID' });
  }

  next();
}

module.exports = { validateEnterpriseId };
