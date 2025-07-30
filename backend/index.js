const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const cors = require("cors");
app.use(cors());
// Si usas express.json()
app.use(express.json({ limit: "10mb" }));

// Importa las rutas
const apisRoutes = require("./routes/apisRoutes");

// Usa las rutas
app.use(apisRoutes);

app.use("/files", express.static(path.join(__dirname, "files")));

app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});
