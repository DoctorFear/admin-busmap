import express from "express";
import {
  getSchedules,
  addSchedule,
  editSchedule,
  removeSchedule,
  getSchedulesByDriverID,
  checkTripStatus
} from "../controllers/scheduleController.js";

const router = express.Router();

router.get("/", getSchedules);
router.post("/", addSchedule);
router.put("/:id", editSchedule);
router.delete("/:id", removeSchedule);
router.get("/driver/:driverID", getSchedulesByDriverID);
router.put("/status/:tripID", checkTripStatus);
export default router;
