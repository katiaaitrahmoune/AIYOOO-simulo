

import bcrypt from "bcryptjs"
import { query } from "../config/db.js"
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js"


export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body

    
    const existing = await query(
      "SELECT id FROM users WHERE email = $1 OR username = $2",
      [email, username]
    )
    if (existing.rows[0]) {
      return res.status(409).json({ error: "Email or username already taken" })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

   
    const { rows } = await query(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, role, xp, level, rank_title`,
      [username, email, hashedPassword]
    )
    const user = rows[0]

   
    const accessToken  = generateAccessToken({ id: user.id, role: user.role })
    const refreshToken = generateRefreshToken({ id: user.id })

    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, refreshToken]
    )

  
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    })

    res.status(201).json({
      message: "Account created successfully",
      accessToken,
      user,
    })

  } catch (err) {
    console.error("Register error:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Cherche le user
    const { rows } = await query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    )
    const user = rows[0]

    // Message générique — ne pas dire si c'est l'email ou le password qui est faux
    // Ça évite l'énumération des comptes (security best practice)
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    if (user.is_banned) {
      return res.status(403).json({ error: "Account banned" })
    }

    // Compare le password avec le hash
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Génère les tokens
    const accessToken  = generateAccessToken({ id: user.id, role: user.role })
    const refreshToken = generateRefreshToken({ id: user.id })

    // Sauvegarde le refresh token en DB
    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, refreshToken]
    )

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({
      message: "Login successful",
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        rank_title: user.rank_title,
      },
    })

  } catch (err) {
    console.error("Login error:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

// ── REFRESH TOKEN ─────────────────────────────────────────────────────────────
export const refreshToken = async (req, res) => {
  try {
    // Récupère le refresh token depuis le cookie
    const token = req.cookies.refreshToken
    if (!token) {
      return res.status(401).json({ error: "No refresh token" })
    }

    // Vérifie la signature JWT
    const decoded = verifyRefreshToken(token)

    // Vérifie que le token existe en DB (pas révoqué)
    const { rows } = await query(
      "SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()",
      [token]
    )
    if (!rows[0]) {
      return res.status(401).json({ error: "Invalid or expired refresh token" })
    }

    // Génère un nouveau access token
    const user = await query(
      "SELECT id, role FROM users WHERE id = $1",
      [decoded.id]
    )

    const accessToken = generateAccessToken({
      id: user.rows[0].id,
      role: user.rows[0].role,
    })

    res.json({ accessToken })

  } catch (err) {
    res.status(401).json({ error: "Invalid refresh token" })
  }
}

// ── LOGOUT ────────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken
    if (token) {
      // Supprime le refresh token de la DB → révocation immédiate
      await query("DELETE FROM refresh_tokens WHERE token = $1", [token])
    }
    // Efface le cookie
    res.clearCookie("refreshToken")
    res.json({ message: "Logged out successfully" })
  } catch (err) {
    res.status(500).json({ error: "Internal server error" })
  }
}

// ── GET ME ────────────────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  // req.user est attaché par le middleware protect
  res.json({ user: req.user })
}