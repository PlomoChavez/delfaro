const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.get('/api/usuarios', usuarioController.obtenerUsuarios);

module.exports = router;
