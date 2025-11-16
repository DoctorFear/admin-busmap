// src/server/routes/driverRoutes.js
import express from 'express';
import { 
  getDrivers, 
  createDriver, 
  updateDriver, 
  deleteDriver 
} from '../controllers/driverController.js';

const router = express.Router();

router.get('/', getDrivers);
router.post('/', createDriver);
router.put('/:id', updateDriver);
router.delete('/:id', deleteDriver);

export default router;