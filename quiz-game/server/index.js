import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import connection from "./db.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { sendVerificationEmail } from "./services/mailer.js"

const app = express()

// ========================
// MIDDLEWARES
// ========================
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://iludus-2jaq.vercel.app"
  ],
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const verificationCodes = {}

// ========================
// HEALTH CHECK
// ========================
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Test Your Mind está rodando 🚀"
  })
})

// ========================
// SEND CODE (FIXED)
// ========================
app.post("/send-code", async (req, res) => {
  try {
    const email = req.body?.email

    if (!email) {
      return res.status(400).json({ error: "Email obrigatório" })
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    verificationCodes[email] = code

    try {
      await sendVerificationEmail(email, code)
    } catch (err) {
      console.log("EMAIL ERROR:", err)
      return res.status(500).json({ error: "Erro ao enviar email" })
    }

    return res.json({ success: true })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: "Erro interno" })
  }
})

// ========================
// VERIFY CODE
// ========================
app.post("/verify-code", (req, res) => {
  const email = req.body?.email
  const code = req.body?.code

  if (!verificationCodes[email] || verificationCodes[email] !== code) {
    return res.status(400).json({ error: "Código inválido" })
  }

  return res.json({ success: true })
})

// ========================
// REGISTER
// ========================
app.post("/register", (req, res) => {
  const { username, email, password, code } = req.body || {}

  if (!email || !password || !username) {
    return res.status(400).json({ error: "Dados inválidos" })
  }

  const savedCode = verificationCodes[email]

  if (!savedCode || savedCode !== code) {
    return res.status(400).json({ error: "Código inválido" })
  }

  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) return res.status(500).json({ error: "Erro servidor" })

      if (result.length > 0) {
        return res.status(400).json({ error: "Email já existe" })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      connection.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword],
        (err, result) => {
          if (err) return res.status(500).json({ error: "Erro ao criar conta" })

          const token = jwt.sign(
            { id: result.insertId, email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
          )

          return res.json({
            success: true,
            token,
            user: { id: result.insertId, username, email }
          })
        }
      )
    }
  )
})

// ========================
// LOGIN (FIXED SAFE)
// ========================
app.post("/login", (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ error: "Dados inválidos" })
  }

  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) return res.status(500).json({ error: "Erro servidor" })

      if (!result || result.length === 0) {
        return res.status(400).json({ error: "Conta não encontrada" })
      }

      const user = result[0]

      const validPassword = await bcrypt.compare(password, user.password)

      if (!validPassword) {
        return res.status(400).json({ error: "Senha incorreta" })
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      )

      return res.json({
        success: true,
        token,
        user
      })
    }
  )
})

// ========================
// QUESTIONS (CRITICAL FIX)
// ========================
app.post("/questions", (req, res) => {
  const themes = req.body?.themes

  console.log("THEMES RECEBIDOS:", themes)

  if (!Array.isArray(themes) || themes.length === 0) {
    return res.json([])
  }

  const placeholders = themes.map(() => "?").join(",")

  const sql = `
    SELECT * FROM questions
    WHERE theme IN (${placeholders})
    ORDER BY RAND()
    LIMIT 10
  `

  connection.query(sql, themes, (err, results) => {
    if (err) {
      console.log("MYSQL ERROR:", err)
      return res.status(500).json([])
    }

    const formatted = (results || []).map(q => ({
      id: q.id,
      question: q.question,
      options: [q.option1, q.option2, q.option3, q.option4],
      answer: q.answer,
      theme: q.theme,
      difficulty: q.difficulty
    }))

    res.json(formatted)
  })
})

// ========================
// SAVE ANSWER / SCORE (UNCHANGED BUT SAFE)
// ========================
app.post("/save-score", (req, res) => {
  const data = req.body || {}

  connection.query(
    `INSERT INTO matches (user_id, score, ranking_points, correct_answers, wrong_answers, themes_played)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.userId,
      data.score,
      data.rankingPoints,
      data.correctAnswers,
      data.wrongAnswers,
      data.themesPlayed
    ],
    (err) => {
      if (err) {
        console.log(err)
        return res.status(500).json({ error: "Erro ao salvar" })
      }

      res.json({ success: true })
    }
  )
})

// ========================
// START SERVER
// ========================
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log("===================================")
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log("===================================")
})