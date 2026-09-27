// src/utils/jwt.js
// Pourquoi 2 tokens ?
// Access token (15min)  → envoyé dans chaque requête API
// Refresh token (7j)    → stocké en cookie httpOnly, utilisé pour renouveler l'access token
// Si l'access token est volé → expire en 15min max
// Si le refresh token est volé → expire en 7j + on peut le révoquer en DB

import jwt from "jsonwebtoken"

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  })
}

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  })
}

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
}