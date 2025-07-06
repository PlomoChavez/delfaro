const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const cors = require("cors");
app.use(cors());

app.use(express.json());

// Importa las rutas
const procesosAutomatizadosRoutes = require("./routes/procesosAutomatizadosRoutes");
const apisRoutes = require("./routes/apisRoutes");

// Usa las rutas
app.use(procesosAutomatizadosRoutes);
app.use(apisRoutes);

app.use("/files", express.static(path.join(__dirname, "files")));

app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});
