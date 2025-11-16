// src/server/routes/assignmentRoutes.js
import express from 'express';
import { 
  getAllAssignmentsCtrl, 
  createAssignmentCtrl, 
  updateAssignmentCtrl, 
  deleteAssignmentCtrl 
} from '../controllers/assignmentController.js';

const router = express.Router();

router.get('/', getAllAssignmentsCtrl);
router.post('/', createAssignmentCtrl);
router.put('/:id', updateAssignmentCtrl);
router.delete('/:id', deleteAssignmentCtrl);

export default router;