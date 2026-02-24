// Chamar a API de seed do admin
// Execute com: node scripts/seed-admin.mjs

const BASE_URL = process.env.BASE_URL || "http://localhost:3000"

const res = await fetch(`${BASE_URL}/api/admin/seed`, {
  method: "POST",
})

const data = await res.json()
console.log("Resultado:", JSON.stringify(data, null, 2))
