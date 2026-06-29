import { getDb } from '../config/database';

export interface Todo {
    id: number;
    userId: number;
    title: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTodoInput {
    userId: number;
    title: string;
    description?: string;
}

export interface UpdateTodoInput {
    title?: string;
    description?: string;
}

export interface PaginatedTodos {
    data: Todo[];
    page: number;
    limit: number;
    total: number;
}

interface TodoRow {
    id: number;
    user_id: number;
    title: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

function mapRowToTodo(row: TodoRow): Todo {
    return {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        description: row.description,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function createTodo(input: CreateTodoInput): Todo {
    const db = getDb();

    const stmt = db.prepare(`
        INSERT INTO todos (user_id, title, description)
        VALUES (?, ?, ?)
    `);
    const result = stmt.run(input.userId, input.title, input.description ?? null);

    const created = getTodoById(Number(result.lastInsertRowid));
    if (!created) {
        throw new Error('No se pudo recuperar el todo recién creado');
    }

    return created;
}

export function getTodoById(id: number): Todo | undefined {
    const db = getDb();

    const row = db.prepare('SELECT * FROM todos WHERE id = ?').get(id) as TodoRow | undefined;

    return row ? mapRowToTodo(row) : undefined;
}

export function getTodosByUser(userId: number, page: number, limit: number): PaginatedTodos {
    const db = getDb();
    const offset = (page - 1) * limit;

    const rows = db
        .prepare(
            `
            SELECT * FROM todos WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
            `
        )
        .all(userId, limit, offset) as TodoRow[];

    const countResult = db
        .prepare('SELECT COUNT(*) as total FROM todos WHERE user_id = ?')
        .get(userId) as { total: number };

    return {
        data: rows.map(mapRowToTodo),
        page,
        limit,
        total: countResult.total,
    };
}

export function updateTodo(id: number, userId: number, input: UpdateTodoInput): Todo | null {
    const db = getDb();

    const fields: string[] = [];
    const values: (string | null)[] = [];

    if (input.title !== undefined) {
        fields.push('title = ?');
        values.push(input.title);
    }
    if (input.description !== undefined) {
        fields.push('description = ?');
        values.push(input.description ?? null);
    }

    if (fields.length === 0) {
        const existing = getTodoById(id);
        return existing && existing.userId === userId ? existing : null;
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');

    const result = db
        .prepare(`UPDATE todos SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`)
        .run(...values, id, userId);

    if (result.changes === 0) return null;

    return getTodoById(id) ?? null;
}

export function deleteTodo(id: number, userId: number): boolean {
    const db = getDb();

    const result = db.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?').run(id, userId);

    return result.changes > 0;
}