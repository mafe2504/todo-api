import { Request, Response, NextFunction } from 'express';
import {
    createTodo,
    getTodoById,
    getTodosByUser,
    updateTodo,
    deleteTodo,
} from '../models/todoModel';
import { createTodoSchema, updateTodoSchema, paginationSchema, idParamSchema } from '../schemas';
import { AppError } from '../middleware/errorHandler';

export function create(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = createTodoSchema.parse(req.body);
        const userId = req.user!.userId;

        const todo = createTodo({
            userId,
            title: parsed.title,
            description: parsed.description,
        });

        res.status(201).json(todo);
    } catch (error) {
        next(error);
    }
}

export function list(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = paginationSchema.parse(req.query);
        const userId = req.user!.userId;

        const result = getTodosByUser(userId, parsed.page, parsed.limit);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

export function getOne(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = idParamSchema.parse(req.params);
        const userId = req.user!.userId;

        const todo = getTodoById(id);
        if (!todo || todo.userId !== userId) {
            throw new AppError(404, 'Tarea no encontrada');
        }

        res.json(todo);
    } catch (error) {
        next(error);
    }
}

export function update(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = idParamSchema.parse(req.params);
        const userId = req.user!.userId;
        const parsed = updateTodoSchema.parse(req.body);

        const updated = updateTodo(id, userId, parsed);
        if (!updated) {
            throw new AppError(404, 'Tarea no encontrada');
        }

        res.json(updated);
    } catch (error) {
        next(error);
    }
}

export function remove(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = idParamSchema.parse(req.params);
        const userId = req.user!.userId;

        const deleted = deleteTodo(id, userId);
        if (!deleted) {
            throw new AppError(404, 'Tarea no encontrada');
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}