const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://e-commerce-api-ykmv.onrender.com"
    : "http://localhost:5000";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "e-commerce API",
      version: "3.2.1",
      description: "Dokumentasi API untuk sistem e-commerce",
    },
    servers: [
      {
        url: baseUrl,
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "jwt",
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: [path.join(__dirname, "../controllers/*.js")],
};

const swaggerSpec = swaggerJsDoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("swagger docs tersedia di http://localhost:5000/api-docs");
}

module.exports = setupSwagger;
