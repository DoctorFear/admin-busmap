import express from 'express';
import { getParents, createParent, updateParent, deleteParent, getStudentBuses } from '../controllers/parentController.js';

const router = express.Router();

router.get('/', getParents);
router.post('/', createParent);
router.put('/:id', updateParent);
router.delete('/:id', deleteParent);
// Lấy danh sách buses/routes mà con của parent đang đi
router.get('/:parentId/student-buses', getStudentBuses);

export default router;