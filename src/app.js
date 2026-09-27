import express from "express"
import cors from "cors"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import rateLimit from "express-rate-limit"
import authRoutes from "./routes/auth.routes.js"
import signupRoutes from "./routes/signup.routes.js"
import snapshotRoutes from './routes/snapshotRoutes.js';


dotenv.config()

const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))
app.use(express.json())
app.use(cookieParser())


app.use("/api/auth", authRoutes)
app.use("/api/signup", signupRoutes)

app.use('/api', snapshotRoutes);
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV })
})


app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})


app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Internal server error" })
})

export default app