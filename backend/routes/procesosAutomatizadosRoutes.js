const express = require('express');
const router = express.Router();
const procesosAutomatizadosController = require('../controllers/procesosAutomatizadosController');

router.get('/api/procesos/bot', procesosAutomatizadosController.obtenerTituloGoogle);

module.exports = router;
