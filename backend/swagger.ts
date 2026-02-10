import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MERN Blog API',
      version: '1.0.0',
      description: 'API documentation for the MERN blog application'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'name', 'email', 'createdAt'],
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User name'
            },
            email: {
              type: 'string',
              description: 'User email'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date'
            }
          }
        },
        Post: {
          type: 'object',
          required: ['id', 'title', 'body', 'authorId', 'createdAt'],
          properties: {
            id: {
              type: 'string',
              description: 'Post ID'
            },
            title: {
              type: 'string',
              description: 'Post title'
            },
            body: {
              type: 'string',
              description: 'Post content'
            },
            image: {
              type: 'string',
              description: 'Post image URL'
            },
            authorId: {
              type: 'string',
              description: 'Author user ID'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.ts']
};

export const specs = swaggerJsdoc(options);
