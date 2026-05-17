import mysql from "mysql2"

const connection = mysql.createConnection({

  host: "localhost",
  user: "root",
  password: "",
  database: "quizgame"

})

connection.connect((err) => {

  if (err) {
    console.log("❌ Erro MySQL:", err)
  }

  else {
    console.log("✅ MySQL conectado")
  }

})

export default connection