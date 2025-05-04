const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "API - Gestión de usuarios",
      version: "1.0.0",
      description: "API práctica final de Programación Web II",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "Diego González",
        email: "diegobitoglz@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3096/api",
        description: "Servidor local de desarrollo",
      },
    ],
  },
  apis: ["./routes/*.js"], // Asegúrate de documentar tus rutas con comentarios Swagger
};

module.exports = swaggerJSDoc(options);
