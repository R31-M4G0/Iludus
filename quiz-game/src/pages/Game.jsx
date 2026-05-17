import { useContext, useEffect, useState } from "react"
import { GameContext } from "../context/GameContext"
import "../styles/game.css"
import GameOver from "../pages/GameOver"

import {
  playMusic,
  playSound,
  stopMusic
} from "../utils/audioManager"

export default function Game() {
  
  const [selected, setSelected] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)

  const {

  themes,
  setThemes

} = useContext(GameContext)

  const [helpUsed, setHelpUsed] =
  useState("none")

  const user =
  JSON.parse(
    localStorage.getItem("user")
  )

  const [loadingNextLevel, setLoadingNextLevel] =
  useState(false)

  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [level, setLevel] = useState(1)

const [difficulty, setDifficulty] =
  useState("easy")

const [showLevelUp, setShowLevelUp] =
  useState(false)

const [questionsAnswered, setQuestionsAnswered] =
  useState(0)

  const [lives, setLives] = useState(3)
  const [time, setTime] = useState(30)

  const [score, setScore] = useState(0)
  const [helpPoints, setHelpPoints] = useState(30)
  const [rankingPoints, setRankingPoints] = useState(0)

  const [animating, setAnimating] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [loading, setLoading] = useState(true)

  // AJUDAS
  const [used5050, setUsed5050] = useState(false)
  const [usedReveal, setUsedReveal] = useState(false)


  const [visibleOptions, setVisibleOptions] = useState([])

  const [showThemeSelection, setShowThemeSelection] =
  useState(false)

const [tempThemes, setTempThemes] =
  useState([])


  // =========================================
  // CARREGAR PERGUNTAS
  // =========================================

  useEffect(() => {

    async function loadQuestions() {

      try {

        setLoading(true)

        const response = await fetch("http://localhost:3001/questions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({

  themes,
  difficulty

})
})

const data = await response.json()

console.log("RAW DATA:", data)

// 👇 GARANTE FORMATO CORRETO SEMPRE
const questions = Array.isArray(data)
  ? data
  : data.questions || []

setQuestions(questions)

if (questions.length > 0) {
  setVisibleOptions(questions[0].options)
} else {
  console.log("Nenhuma pergunta recebida do backend")
}

      } catch (error) {

        console.log("Erro ao carregar perguntas:", error)

      } finally {

        setLoading(false)
      }
    }

    if (themes && themes.length > 0) {
      loadQuestions()
    }

  }, [themes, difficulty])

  // =========================================
  // TIMER
  // =========================================

  useEffect(() => {

  // BLOQUEIOS
  if (
    loading ||
    loadingNextLevel ||
    gameOver ||
    showThemeSelection ||
    showLevelUp ||
    !questions.length
  ) return

  const timer = setInterval(() => {

    setTime(prev => {

      // TEMPO ESGOTOU
      if (prev <= 1) {

        clearInterval(timer)

        playSound("errada")
        setLives(old => {
          
          const updated = old - 1

          if (updated <= 0) {

            setGameOver(true)

            return 0
          }

          // próxima pergunta
          const next = current + 1

          if (next >= questions.length) {

            loadNextLevel()

          } else {

            nextQuestion(next)
          }

          return updated
        })

        return 30
      }

      if (prev <= 10 && prev > 1) {

}
      return prev - 1
    })

  }, 1000)

  return () => clearInterval(timer)

}, [

  current,
  loading,
  loadingNextLevel,
  gameOver,
  showLevelUp,
  questions

])

  // =========================================
  // TROCAR QUESTÃO
  // =========================================

function nextQuestion(nextIndex) {

  setAnimating(true)

  setTimeout(() => {

    if (!questions[nextIndex]) {

      playSound("gameOver")
      setGameOver(true)
      return
    }

    setSelected(null)

    setShowAnswer(false)

    setUsed5050(false)
    setUsedReveal(false)

    setVisibleOptions(
      questions[nextIndex].options
    )

    setCurrent(nextIndex)

    setTime(30)

    setAnimating(false)

  }, 350)
}

useEffect(() => {
  if (lives <= 0) {
    setGameOver(true)
  }
}, [lives])


  // =========================================
  // RESPONDER
  // =========================================

async function handleAnswer(option) {

  if (gameOver || selected) return

  const q = questions[current]

if (!q) {

  return (

    <div className="loading-screen">

      <div className="loading-content">

        <div className="spinner"></div>

        <h1 className="loading-title">

          A preparar perguntas...

        </h1>

      </div>

    </div>
  )
}

  const user =
  JSON.parse(
    localStorage.getItem("user")
  )

  setSelected(option)

  setShowAnswer(true)

  // ✔ CORRETA

  fetch("http://localhost:3001/save-answer", {

  method: "POST",

  headers: {
    "Content-Type": "application/json"
  },

  body: JSON.stringify({

    user_id: user?.id || null,

    question_id: q.id || current,

    question: q.question,

    player_answer: option,

    correct_answer: q.answer,

    is_correct: option === q.answer,

    theme: q.theme,

    difficulty,

    time_left: time,

    help_used: helpUsed
  })
})


  if (option === q.answer) {

    playSound("certa")

    let gained = 10
    let ranking = 5

    if (time >= 27) ranking = 30
    else if (time >= 20) ranking = 15

    gained += time

    setScore(prev => prev + gained)

    setRankingPoints(
      prev => prev + ranking
    )

    const answered =
  questionsAnswered + 1

setQuestionsAnswered(answered)

// LEVEL UP

if (answered % 10 === 0) {

  playSound("levelUp")
  setShowLevelUp(true)
  setShowThemeSelection(true)
  setTime(30)

  fetch("http://localhost:3001/save-progress", {

  method: "POST",

  headers: {
    "Content-Type": "application/json"
  },

  body: JSON.stringify({

    user_id: user?.id || null,

    level: level + 1,

    score,

    ranking_points: rankingPoints,

    help_points: helpPoints,

    lives,

    difficulty
  })
})

  setLevel(prev => prev + 1)

  setLives(prev => prev + 1)

  setHelpPoints(prev => prev + 15)

  // dificuldade

  if (answered >= 20) {

    setDifficulty("hard")

  } else if (answered >= 10) {

    setDifficulty("medium")
  }

  setTimeout(async () => {

    setShowLevelUp(false)

  }, 3000)
}

    setTimeout(async () => {

      const next = current + 1

      if (next >= questions.length) {

  loadNextLevel()

  return
} else {

        nextQuestion(next)
      }

    }, 1200)
  }

  // ❌ ERRADA

  else {

    setTimeout(() => {

      playSound("errada")
      setLives(prev => {

        const newLives = prev - 1

        if (newLives <= 0) {

          setGameOver(true)

          return 0
        }

        return newLives
      })

      const next = current + 1

      if (next >= questions.length) {
        setFailedQuestion(q)
        setGameOver(true)

      } else {

        nextQuestion(next)
      }

    }, 1400)
  }
}
  

  // =========================================
  // Próximo Nível
  // =========================================

async function loadNextLevel() {

  try {

    setLoadingNextLevel(true)

    const response = await fetch(
      "http://localhost:3001/questions",
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          themes,
          difficulty
        })
      }
    )

    const data = await response.json()

    const newQuestions =
      Array.isArray(data)
        ? data
        : data.questions || []

    // SEGURANÇA
    if (newQuestions.length === 0) {

      setGameOver(true)
      return
    }

    // RESET COMPLETO
    setQuestions(newQuestions)

    setCurrent(0)

    setSelected(null)

    setShowAnswer(false)

    setUsed5050(false)

    setUsedReveal(false)

    setTime(30)

    // GARANTE OPÇÕES
    setVisibleOptions([
      ...newQuestions[0].options
    ])

  } catch (err) {

    console.log(err)

  } finally {

    setTimeout(() => {

      setLoadingNextLevel(false)

    }, 800)
  }
}


  // =========================================
  // AJUDA +10s
  // =========================================

function useExtraTime() {
  playSound("click")
  if (helpPoints < 3) {
    alert("Sem pontos de ajuda suficientes")
    return
}
  setHelpPoints(prev => prev - 3)
  setTime(prev => prev + 10)
  setHelpUsed("+10s")
}

  // =========================================
  // AJUDA 50/50
  // =========================================

  function use5050() {
  playSound("click")
  if (helpPoints < 6){ 
    alert("Sem pontos de ajuda suficientes")
    return
}
  const q = questions[current]

  const wrong = q.options.filter(opt => opt !== q.answer)

  const randomWrong = wrong[Math.floor(Math.random() * wrong.length)]

  const newOptions = [q.answer, randomWrong]
    .sort(() => Math.random() - 0.5)

  setVisibleOptions(newOptions)

  setHelpPoints(prev => prev - 6)
  setUsed5050(true)
  setHelpUsed("50/50")
}

  // =========================================
  // AJUDA REVELAR
  // =========================================

  function useReveal() {
  playSound("click")
  if (helpPoints < 10){ 
    alert("Sem pontos de ajuda suficientes")
    return
}
  const q = questions[current]

  alert("Resposta correta: " + q.answer)

  setHelpPoints(prev => prev - 10)
  setUsedReveal(true)
  setHelpUsed("reveal")
}

  // =========================================
  // GAME OVER
  // =========================================

if (gameOver) {
  return (
    <div style={{ position: "relative", zIndex: 9999 }}>
      <GameOver
        score={score}
        rankingPoints={rankingPoints}
        lives={lives}
      />
    </div>
  )
}

  // =========================================
  // SEM TEMAS
  // =========================================

  if (!themes || themes.length === 0) {

    return (

      <div className="game-container">

        <div className={`game-card ${animating ? "animating" : ""}`}>

          <h1>⚠ Nenhum tema selecionado</h1>

        </div>

      </div>
    )
  }

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
  return (
    <div className="loading-screen">

      <div className="loading-content">

        <div className="spinner"></div>

        <h1 className="loading-title">Test Your Mind</h1>

        <p className="loading-sub">
          A preparar o desafio...
        </p>

        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>

      </div>

    </div>
  )
}

  // =========================================
  // SEGURANÇA
  // =========================================

  if (questions.length === 0) {

    return (

      <div className="game-container">

        <div className={`game-card ${animating ? "animating" : ""}`}>

          <h1>❌ Nenhuma pergunta encontrada</h1>

        </div>

      </div>
    )
  }

  const q = questions[current]


  function toggleTempTheme(theme) {

  setTempThemes(prev => {

    const exists =
      prev.includes(theme)

    if (exists) {

      return prev.filter(
        t => t !== theme
      )
    }

    if (prev.length >= 5)
      return prev

    return [...prev, theme]
  })
}


async function confirmNewThemes() {

  if (tempThemes.length < 2)
    return

  setThemes(tempThemes)

  setShowThemeSelection(false)

  setTempThemes([])

  await loadNextLevel()
}

  // =========================================
  // UI
  // =========================================

const allThemes = [

  "Matemática",
  "Programação",
  "Base de Dados",
  "Telecomunicações",
  "Cultura Geral",
  "Física",
  "Sistemas Multimédia",
  "Organização de Empresas"
]

  return (

    

    <div className="game-container">

      <div className={`game-card ${animating ? "animating" : ""}`}>

        {/* HEADER */}

{showLevelUp && (

  <div className="levelup-screen">

    <div className="levelup-card">

      <h1>

        LEVEL {level}

      </h1>

      <p>

        ❤️ +1 Vida

      </p>

      <p>

        💎 +15 Help Points

      </p>

      <span>

        Difficulty:
        {difficulty.toUpperCase()}

      </span>

    </div>

  </div>
)}


    {showThemeSelection && (

  <div className="theme-select-overlay">

    <div className="theme-select-card">

      <h1>

        Escolhe Novos Temas

      </h1>

      <p>

        Seleciona entre 2 e 5 temas

      </p>

      <div className="theme-level-grid">

        {allThemes.map(theme => (

          <button

            key={theme}

            className={`
              level-theme-btn
              ${tempThemes.includes(theme)
                ? "active"
                : ""}
            `}

            onClick={() =>
              toggleTempTheme(theme)
            }
          >

            {theme}

          </button>
        ))}

      </div>

      <button

        className="confirm-themes-btn"

        disabled={tempThemes.length < 2}

        onClick={confirmNewThemes}
      >

        Continuar

      </button>

    </div>

  </div>
)}

        <div className="game-header">

  <div className="player-mini">

    👤 {user?.username || "Convidado"}

  </div>

  <div className="hud-center">

    <span>❤️ {lives}</span>

    <span>⏱ {time}s</span>

    <span>⭐ {score}</span>

  </div>

<div className="level-box">

  LVL {level}

</div>

</div>

        {/* TEMAS */}

        <div className="themes">

          {themes.join(" • ")}

        </div>

        {/* PERGUNTA */}

        <div className="question-box">

          <h2>{q.question}</h2>

        </div>

        {/* OPÇÕES */}

        <div className="options">

          {visibleOptions?.length > 0 &&
 visibleOptions.map((option, i) => (

            <button
              key={i}
              className={`option-btn

${showAnswer && option === q.answer
  ? "correct"
  : ""}

${showAnswer &&
selected === option &&
option !== q.answer
  ? "wrong"
  : ""}
`}
              onClick={() => handleAnswer(option)}
            >
              {option}
            </button>

          ))}

        </div>

        {/* AJUDAS */}

        <div className="helps">

  <button
    className="help-btn"

    onClick={useExtraTime}
  >

    ⚡ +10s

  </button>

  <button
    className="help-btn"

    onClick={use5050}
  >

    ✂ 50/50

  </button>

  <button
    className="help-btn"

    onClick={useReveal}
  >

    👁 Reveal

  </button>

</div>

      </div>

    </div>
  )
}