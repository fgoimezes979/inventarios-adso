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

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api", routes);

// =============================
// 🔥 FUNCIÓN AUTOMÁTICA
// =============================
const initSystem = async () => {

  console.log("⚙️ Inicializando sistema...");

  // Corregido: 'code' ahora está DENTRO de defaults
  await Client.findOrCreate({
    where: { name: 'CLIENTE GENERAL' },
    defaults: { 
      name: 'CLIENTE GENERAL',
      code: 'GEN-001' 
    }
  });

  // Corregido: Limpieza de campos duplicados y estructura correcta
  await Location.findOrCreate({
    where: { name: 'PRINCIPAL' },
    defaults: { 
      name: 'PRINCIPAL'
      // Si Location pide un code obligatorio, agrégalo aquí:
      // code: 'LOC-001'
    }
  });

  console.log("✅ Datos base listos");
};

const startServer = async () => {

  // 🚀 levantar servidor SIEMPRE
  app.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 Servidor iniciado en puerto ${process.env.PORT || 3000}`);
  });

  try {

    // 🔥 conectar BD
    await sequelize.authenticate();
    console.log('✅ Base de datos conectada');

    // 🔥 datos base
    await initSystem();

  } catch (error) {

    console.error('❌ Error MySQL:', error);

  }

};
};

startServer();
