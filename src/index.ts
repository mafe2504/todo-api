import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { initDb } from './config/database';
import { ENV } from './config/env';
import authRoutes from './routes/authRoutes';
import todoRoutes from './routes/todoRoutes';
import { errorHandler, AppError } from './middleware/errorHandler';

initDb();

const app = express();

app.use(helmet());
app.use(morgan(ENV.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

app.get('/', (_req, res) => {
    res.json({ message: '¡API de To-Do funcionando!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Catch-all: cualquier ruta no definida arriba cae aquí
app.use((req, _res, next) => {
    next(new AppError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
});

// Siempre al final: centraliza la respuesta de cualquier error de la app
app.use(errorHandler);

app.listen(ENV.PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${ENV.PORT}`);
});