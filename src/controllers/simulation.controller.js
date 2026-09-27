// src/controllers/simulation.controller.js

import { runSimulationAgent } from "../services/geminiAgent.service.js";

export async function handleSimulationQuery(req, res) {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({
        error: "Missing 'question' string in request body",
      });
    }

    const answer =
      await runSimulationAgent(question);

    return res.status(200).json({
      answer,
    });

  } catch (err) {
    console.error(
      "Simulation agent error:",
      err
    );

    return res.status(500).json({
      error:
        err.message ??
        "Internal error",
    });
  }
}