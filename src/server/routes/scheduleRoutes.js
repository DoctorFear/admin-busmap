import express from "express";
import {
  getSchedules,
  addSchedule,
  editSchedule,
  removeSchedule,
  getSchedulesByDriverID,
  checkTripStatus,
  startTrip,
  getActiveBuses
} from "../controllers/scheduleController.js";

const router = express.Router();

router.get("/", getSchedules);
router.get("/active-buses", getActiveBuses); // NEW: Lấy buses đang hoạt động hôm nay
router.post("/", addSchedule);
router.put("/:id", editSchedule);
router.delete("/:id", removeSchedule);
router.get("/driver/:driverID", getSchedulesByDriverID);
router.put("/status/:tripID", checkTripStatus);
router.post("/start/:tripID", startTrip); 
export default router;