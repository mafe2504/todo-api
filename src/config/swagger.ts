import { OpenAPIV3 } from 'openapi-types';

export const swaggerSpec: OpenAPIV3.Document = {
    openapi: '3.0.0',
    info: {
        title: 'Todo API',
        version: '1.0.0',
        description: 'API REST para gestión de tareas con autenticación JWT.',
    },
    servers: [{ url: '/api' }],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            User: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    name: { type: 'string', example: 'Mafe' },
                    email: { type: 'string', format: 'email', example: 'mafe@test.com' },
                },
            },
            Todo: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    userId: { type: 'integer', example: 1 },
                    title: { type: 'string', example: 'Aprender Hexagonal' },
                    description: { type: 'string', nullable: true, example: 'Repasar ports y adapters' },
                    createdAt: { type: 'string', format: 'date-time', example: '2026-06-20 02:56:04' },
                    updatedAt: { type: 'string', format: 'date-time', example: '2026-06-20 02:56:04' },
                },
            },
            AuthResponse: {
                type: 'object',
                properties: {
                    token: { type: 'string', example: 'eyJhbGc...' },
                    user: { $ref: '#/components/schemas/User' },
                },
            },
            PaginatedTodos: {
                type: 'object',
                properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Todo' } },
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 10 },
                    total: { type: 'integer', example: 42 },
                },
            },
            Error: {
                type: 'object',
                properties: {
                    message: { type: 'string', example: 'Credenciales inválidas' },
                },
            },
            ValidationError: {
                type: 'object',
                properties: {
                    message: { type: 'string', example: 'Datos de entrada inválidos' },
                    errors: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                field: { type: 'string', example: 'email' },
                                message: { type: 'string', example: 'Invalid email' },
                            },
                        },
                    },
                },
            },
        },
    },
    paths: {
        '/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Registrar usuario',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'password'],
                                properties: {
                                    name: { type: 'string', example: 'Mafe' },
                                    email: { type: 'string', format: 'email', example: 'mafe@test.com' },
                                    password: { type: 'string', minLength: 8, example: 'clave12345' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Usuario creado',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
                    },
                    '400': {
                        description: 'Datos inválidos',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } },
                    },
                    '409': {
                        description: 'Email ya registrado',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                    },
                    '429': {
                        description: 'Demasiados registros',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                    },
                },
            },
        },
        '/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Iniciar sesión',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', format: 'email', example: 'mafe@test.com' },
                                    password: { type: 'string', example: 'clave12345' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Login exitoso',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
                    },
                    '401': {
                        description: 'Credenciales inválidas',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                    },
                    '429': {
                        description: 'Demasiados intentos',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                    },
                },
            },
        },
        '/todos': {
            post: {
                tags: ['Todos'],
                summary: 'Crear tarea',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title'],
                                properties: {
                                    title: { type: 'string', example: 'Aprender Hexagonal' },
                                    description: { type: 'string', example: 'Repasar ports y adapters' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Tarea creada',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/Todo' } } },
                    },
                    '400': { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
                    '401': { description: 'No autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
            get: {
                tags: ['Todos'],
                summary: 'Listar tareas (paginado)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Número de página' },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Resultados por página' },
                ],
                responses: {
                    '200': {
                        description: 'Lista de tareas',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedTodos' } } },
                    },
                    '401': { description: 'No autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/todos/{id}': {
            get: {
                tags: ['Todos'],
                summary: 'Obtener tarea por id',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    '200': { description: 'Tarea encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Todo' } } } },
                    '401': { description: 'No autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    '404': { description: 'Tarea no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
            patch: {
                tags: ['Todos'],
                summary: 'Actualizar tarea',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string', example: 'Nuevo título' },
                                    description: { type: 'string', example: 'Nueva descripción' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Tarea actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Todo' } } } },
                    '401': { description: 'No autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    '404': { description: 'Tarea no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
            delete: {
                tags: ['Todos'],
                summary: 'Eliminar tarea',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    '204': { description: 'Tarea eliminada' },
                    '401': { description: 'No autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    '404': { description: 'Tarea no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
    },
};