import { useEffect, useState } from "react"
import "../styles/ranking.css"
import API from "../services/api"

export default function Ranking() {

  const [players, setPlayers] =
    useState([])

  useEffect(() => {

    async function loadRanking() {

      try {

        const response =
          await fetch(
            `${API}/ranking`
          )

        const data =
          await response.json()

        setPlayers(data)

      } catch (err) {

        console.log(err)
      }
    }

    loadRanking()

  }, [])

  return (

    <div className="ranking-container">

      <div className="ranking-card">

        <h1>

          🏆 Ranking Global

        </h1>

        <div className="ranking-list">

          {players.map((player, index) => (

            <div
              key={player.id}
              className="ranking-player"
            >

              <div className="rank-pos">

                #{index + 1}

              </div>

              <div className="rank-user">

                {player.username}

              </div>

              <div className="rank-score">

                ⭐ {player.score}

              </div>

              <div className="rank-level">

                LVL {player.level_reached}

              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  )
}