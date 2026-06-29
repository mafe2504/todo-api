import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    PORT: z.coerce.number().int().positive().default(3000),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres (genera uno con crypto.randomBytes)'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DB_PATH: z.string().default(path.join(process.cwd(), 'database.sqlite')),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Variables de entorno inválidas:');
    for (const issue of parsed.error.issues) {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
}

export const ENV = parsed.data;