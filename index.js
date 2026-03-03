// index.js
require('dotenv').config();

console.log("PORT =>", process.env.PORT);
console.log("JWT_SECRET =>", process.env.JWT_SECRET);
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models/model-index');
const routes = require('./src/routes/api.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api", routes);

// 🔥 SOLO AUTENTICAR (NO MODIFICAR BD)
sequelize.authenticate()
  .then(() => console.log('✅ Base de datos conectada'))
  .catch((error) => console.error('❌ Error BD:', error));

// Levantar servidor
app.listen(process.env.PORT, () => {
  console.log(`🚀 Servidor iniciado en puerto ${process.env.PORT}`);
});
