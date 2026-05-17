import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import API from "../services/api"
import "../styles/auth.css"
import "../styles/menu.css"

export default function Login() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState("")

  // =========================================
  // LOGIN
  // =========================================

  async function handleLogin(e) {

    e.preventDefault()

    try {

      setLoading(true)

      setError("")

      const response = await axios.post(

        `${API}/login`,

        {
          email,
          password
        }

      )

      // salvar sessão
      localStorage.setItem(
        "token",
        response.data.token
      )

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      )

      // menu principal
      navigate("/")

    }

    catch (err) {

      console.log(err)

      setError(
        err.response?.data?.error ||
        "Erro ao fazer login"
      )
    }

    finally {

      setLoading(false)
    }
  }

  // =========================================
  // UI
  // =========================================

  return (

    <div className="auth-container">

      {/* BACKGROUND FX */}

      <div className="auth-orb orb1"></div>
      <div className="auth-orb orb2"></div>

      {/* CARD */}

      <div className="auth-card">

        <h1 className="auth-title">
          Test Your Mind
        </h1>

        <p className="auth-subtitle">
          Entra na tua conta
        </p>

        {/* ERROR */}

        {error && (

          <div className="auth-error">

            {error}

          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleLogin}
          className="auth-form"
        >

          {/* EMAIL */}

          <input
            type="email"
            placeholder="Email"

            value={email}

            onChange={(e) =>
              setEmail(e.target.value)
            }

            required
          />

          {/* PASSWORD */}

          <input
            type="password"
            placeholder="Senha"

            value={password}

            onChange={(e) =>
              setPassword(e.target.value)
            }

            required
          />

          {/* BUTTON */}

          <button
            type="submit"
            className="auth-btn"
          >

            {
              loading
                ? "Entrando..."
                : "Entrar"
            }

          </button>

        </form>

        {/* LINKS */}

        <div className="auth-footer">

          Não tens conta?

          <Link to="/register">

            Criar Conta

          </Link>

        </div>

      </div>

    </div>
  )
}