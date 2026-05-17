import { useNavigate } from "react-router-dom"
import "../styles/gameover.css"

export default function GameOver({ score, rankingPoints, lives }) {
  const navigate = useNavigate()

  const isWin = score > 100

  function restart() {
    navigate("/themes")
  }

  return (
    <div className="gameover-container">

      <div className="gameover-card">

        <h1 className={isWin ? "win" : "lose"}>
          {isWin ? "🏆 Vitória!" : "💀 Game Over"}
        </h1>

        <p className="subtitle">
          Resultado final do teu desempenho
        </p>

        <div className="stats">

          <div className="stat">
            <span>⭐ Score</span>
            <h2>{score}</h2>
          </div>

          <div className="stat">
            <span>🏆 Ranking</span>
            <h2>{rankingPoints}</h2>
          </div>

          <div className="stat">
            <span>❤️ Vidas restantes</span>
            <h2>{lives}</h2>
          </div>

        </div>

        <button onClick={restart}>
          ▶ Jogar novamente
        </button>

      </div>

    </div>
  )
}