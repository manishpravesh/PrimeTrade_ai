const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const path = require('node:path');
const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const adminRoutes = require('./routes/admin.routes');
const { openApiSpec } = require('./docs/openapi');
const { errorHandler, notFoundHandler } = require('./middleware/error-handler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200
  })
);

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };
