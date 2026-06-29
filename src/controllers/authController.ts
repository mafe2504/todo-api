import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { createUser, EmailAlreadyExistsError, getUserByEmail,  } from '../models/userModel';
import { generateToken } from '../utils/jwt';
import { registerSchema, loginSchema } from '../schemas';
import { AppError } from '../middleware/errorHandler';

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = registerSchema.parse(req.body);

        const existing = getUserByEmail(parsed.email);
        if (existing) {
            throw new EmailAlreadyExistsError(parsed.email);
        }

        const passwordHash = await bcrypt.hash(parsed.password, 12);
        const user = createUser({
            name: parsed.name,
            email: parsed.email,
            passwordHash,
        });

        const token = generateToken({ userId: user.id, email: user.email });

        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        next(error);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = loginSchema.parse(req.body);

        const user = getUserByEmail(parsed.email);
        if (!user) {
            throw new AppError(401, 'Credenciales inválidas');
        }

        const isValid = await bcrypt.compare(parsed.password, user.passwordHash);
        if (!isValid) {
            throw new AppError(401, 'Credenciales inválidas');
        }

        const token = generateToken({ userId: user.id, email: user.email });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        next(error);
    }
}