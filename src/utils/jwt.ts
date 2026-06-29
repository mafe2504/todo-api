import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';
import { ENV } from '../config/env';

const EXPIRES_IN = '24h';
const ALGORITHM = 'HS256';

export class InvalidTokenError extends Error {
    constructor(message = 'Token inválido o expirado') {
        super(message);
        this.name = 'InvalidTokenError';
    }
}

export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, ENV.JWT_SECRET, {
        expiresIn: EXPIRES_IN,
        algorithm: ALGORITHM,
    });
}

export function verifyToken(token: string): JWTPayload {
    let decoded: string | jwt.JwtPayload;

    try {
        decoded = jwt.verify(token, ENV.JWT_SECRET, {
            algorithms: [ALGORITHM],
        });
    } catch {
        throw new InvalidTokenError();
    }

    if (typeof decoded === 'string' || decoded.userId === undefined || decoded.email === undefined) {
        throw new InvalidTokenError('Token con payload inesperado');
    }

    return {
        userId: decoded.userId,
        email: decoded.email,
    };
}