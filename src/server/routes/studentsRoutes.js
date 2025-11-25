import express from "express";
import {
  getStudentsByDriver,
  updateStudentStatusController,
  getStudentsByParent
} from "../controllers/studentsController.js";

const router = express.Router();

router.get("/driver/:driverID", getStudentsByDriver); 
router.put("/status/:studentID", updateStudentStatusController); 
router.get("/parent/:parentId", getStudentsByParent);
export default router;
