import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import { GameContext } from "../context/GameContext"
import API from "../services/api"
import "../styles/themes.css"

import {
  playMusic,
  playSound
} from "../utils/audioManager"

import { useEffect } from "react"

export default function ThemeSelect() {

  const navigate = useNavigate()
  const { setThemes } = useContext(GameContext)

  const [selectedThemes, setSelectedThemes] = useState([])

  const themes = [
    { name: "Matemática", icon: "➗" },
    { name: "Programação", icon: "💻" },
    { name: "Base de Dados", icon: "🗄" },
    { name: "Telecomunicações", icon: "📡" },
    { name: "Cultura Geral", icon: "🌍" },
    { name: "Física", icon: "⚛" },
    { name: "Sistemas Multimédia", icon: "🎬" },
    { name: "Organização de Empresas", icon: "🏢" }
  ]

  // =========================================
  // SELEÇÃO
  // =========================================

  function toggleTheme(themeName) {

    playSound("ajuda")
    setSelectedThemes(prev => {

      const isSelected = prev.includes(themeName)

      // remover
      if (isSelected) {
        return prev.filter(t => t !== themeName)
      }

      // limite máximo 5
      if (prev.length >= 5) return prev

      // adicionar
      return [...prev, themeName]
    })
  }


  useEffect(() => {

  playMusic("fundo")

}, [])

  // =========================================
  // REGRAS DO JOGO
  // =========================================

  const minRequired = 2
  const canPlay = selectedThemes.length >= minRequired
  const maxReached = selectedThemes.length >= 5

  // =========================================
  // INICIAR
  // =========================================

  function startGame() {
    if (!canPlay) return

    setThemes(selectedThemes)
    navigate("/game")
  }

  // =========================================
  // UI
  // =========================================

  return (

  <div className="themes-container">

    {/* BACKGROUND FX */}

    <div className="bg-orb orb1"></div>
    <div className="bg-orb orb2"></div>

    {/* CARD */}

    <div className="themes-card">

      {/* TOP */}

      <div className="themes-top">

        <button
          className="back-btn"
          onClick={() => navigate("/")}
        >
          ← Voltar
        </button>

        <div className="selected-counter">
          {selectedThemes.length}/5 temas
        </div>

      </div>

      {/* TITLE */}

      <h1 className="themes-title">
        Escolha os Temas
      </h1>

      <p className="themes-subtitle">
        Seleciona entre 2 e 5 temas
      </p>

      {/* WARNING */}

      {!canPlay && selectedThemes.length > 0 && (

        <div className="themes-warning">

          Escolhe pelo menos 2 temas

        </div>
      )}

      {/* GRID */}

      <div className="themes-grid">

        {themes.map((themeObj, index) => {

          const selected =
            selectedThemes.includes(themeObj.name)

          return (

            <button
              key={index}

              className={`
                theme-btn
                ${selected ? "selected" : ""}
                ${maxReached && !selected ? "locked" : ""}
              `}

              onClick={() =>
                toggleTheme(themeObj.name)
              }
            >

              <div className="theme-content">

                <span className="theme-icon">
                  {themeObj.icon}
                </span>

                <span className="theme-name">
                  {themeObj.name}
                </span>

              </div>

              {selected && (

                <div className="theme-check">

                  ✔

                </div>
              )}

            </button>
          )
        })}

      </div>

      {/* FOOTER */}

      <div className="themes-footer">

        <button
          className={`play-btn ${canPlay ? "active" : ""}`}

          onClick={startGame}

          disabled={!canPlay}
        >

          ▶ Iniciar Jogo

        </button>

      </div>

    </div>

  </div>
)
}