// src/server/routes/driverRoutes.js
import express from 'express';
import { 
  getDrivers, 
  createDriver, 
  updateDriver, 
  deleteDriver,
  getDriverRoute
} from '../controllers/driverController.js';

const router = express.Router();

router.get('/', getDrivers);
router.post('/', createDriver);
router.put('/:id', updateDriver);
router.delete('/:id', deleteDriver);

// Get driver route: http://localhost:${PORT_SERVER}/api/drivers/${driverId}/route
router.get('/:driverId/route', getDriverRoute);

export default router;