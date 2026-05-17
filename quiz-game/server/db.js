import mysql from "mysql2"

const connection = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
})

connection.connect((err) => {
  if (err) {
    console.log("DB ERROR:", err)
  } else {
    console.log("DB CONNECTED")
  }
})

export default connection