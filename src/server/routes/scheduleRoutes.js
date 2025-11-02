import express from "express";
import {
  getSchedules,
  addSchedule,
  editSchedule,
  removeSchedule,
  getSchedulesByDriverID
} from "../controllers/scheduleController.js";

const router = express.Router();

router.get("/", getSchedules);
router.post("/", addSchedule);
router.put("/:id", editSchedule);
router.delete("/:id", removeSchedule);
router.get("/driver/:driverID", getSchedulesByDriverID);
export default router;
