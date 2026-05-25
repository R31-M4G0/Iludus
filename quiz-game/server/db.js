import mysql from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
})

async function testConnection() {
  try {

    const connection = await pool.getConnection()

    console.log("DB CONNECTED")

    connection.release()

  } catch (err) {

    console.log("DB ERROR:", err)
  }
}

testConnection()

export default pool