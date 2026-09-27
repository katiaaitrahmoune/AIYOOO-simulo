// src/routes/simulation.routes.js
import { Router } from "express";
import { handleSimulationQuery } from "../controllers/simulation.controller.js";

const router = Router();

// POST /api/simulate  { "question": "What if Supplier X is delayed 2 weeks?" }
router.post("/simulate", handleSimulationQuery);

export default router;