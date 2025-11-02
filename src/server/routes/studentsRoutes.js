import express from "express";
import { getStudentsByDriver } from "../controllers/studentsController.js";

const router = express.Router();

router.get("/driver/:driverID", getStudentsByDriver);
export default router;