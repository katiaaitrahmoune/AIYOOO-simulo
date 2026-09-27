

import pg from "pg"
import dotenv from "dotenv"

dotenv.config()
const { Pool } = pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
 
    rejectUnauthorized: false,
  },
})


pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle database client:")
  console.error(err)
  // Do NOT rethrow/exit — the pool will create a new connection on next query.
})

// Test de connexion au démarrage
pool.connect((err, client, release) => {
 if (err) {
  console.error("❌ Database connection error:")
  console.error(err)
} else {
    console.log("✅ Database connected")
    release()
  }
})

// query() = la fonction qu'on utilisera partout pour faire des requêtes SQL
// Exemple : await query("SELECT * FROM users WHERE id = $1", [userId])
export const query = (text, params) => pool.query(text, params)

export default pool