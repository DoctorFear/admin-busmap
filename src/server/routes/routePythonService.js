// src/server/routes/routePythonService.js
import express from "express";
import { getTestPython } from "../controllers/testPythonController.js";

const router = express.Router();

// Call python service to get data
// GET /test-python
router.get("/", getTestPython);


export default router;
