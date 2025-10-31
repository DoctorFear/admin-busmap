import express from "express";
import {
  getSchedules,
  addSchedule,
  editSchedule,
  removeSchedule,
} from "../controllers/scheduleController.js";

const router = express.Router();

router.get("/", getSchedules);
router.post("/", addSchedule);
router.put("/:id", editSchedule);
router.delete("/:id", removeSchedule);

export default router;
