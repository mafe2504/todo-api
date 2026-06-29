import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next(new AppError(401, 'No autenticado'));
        return;
    }

    const token = authHeader.substring(7);

    try {
        req.user = verifyToken(token);
        next();
    } catch (error) {
        next(error);
    }
}