const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Importa las rutas
const loginRoutes = require('./routes/login');
const usuariosRoutes = require('./routes/usuarios');
const polizasRoutes = require('./routes/polizas');

// Usa las rutas
app.use(loginRoutes);
app.use(usuariosRoutes);
app.use(polizasRoutes);

app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});
