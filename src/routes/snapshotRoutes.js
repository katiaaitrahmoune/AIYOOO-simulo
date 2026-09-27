// src/routes/snapshotRoutes.js
import express from 'express';
import snapshotController from '../controllers/snapshotController.js';

const router = express.Router();

// IMPORTANT: static route must come first
router.get(
  '/enterprises/snapshot/latest',
  snapshotController.getLatestSnapshot
);

// Dynamic route comes after
router.get(
  '/enterprises/:enterpriseId/snapshot',
  snapshotController.getSnapshot
);

router.get(
  '/enterprises/:enterpriseId/snapshot/items',
  snapshotController.getItemsOnly
);

router.get(
  '/enterprises/:enterpriseId/snapshot/purchase-orders',
  snapshotController.getPurchaseOrdersOnly
);

router.get(
  '/enterprises/:enterpriseId/snapshot/sales-orders',
  snapshotController.getSalesOrdersOnly
);

router.get(
  '/enterprises/:enterpriseId/snapshot/suppliers',
  snapshotController.getSuppliersOnly
);

export default router;
