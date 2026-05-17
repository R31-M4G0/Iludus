import { createContext, useState } from "react"

export const GameContext = createContext()

export function GameProvider({ children }) {
  const [themes, setThemes] = useState([])
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [lives, setLives] = useState(3)
  const [score, setScore] = useState(0)

  return (
    <GameContext.Provider value={{
      themes,
      setThemes,
      questions,
      setQuestions,
      current,
      setCurrent,
      lives,
      setLives,
      score,
      setScore
    }}>
      {children}
    </GameContext.Provider>
  )
}