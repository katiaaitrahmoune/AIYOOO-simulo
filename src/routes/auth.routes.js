// src/routes/auth.routes.js
// Définit les endpoints de l'auth
// Chaque route = validator (vérifie les inputs) + controller (logique métier)

import { Router } from "express"
import { register, login, refreshToken, logout, getMe } from "../controllers/auth.controller.js"
import { validateRegister, validateLogin } from "../validators/auth.validator.js"
import { protect } from "../middleware/protect.js"

const router = Router()

// POST /api/auth/register
router.post("/register", validateRegister, register)

// POST /api/auth/login
router.post("/login", validateLogin, login)

// POST /api/auth/refresh — renouvelle l'access token
router.post("/refresh", refreshToken)

// POST /api/auth/logout
router.post("/logout", logout)

// GET /api/auth/me — retourne l'user connecté (route protégée)
router.get("/me", protect, getMe)

export default router