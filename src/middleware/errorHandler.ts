import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public isOperational = true
    ) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export function errorHandler(
    err: Error | AppError | ZodError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    if (err instanceof ZodError) {
        res.status(400).json({
            message: 'Datos de entrada inválidos',
            errors: err.issues.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            })),
        });
        return;
    }

    if (err instanceof AppError) {
        if (!err.isOperational) {
            console.error('Error no operacional:', err);
        }

        res.status(err.statusCode).json({
            message: err.message,
        });
        return;
    }

    console.error('Unexpected error:', err);
    res.status(500).json({
        message: 'Internal server error',
    });
}