import { initDb } from './config/database';
import { ENV } from './config/env';
import app from './app';

initDb();

app.listen(ENV.PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${ENV.PORT}`);
    console.log(`Documentación disponible en http://localhost:${ENV.PORT}/api/docs`);
});