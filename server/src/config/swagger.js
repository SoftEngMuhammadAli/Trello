import path from 'path';
import { fileURLToPath } from 'url';
import swaggerJsdoc from 'swagger-jsdoc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Trello Clone API',
      version: '1.0.0',
      description: 'REST API documentation for the MERN Trello clone backend.',
    },
    tags: [
      { name: 'Auth' },
      { name: 'Users' },
      { name: 'Workspaces' },
      { name: 'Boards' },
      { name: 'Lists' },
      { name: 'Cards' },
      { name: 'Comments' },
      { name: 'Search' },
    ],
    servers: [{ url: 'http://localhost:5000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            details: { nullable: true },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.resolve(__dirname, '../routes/*.js')],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
