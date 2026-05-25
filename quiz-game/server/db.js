import mysql from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

function createPool() {
  return mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 10000
  })
}

const pool = createPool()

// TESTE DE CONEXÃO AUTOMÁTICO COM RETRY
async function keepAlive() {
  try {
    const conn = await pool.getConnection()
    await conn.ping()
    conn.release()
    console.log("DB CONNECTED")
  } catch (err) {
    console.log("DB LOST, retrying...", err.code)

    // recria pool automaticamente
    setTimeout(() => {
      pool.end().catch(() => {})
      Object.assign(pool, createPool())
      keepAlive()
    }, 5000)
  }
}

keepAlive()

export default pool