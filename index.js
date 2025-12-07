// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models/model-index'); // importar sequelize con asociaciones
const routes = require('./src/routes/api.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", routes);

// Conexión a la base de datos
sequelize
  .sync({ force: false }) // no borra tablas existentes
  .then(() => console.log('Conectado con éxito a la base de datos'))
  .catch((error) => console.log('Error conectando a la base de datos', error));

// Levantar servidor
app.listen(process.env.PORT, () => {
  console.log('Servidor iniciado en el puerto', process.env.PORT);
});
