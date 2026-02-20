const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'PrimeTrade Assignment API',
    version: '1.0.0'
  },
  servers: [{ url: 'http://localhost:3000' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {
    '/api/v1/auth/register': {
      post: {
        summary: 'Register user',
        requestBody: { required: true },
        responses: { '201': { description: 'Registered' } }
      }
    },
    '/api/v1/auth/login': {
      post: {
        summary: 'Login user',
        requestBody: { required: true },
        responses: { '200': { description: 'Authenticated' } }
      }
    },
    '/api/v1/tasks': {
      get: {
        summary: 'List tasks',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Task list' } }
      },
      post: {
        summary: 'Create task',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Task created' } }
      }
    },
    '/api/v1/tasks/{id}': {
      put: {
        summary: 'Update task',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Task updated' } }
      },
      delete: {
        summary: 'Delete task',
        security: [{ bearerAuth: [] }],
        responses: { '204': { description: 'Task deleted' } }
      }
    },
    '/api/v1/admin/users': {
      get: {
        summary: 'List users (admin only)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'User list' }, '403': { description: 'Forbidden' } }
      }
    }
  }
};

module.exports = { openApiSpec };
