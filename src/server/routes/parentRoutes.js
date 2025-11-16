import express from 'express';
import { getParents, createParent, updateParent, deleteParent } from '../controllers/parentController.js';

const router = express.Router();

router.get('/', getParents);
router.post('/', createParent);
router.put('/:id', updateParent);
router.delete('/:id', deleteParent);

export default router;