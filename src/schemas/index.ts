import { z } from 'zod';

export const idParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export const registerSchema = z.object({
    name: z.string().min(2, 'Mínimo 2 caracteres'),
    email: z.email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export const loginSchema = z.object({
    email: z.email('Email inválido'),
    password: z.string().min(1, 'Contraseña requerida'),
});

export const createTodoSchema = z.object({
    title: z.string().min(1, 'Título requerido').max(200),
    description: z.string().max(1000).optional(),
});

export const updateTodoSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
}).refine(data => data.title !== undefined || data.description !== undefined, {
    message: 'Envía al menos un campo',
});

export const paginationSchema = z.object({
    page: z.string().optional().transform(v => {
        const n = parseInt(v || '1', 10);
        return n > 0 ? n : 1;
    }),
    limit: z.string().optional().transform(v => {
        const n = parseInt(v || '10', 10);
        return n > 0 && n <= 100 ? n : 10;
    }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;