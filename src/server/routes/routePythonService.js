// src/server/routes/routePythonService.js
import express from "express";
import { sendListBusStopLatLngToPython } from "../controllers/testPythonController.js";

const router = express.Router();

// Call python service to get data
// GET /test-python
router.get("/", sendListBusStopLatLngToPython);


export default router;
