import express from "express";
import {
  getStudentsByDriver,
  updateStudentStatusController,
  getStudentsByParent,
  uploadStudentPhoto,
  upload
} from "../controllers/studentsController.js";

const router = express.Router();

router.get("/driver/:driverID", getStudentsByDriver); 
router.put("/status/:studentID", updateStudentStatusController); 
router.get("/parent/:parentId", getStudentsByParent);
router.post("/photo/:studentId", upload.single('photo'), uploadStudentPhoto);
export default router;
