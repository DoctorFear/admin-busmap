import express from "express";
import {
  getStudentsByDriver,
  updateStudentStatus
} from "../controllers/studentsController.js";

const router = express.Router();

router.get("/driver/:driverID", getStudentsByDriver); 
router.put("/status/:studentID", updateStudentStatus); 

export default router;
