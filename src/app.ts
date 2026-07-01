import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { ENV } from './config/env';
import authRoutes from './routes/authRoutes';
import todoRoutes from './routes/todoRoutes';
import { errorHandler, AppError } from './middleware/errorHandler';
import { swaggerSpec } from './config/swagger';

const app = express();

// helmet con CSP desactivado solo para la ruta de Swagger
// (swagger-ui-express usa inline scripts que helmet bloquearía por defecto)
app.use('/api/docs', helmet({ contentSecurityPolicy: false }));
app.use(helmet());

app.use(morgan(ENV.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

app.get('/', (_req, res) => {
    res.json({ message: '¡API de To-Do funcionando!' });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

app.use((req, _res, next) => {
    next(new AppError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
});

app.use(errorHandler);

export default app;