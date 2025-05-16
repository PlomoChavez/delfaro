const express = require('express');
const router = express.Router();

router.get('/api/procesos/bot', (req, res) => {
  // Lógica para obtener pólizas
  res.json([{ id: 1, poliza: 'ABC123' }]);
});

module.exports = router;
