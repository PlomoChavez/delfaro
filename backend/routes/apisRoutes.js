const express = require('express');
const router = express.Router();

const catalogoController = require('../controllers/catalogoController');
const companiaController = require('../controllers/companiaController');
const companiaRepresentantesController = require('../controllers/companiaRepresentantesController');
const clienteController = require('../controllers/clienteController');
const usuarioController = require('../controllers/usuarioController');
const polizasController = require('../controllers/polizasController');
const polizaAseguradosController = require('../controllers/polizaAseguradosController');
const robotController = require('../controllers/robotController');
const catalogosController = require('../controllers/catalogosController');
const cotizacionesController = require('../controllers/cotizacionesController');
const authController = require('../controllers/authController');

// Login
router.post('/api/login', authController.login);



router.post('/api/catalogos/ramos', (req, res) => catalogosController.getCatalogo(req, res, 'ramos'));
router.post('/api/wizard/cotizacion/companias', (req, res) => cotizacionesController.getCompniasByRamo(req, res));


// Catálogos Generales
router.post('/api/catalogo/actividades/get', (req, res) => catalogoController.getAll(req, res, 'actividades'));
router.post('/api/catalogo/actividades/delete', (req, res) => catalogoController.delete(req, res, 'actividades'));
router.post('/api/catalogo/actividades', (req, res) => catalogoController.createOrUpdate(req, res, 'actividades'));

router.post('/api/catalogo/estatus-cliente/get', (req, res) => catalogoController.getAll(req, res, 'estatus_cliente'));
router.post('/api/catalogo/estatus-cliente/delete', (req, res) => catalogoController.delete(req, res, 'estatus_cliente'));
router.post('/api/catalogo/estatus-cliente', (req, res) => catalogoController.createOrUpdate(req, res, 'estatus_cliente'));

router.post('/api/catalogo/metodo-pago/get', (req, res) => catalogoController.getAll(req, res, 'metodos_de_pago'));
router.post('/api/catalogo/metodo-pago/delete', (req, res) => catalogoController.delete(req, res, 'metodos_de_pago'));
router.post('/api/catalogo/metodo-pago', (req, res) => catalogoController.createOrUpdate(req, res, 'metodos_de_pago'));

router.post('/api/catalogo/ramos/get', (req, res) => catalogoController.getAll(req, res, 'ramos'));
router.post('/api/catalogo/ramos/delete', (req, res) => catalogoController.delete(req, res, 'ramos'));
router.post('/api/catalogo/ramos', (req, res) => catalogoController.createOrUpdate(req, res, 'ramos'));

router.post('/api/catalogo/tipo-vencimiento/get', (req, res) => catalogoController.getAll(req, res, 'tipos_de_vencimiento'));
router.post('/api/catalogo/tipo-vencimiento/delete', (req, res) => catalogoController.delete(req, res, 'tipos_de_vencimiento'));
router.post('/api/catalogo/tipo-vencimiento', (req, res) => catalogoController.createOrUpdate(req, res, 'tipos_de_vencimiento'));

router.post('/api/catalogo/tipo-usuario/get', (req, res) => catalogoController.getAll(req, res, 'tipos_de_usuarios'));
router.post('/api/catalogo/tipo-usuario/delete', (req, res) => catalogoController.delete(req, res, 'tipos_de_usuarios'));
router.post('/api/catalogo/tipo-usuario', (req, res) => catalogoController.createOrUpdate(req, res, 'tipos_de_usuarios'));

// Compañías
router.post('/api/companias/get', companiaController.getAll);
router.post('/api/companias/create', companiaController.create);
router.post('/api/companias/update', companiaController.update);
router.post('/api/companias/delete', companiaController.delete);
router.post('/api/companias/ramos', companiaController.getRamos);
router.post('/api/companias/ramos/update', companiaController.updateRamos);
router.post('/api/companias/productos/get', companiaController.getCompaniaProductos);
router.post('/api/companias/productos', companiaController.createOrUpdateCompaniaProductos);
// router.post('/api/companias/productos/delete', companiaController.deleteCompaniaProductos);

// Compañías Representantes
router.post('/api/companias/representantes/get', companiaRepresentantesController.getAll);
router.post('/api/companias/representantes', companiaRepresentantesController.createOrUpdate);
router.post('/api/companias/representantes/delete', companiaRepresentantesController.delete);

// Clientes
router.post('/api/clientes/get', clienteController.getAll);
router.post('/api/clientes/create', clienteController.createOrUpdate);
router.post('/api/clientes/update', clienteController.createOrUpdate);
router.post('/api/clientes/delete', clienteController.delete);

// Usuarios
router.post('/api/usuarios/get', usuarioController.getAll);
router.post('/api/usuarios/create', usuarioController.create);
router.post('/api/usuarios/update', usuarioController.update);
router.post('/api/usuarios/delete', usuarioController.delete);

// Usuarios Claves
router.post('/api/usuario/claves/get', usuarioController.getAllClaves);
router.post('/api/usuario/claves', usuarioController.createOrUpdateClaves);
router.post('/api/usuario/claves/delete', usuarioController.deleteClaves);

// Usuarios Team
router.post('/api/usuario/team/get', usuarioController.getAllTeam);
router.post('/api/usuario/team', usuarioController.createOrUpdateTeam);
router.post('/api/usuario/team/delete', usuarioController.deleteTeam);

// Pólizas
router.post('/api/polizas/wizard', polizasController.getRecursosWizard);
router.post('/api/polizas/get', polizasController.getAll);
router.post('/api/polizas/create', polizasController.create);
router.post('/api/polizas/update', polizasController.update);
router.post('/api/polizas/delete', polizasController.delete);

// Pólizas Asegurados
router.post('/api/polizas/asegurados/get', polizaAseguradosController.getAll);
router.post('/api/polizas/asegurados', polizaAseguradosController.createOrUpdate);
// router.post('/api/polizas/asegurados/cliente', polizaAseguradosController.createOfCliente);
router.post('/api/polizas/asegurados/delete', polizaAseguradosController.delete);

// Pólizas Recibos e Historial
router.post('/api/polizas/recibos', polizasController.getRecibos);
router.post('/api/polizas/historial', polizasController.getHistorial);

// // Robot
// router.post('/api/robot', robotController.startRobot);

// Catálogos Específicos
router.post('/api/catalogos/tipos-usuarios', (req, res) => catalogoController.getCatalogo(req, res, 'tipos-usuarios'));
router.post('/api/catalogos/formas-pagos', (req, res) => catalogosController.getCatalogo(req, res, 'formas-pagos'));
router.post('/api/catalogos/tipo-vencimiento', (req, res) => catalogosController.getCatalogo(req, res, 'tipos-vencimiento'));
router.post('/api/catalogos/metodos-pago', (req, res) => catalogosController.getCatalogo(req, res, 'metodos-pago'));
router.post('/api/catalogos/moneda', (req, res) => catalogosController.getCatalogo(req, res, 'monedas'));
router.post('/api/catalogos/ramos', (req, res) => catalogosController.getCatalogo(req, res, 'ramos'));
router.post('/api/catalogos/ramosByCompania', (req, res) => catalogosController.getCatalogo(req, res, 'ramosByCompania'));
router.post('/api/catalogos/estatus-polizas', (req, res) => catalogosController.getCatalogo(req, res, 'estatus-poliza'));
router.post('/api/catalogos/companias', (req, res) => catalogosController.getCatalogo(req, res, 'companias'));
router.post('/api/catalogos/estados', (req, res) => catalogosController.getCatalogo(req, res, 'estados'));

module.exports = router;
