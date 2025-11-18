// src/server/routes/overviewRoutes.js
import express from 'express';
import { getOverview } from '../controllers/overviewController.js';

const router = express.Router();

router.get('/', getOverview);   // GET /api/overview

export default router;