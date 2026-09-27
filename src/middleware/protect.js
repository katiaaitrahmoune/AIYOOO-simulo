

import { verifyAccessToken } from "../utils/jwt.js"
import { query } from "../config/db.js"

export const protect = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" })
    }

    const token = authHeader.split(" ")[1]

  
    const decoded = verifyAccessToken(token)

  
    const { rows } = await query(
      "SELECT id, username, email, role, xp, level, wins, losses, rank_title, is_banned FROM users WHERE id = $1",
      [decoded.id]
    )

    if (!rows[0]) {
      return res.status(401).json({ error: "User no longer exists" })
    }

    if (rows[0].is_banned) {
      return res.status(403).json({ error: "Account banned" })
    }


    req.user = rows[0]
    next()

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" })
    }
    return res.status(401).json({ error: "Invalid token" })
  }
}


export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(" or ")}`
      })
    }
    next()
  }
}