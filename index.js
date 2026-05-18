// index.js
require('dotenv').config();

console.log("PORT =>", process.env.PORT);
console.log("JWT_SECRET =>", process.env.JWT_SECRET);

const express = require('express');
const cors = require('cors');

const { sequelize } = require('./src/models/model-index');
const { Client, Location } = require('./src/models/model-index');

const routes = require('./src/routes/api.routes');

const app = express();

// =============================
// Middlewares
// =============================
app.use(cors());
app.use(express.json());

// =============================
// Rutas
// =============================
app.use("/api", routes);

// =============================
// 🔥 FUNCIÓN AUTOMÁTICA
// =============================
const initSystem = async () => {

  console.log("⚙️ Inicializando sistema...");

  await Client.findOrCreate({
    where: { name: 'CLIENTE GENERAL' },
    defaults: {
      name: 'CLIENTE GENERAL',
      code: 'GEN-001'
    }
  });

  await Location.findOrCreate({
    where: { name: 'PRINCIPAL' },
    defaults: {
      name: 'PRINCIPAL',
        code: 'LOC001'
    }
  });

  console.log("✅ Datos base listos");
};

// =============================
// 🔥 ARRANQUE SERVIDOR
// =============================
const startServer = async () => {

  // 🚀 EL SERVIDOR ARRANCA SIEMPRE
  // aunque MySQL falle
  app.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 Servidor iniciado en puerto ${process.env.PORT || 3000}`);
  });

  try {

    // 🔥 conectar BD
    await sequelize.authenticate();
    console.log('✅ Base de datos conectada');

    // 🔥 crear datos base
    await initSystem();

  } catch (error) {

    console.error('❌ Error MySQL:', error);

  }

};

startServer();
