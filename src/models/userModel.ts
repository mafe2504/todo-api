import { getDb } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export interface User {
    id: number;
    name: string;
    email: string;
    createdAt: string;
}

export interface UserWithPasswordHash extends User {
    passwordHash: string;
}

export interface CreateUserInput {
    name: string;
    email: string;
    passwordHash: string;
}

export class EmailAlreadyExistsError extends AppError {
    constructor(email: string) {
        super(409, `El email "${email}" ya está registrado`);
        this.name = 'EmailAlreadyExistsError';
    }
}

interface UserRow {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    created_at: string;
}

type PublicUserRow = Omit<UserRow, 'password_hash'>;

function mapRowToUser(row: PublicUserRow): User {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        createdAt: row.created_at,
    };
}

function mapRowToUserWithHash(row: UserRow): UserWithPasswordHash {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        createdAt: row.created_at,
        passwordHash: row.password_hash,
    };
}

export function createUser(input: CreateUserInput): User {
    const db = getDb();

    const stmt = db.prepare(`
        INSERT INTO users (name, email, password_hash)
        VALUES (?, ?, ?)
    `);

    try {
        const result = stmt.run(input.name, input.email, input.passwordHash);

        const created = getUserById(Number(result.lastInsertRowid));
        if (!created) {
            throw new Error('No se pudo recuperar el usuario recién creado');
        }

        return created;
    } catch (err: any) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            throw new EmailAlreadyExistsError(input.email);
        }
        throw err;
    }
}

export function getUserByEmail(email: string): UserWithPasswordHash | undefined {
    const db = getDb();

    const row = db
        .prepare('SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?')
        .get(email) as UserRow | undefined;

    return row ? mapRowToUserWithHash(row) : undefined;
}

export function getUserById(id: number): User | undefined {
    const db = getDb();

    const row = db
        .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
        .get(id) as PublicUserRow | undefined;

    return row ? mapRowToUser(row) : undefined;
}