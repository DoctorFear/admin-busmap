import express from 'express';
import { getParents, createParent, updateParent, deleteParent, getStudentBuses, getProfile, updateProfile } from '../controllers/parentController.js';

const router = express.Router();

router.get('/', getParents);
router.post('/', createParent);
router.put('/:id', updateParent);
router.delete('/:id', deleteParent);
// Lấy danh sách buses/routes mà con của parent đang đi
router.get('/:parentId/student-buses', getStudentBuses);
// Lấy/Cập nhật thông tin profile của phụ huynh trong trang Parent
router.get('/profile/:parentId', getProfile);
router.put('/profile/:parentId', updateProfile);
export default router;