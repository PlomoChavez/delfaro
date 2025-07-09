const express = require("express");
const router = express.Router();
const procesosAutomatizadosController = require("../controllers/procesosAutomatizadosController");

router.post(
  "/api/procesos/bot",
  procesosAutomatizadosController.obtenerTituloGoogle
);

module.exports = router;
