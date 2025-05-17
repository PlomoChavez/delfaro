const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Importa las rutas
const procesosAutomatizadosRoutes = require('./routes/procesosAutomatizadosRoutes');
const apisRoutes = require('./routes/apisRoutes');
// const usuariosRoutes = require('./routes/usuarios');
// const polizasRoutes = require('./routes/polizas');

// Usa las rutas
app.use(procesosAutomatizadosRoutes);
app.use(apisRoutes);
// app.use(usuariosRoutes);
// app.use(polizasRoutes);

app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});
