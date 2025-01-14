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
  apis: ['./src/image/infraestructure/routes/*.ts'],
};

type OpenAPISpec = {
  info: {
    title: string;
    version: string;
    description?: string;
    contact?: {
        name?: string;
        email?: string;
    };
};
};

export const specs: OpenAPISpec = swaggerJsdoc(options); 