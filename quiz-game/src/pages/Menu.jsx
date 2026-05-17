import { useNavigate } from "react-router-dom"
import "../styles/menu.css"
import { useEffect } from "react"
import API from "../services/api"

export default function Menu() {
  const API = import.meta.env.VITE_API_URL
  const navigate = useNavigate()

  const user =
    JSON.parse(localStorage.getItem("user"))

  function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <div className="menu-container">

      {/* BACKGROUND FX */}
      <div className="menu-bg"></div>
      <div className="menu-orb orb1"></div>
      <div className="menu-orb orb2"></div>
      <div className="menu-orb orb3"></div>

      {/* LOGIN ICON (NOVO - TOPO DIREITO) */}
      <div className="menu-login-icon">
        {!user ? (
          <button onClick={() => navigate("/login")}>
            🔐 Login
          </button>
        ) : (
          <button onClick={logout}>
            🔐 Login
          </button>
        )}
      </div>

      {/* CARD PRINCIPAL */}
      <div className="menu-card">

        <h1 className="menu-title">
          TEST YOUR MIND
        </h1>

        <p className="menu-subtitle">
          Desafia a tua inteligência em tempo real
        </p>

        {/* PLAYER INFO */}
        <div className="player-info">

          <div className="player-avatar">
            👤
          </div>

          <h2>{user?.username || "Convidado"}</h2>

          <div className="stats-grid">

            <div>
              <span>⭐ XP</span>
              <p>{user?.xp || 0}</p>
            </div>

            <div>
              <span>🏆 Score</span>
              <p>{user?.score || 0}</p>
            </div>

            <div>
              <span>🎖 Level</span>
              <p>{user?.level || 1}</p>
            </div>

          </div>

        </div>

        {/* BUTTONS */}
        <div className="menu-buttons">

          <button
            className="btn-primary"
            onClick={() => navigate("/themes")}
          >
            ▶ Jogar
          </button>

          <button className="btn-secondary">
            🏆 Ranking
          </button>

          <button className="btn-secondary">
            ⚙ Configurações
          </button>

        </div>

      </div>

    </div>
  )
}