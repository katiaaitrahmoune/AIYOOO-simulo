// src/controllers/signup.controller.js
// "Sign up" = fill in the company onboarding form and save it to the DB.
// No auth/session/JWT logic — just insert enterprise + sites + user, return what was created.

import bcrypt from "bcryptjs"
import pool from "../config/db.js"

export const signup = async (req, res) => {
  const {
    enterprise_name,
    category,
    employee_count,
    monthly_revenue_approx,
    erp_system_in_use,
    official_website,
    main_cost_driver,
    optimization_goal,
    sites,
    full_name,
    work_email,
    password,
  } = req.body

  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    // Reject duplicate signups up front (work_email is UNIQUE on users anyway,
    // but checking first gives a clean 409 instead of a raw DB error)
    const existing = await client.query(
      "SELECT user_id FROM users WHERE work_email = $1",
      [work_email]
    )
    if (existing.rows[0]) {
      await client.query("ROLLBACK")
      return res.status(409).json({ error: "An account with this work email already exists" })
    }

    const siteList = Array.isArray(sites) && sites.length > 0
      ? sites
      : [{ site_name: "Main Site", address: null, city: null, country: null }]

    // 1. Create the enterprise
    const enterpriseResult = await client.query(
      `INSERT INTO enterprises
        (enterprise_name, category, employee_count, monthly_revenue_approx,
         erp_system_in_use, official_website, site_count, main_cost_driver, optimization_goal)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING enterprise_id, enterprise_name, category, created_at`,
      [
        enterprise_name,
        category,
        employee_count ?? null,
        monthly_revenue_approx ?? null,
        erp_system_in_use ?? null,
        official_website ?? null,
        siteList.length,
        main_cost_driver ?? null,
        optimization_goal ?? null,
      ]
    )
    const enterprise = enterpriseResult.rows[0]

    // 2. Create its site(s)
    const createdSites = []
    for (const site of siteList) {
      const siteResult = await client.query(
        `INSERT INTO enterprise_sites (enterprise_id, site_name, address, city, country)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING site_id, site_name, address, city, country`,
        [
          enterprise.enterprise_id,
          site.site_name,
          site.address ?? null,
          site.city ?? null,
          site.country ?? null,
        ]
      )
      createdSites.push(siteResult.rows[0])
    }

    // 3. Create the signing-up user, attached to that enterprise
    const passwordHash = await bcrypt.hash(password, 12)
    const userResult = await client.query(
      `INSERT INTO users (enterprise_id, full_name, work_email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, full_name, work_email, role, created_at`,
      [enterprise.enterprise_id, full_name, work_email, passwordHash]
    )
    const user = userResult.rows[0]

    await client.query("COMMIT")

    res.status(201).json({
      message: "Account created successfully",
      enterprise,
      sites: createdSites,
      user,
    })
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("Signup error:", err)
    res.status(500).json({ error: "Internal server error" })
  } finally {
    client.release()
  }
}
