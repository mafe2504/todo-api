import { Router } from 'express';
import { create, list, getOne, update, remove } from '../controllers/todoController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Todas las rutas de todos requieren estar autenticado
router.use(authMiddleware);

router.post('/', create);
router.get('/', list);
router.get('/:id', getOne);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;