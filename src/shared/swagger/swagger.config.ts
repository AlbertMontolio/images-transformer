import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Image Processing Service API',
      version: '1.0.0',
      description: 'API documentation for the Image Processing Service',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/image/infraestructure/routes/*.ts'], // Path to the API routes
};

export const specs = swaggerJsdoc(options); 