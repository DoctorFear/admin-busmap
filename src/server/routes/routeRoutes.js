// src/server/routes/routeRoutes.js
import express from "express";
import { getRouteStops, getRoutes, getAllRoutesToCheckExistedInBusStopController } from "../controllers/routeController.js";

const router = express.Router();

// GET /api/routes
router.get("/", getRoutes);

// GET all routes in BusStop to check existing routes
router.get("/bus-stops", getAllRoutesToCheckExistedInBusStopController);

// GET /api/routes/:id/stops
router.get("/:id/stops", getRouteStops);

export default router;
