// src/server/routes/routeRoutes.js
import express from "express";
import { getRouteStops } from "../controllers/routeController.js";

const router = express.Router();

// GET /api/routes/:id/stops
router.get("/:id/stops", getRouteStops);

export default router;
