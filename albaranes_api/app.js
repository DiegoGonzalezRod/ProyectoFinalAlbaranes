const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const routers = require('./routes/index');
const dbConnect = require('./config/mongo');

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./doc/swagger'); // Asegúrate de que este archivo exista y esté bien configurado

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', routers);
app.use('/albaranes', express.static(path.join(__dirname, 'albaranes')));

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}`);
    console.log(`Swagger: http://localhost:${port}/api-docs`);
});

dbConnect();
