import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import connection from "./db.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { sendVerificationEmail } from "./services/mailer.js"
import { getTriviaQuestions } from "./services/trivia.js"
import API from "../src/services/api.js"


const verificationCodes = {}
const app = express()

// =========================================
// MIDDLEWARES
// =========================================

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://iludus-2jaq.vercel.app"
  ],
  credentials: true
}))
// =========================================
// HEALTH CHECK
// =========================================

app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Test Your Mind está rodando 🚀"
  })
})

// =========================================
// SEND CODE
// =========================================

app.post("/send-code", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        error: "Email obrigatório"
      })
    }

    const code = Math.floor(
      100000 + Math.random() * 900000
    ).toString()

    verificationCodes[email] = code

    // 🔥 PROTEÇÃO: email não pode quebrar API
    try {
      await sendVerificationEmail(email, code)
    } catch (emailError) {
      console.log("EMAIL ERROR:", emailError)
      return res.status(500).json({
        error: "Erro ao enviar email"
      })
    }

    return res.json({
      success: true
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      error: "Erro interno"
    })
  }
})

// =========================================
// VERIFY CODE
// =========================================

app.post("/verify-code", (req, res) => {
  const { email, code } = req.body

  const savedCode = verificationCodes[email]

  if (!savedCode || savedCode !== code) {
    return res.status(400).json({
      error: "Código inválido"
    })
  }

  return res.json({
    success: true
  })
})

// =========================================
// REGISTER
// =========================================

app.post("/register", (req, res) => {
  try {
    const { username, email, password, code } = req.body

    const savedCode = verificationCodes[email]

    if (!savedCode || savedCode !== code) {
      return res.status(400).json({
        error: "Código inválido"
      })
    }

    connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, result) => {
        if (err) {
          return res.status(500).json({
            error: "Erro servidor"
          })
        }

        if (result.length > 0) {
          return res.status(400).json({
            error: "Email já existe"
          })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        connection.query(
          `
          INSERT INTO users (username, email, password)
          VALUES (?, ?, ?)
          `,
          [username, email, hashedPassword],
          (err, result) => {
            if (err) {
              console.log(err)
              return res.status(500).json({
                error: "Erro ao criar conta"
              })
            }

            const token = jwt.sign(
              {
                id: result.insertId,
                email
              },
              process.env.JWT_SECRET,
              {
                expiresIn: "7d"
              }
            )

            return res.json({
              success: true,
              token,
              user: {
                id: result.insertId,
                username,
                email
              }
            })
          }
        )
      }
    )
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      error: "Erro interno"
    })
  }
})

// =========================================
// LOGIN
// =========================================

app.post("/login", (req, res) => {
  const { email, password } = req.body

  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) {
        return res.status(500).json({
          error: "Erro servidor"
        })
      }

      if (result.length === 0) {
        return res.status(400).json({
          error: "Conta não encontrada"
        })
      }

      const user = result[0]

      const validPassword = await bcrypt.compare(
        password,
        user.password
      )

      if (!validPassword) {
        return res.status(400).json({
          error: "Senha incorreta"
        })
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d"
        }
      )

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          xp: user.xp,
          level: user.level,
          score: user.total_score
        }
      })
    }
  )
})

// =========================================
// SAVE SCORE
// =========================================

app.post("/save-score", (req, res) => {
  const {
    userId,
    score,
    rankingPoints,
    correctAnswers,
    wrongAnswers,
    themesPlayed
  } = req.body

  const sql = `
    INSERT INTO matches (
      user_id,
      score,
      ranking_points,
      correct_answers,
      wrong_answers,
      themes_played
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `

  connection.query(
    sql,
    [
      userId,
      score,
      rankingPoints,
      correctAnswers,
      wrongAnswers,
      themesPlayed
    ],
    (err) => {
      if (err) {
        console.log(err)
        return res.status(500).json({
          error: "Erro ao salvar"
        })
      }

      res.json({ success: true })
    }
  )
})

// =========================================
// Ranking
// =========================================

app.get("/leaderboard", (req, res) => {

  const sql = `
    SELECT
      username,
      total_score,
      ranking_points,
      level

    FROM users

    ORDER BY ranking_points DESC

    LIMIT 20
  `

  connection.query(sql, (err, results) => {

    if (err) {
      return res.status(500).json([])
    }

    res.json(results)
  })
})



// =========================================
// GERAR PERGUNTAS
// =========================================

app.post("/questions", (req, res) => {

  const { themes } = req.body

  console.log("TEMAS RECEBIDOS:", themes)

  // segurança
  if (!themes || themes.length === 0) {
    return res.json([])
  }

  // cria ?, ?, ?, ?
  const placeholders = themes.map(() => "?").join(",")

  const sql = `
    SELECT * FROM questions
    WHERE theme IN (${placeholders})
    ORDER BY RAND()
    LIMIT 10
  `

  connection.query(sql, themes, (err, results) => {

    if (err) {

      console.log("ERRO MYSQL:", err)

      return res.status(500).json([])
    }

    // formato que o frontend precisa
    const formatted = results.map(q => ({

      question: q.question,

      options: [
        q.option1,
        q.option2,
        q.option3,
        q.option4
      ],

      answer: q.answer,

      theme: q.theme,
      difficulty: q.difficulty

    }))

    res.json(formatted)

  })

})


// =========================================
// Salvar Progresso
// =========================================
app.post("/save-progress", async (req, res) => {

  try {

    const {

      user_id,
      level,
      score,
      ranking_points,
      help_points,
      lives,
      difficulty

    } = req.body

    await db.execute(

      `
      INSERT INTO player_progress
      (
        user_id,
        level,
        score,
        ranking_points,
        help_points,
        lives,
        difficulty
      )

      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,

      [
        user_id,
        level,
        score,
        ranking_points,
        help_points,
        lives,
        difficulty
      ]
    )

    res.json({
      success: true
    })

  } catch (err) {

    console.log(err)

    res.status(500).json({
      success: false
    })
  }
})


// =========================================
// Salvar Resposta
// =========================================
app.post("/save-answer", async (req, res) => {

  try {

    const {

      user_id,
      question_id,
      question,
      player_answer,
      correct_answer,
      is_correct,
      theme,
      difficulty,
      time_left,
      help_used

    } = req.body

    await db.execute(

      `
      INSERT INTO player_answers
      (
        user_id,
        question_id,
        question,
        player_answer,
        correct_answer,
        is_correct,
        theme,
        difficulty,
        time_left,
        help_used
      )

      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,

      [
        user_id,
        question_id,
        question,
        player_answer,
        correct_answer,
        is_correct,
        theme,
        difficulty,
        time_left,
        help_used
      ]
    )

    res.json({
      success: true
    })

  } catch (err) {

    console.log(err)

    res.status(500).json({
      success: false
    })
  }
})

// =========================================
// START SERVER
// =========================================

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {

  console.log("===================================")
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log("===================================")

})