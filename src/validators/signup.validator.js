// src/validators/signup.validator.js
// Validates the company onboarding ("sign up") form before it reaches the controller.
// No auth/session logic here — just input validation.

const VALID_CATEGORIES = [
  "MANUFACTURING",
  "RETAIL_DISTRIBUTION",
  "LOGISTICS",
  "FINANCIAL_SERVICES",
]

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateSignup = (req, res, next) => {
  const {
    enterprise_name,
    category,
    full_name,
    work_email,
    password,
    sites,
  } = req.body

  const errors = []

  if (!enterprise_name || typeof enterprise_name !== "string" || !enterprise_name.trim()) {
    errors.push("enterprise_name is required")
  }

  if (!category || !VALID_CATEGORIES.includes(category)) {
    errors.push(`category is required and must be one of: ${VALID_CATEGORIES.join(", ")}`)
  }

  if (!full_name || typeof full_name !== "string" || !full_name.trim()) {
    errors.push("full_name is required")
  }

  if (!work_email || !emailRegex.test(work_email)) {
    errors.push("A valid work_email is required")
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    errors.push("password is required and must be at least 6 characters")
  }

  if (sites !== undefined) {
    if (!Array.isArray(sites)) {
      errors.push("sites must be an array")
    } else {
      sites.forEach((site, i) => {
        if (!site || !site.site_name || !site.site_name.trim()) {
          errors.push(`sites[${i}].site_name is required`)
        }
      })
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors })
  }

  next()
}
