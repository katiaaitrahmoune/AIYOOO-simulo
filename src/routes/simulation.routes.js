// src/routes/simulation.routes.js
const { Router } = require("express");
const { handleSimulationQuery } = require("../controllers/simulation.controller");

const router = Router();

// POST /api/simulate  { "question": "What if Supplier X is delayed 2 weeks?" }
router.post("/simulate", handleSimulationQuery);

module.exports = router;