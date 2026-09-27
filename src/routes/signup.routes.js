// src/routes/signup.routes.js
// Company onboarding ("sign up") — no auth/session logic, just saves the form to the DB.

import { Router } from "express"
import { signup } from "../controllers/signup.controller.js"
import { validateSignup } from "../validators/signup.validator.js"

const router = Router()

// POST /api/signup
router.post("/", validateSignup, signup)

export default router
