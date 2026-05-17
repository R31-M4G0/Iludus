import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import API from "../services/api"
import "../styles/auth.css"
import "../styles/menu.css"
export default function Register() {

  const navigate = useNavigate()
  // =========================================
  // STATES
  // =========================================

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")

  const [codeSent, setCodeSent] = useState(false)

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState("")

  const [success, setSuccess] = useState("")

  // =========================================
  // ENVIAR CÓDIGO
  // =========================================

  async function sendCode() {

    try {

      setLoading(true)

        setError("")
        setSuccess("")

        await axios.post(

          `${API}/send-code`,

        {
          email
        }
      )

      setCodeSent(true)

      setSuccess(
        "Código enviado para o email"
      )
    }

    catch (err) {

      console.log(err)

      setError(

        err.response?.data?.error ||

        "Erro ao enviar código"
      )
    }

    finally {

      setLoading(false)
    }
  }

  // =========================================
  // REGISTAR
  // =========================================

  async function handleRegister(e) {

    e.preventDefault()

    try {

      setLoading(true)

      setError("")
      setSuccess("")

      const response = await axios.post(

        `${API}/register`,

        {
          username,
          email,
          password,
          code
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

      setSuccess(
        "Conta criada com sucesso"
      )

      // ir menu

      setTimeout(() => {

        navigate("/")

      }, 1200)

    }

    catch (err) {

      console.log(err)

      setError(

        err.response?.data?.error ||

        "Erro ao criar conta"
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

      {/* FX */}

      <div className="auth-orb orb1"></div>
      <div className="auth-orb orb2"></div>

      {/* CARD */}

      <div className="auth-card">

        <h1 className="auth-title">

          QUIZ GAME

        </h1>

        <p className="auth-subtitle">

          Criar Conta

        </p>

        {/* ERROR */}

        {error && (

          <div className="auth-error">

            {error}

          </div>
        )}

        {/* SUCCESS */}

        {success && (

          <div className="auth-success">

            {success}

          </div>
        )}

        {/* FORM */}

        <form
          className="auth-form"
          onSubmit={handleRegister}
        >

          {/* USERNAME */}

          <input
            type="text"
            placeholder="Username"

            value={username}

            onChange={(e) =>
              setUsername(e.target.value)
            }

            required
          />

          {/* EMAIL */}

          <div className="email-group">

            <input
              type="email"
              placeholder="Email"

              value={email}

              onChange={(e) =>
                setEmail(e.target.value)
              }

              required
            />

            <button
              type="button"

              className="code-btn"

              onClick={sendCode}

              disabled={loading || !email}
            >

              {
                loading
                  ? "..."
                  : "Enviar Código"
              }

            </button>

          </div>

          {/* CODE */}

          {codeSent && (

            <input
              type="text"
              placeholder="Código OTP"

              value={code}

              onChange={(e) =>
                setCode(e.target.value)
              }

              required
            />
          )}

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

          {/* BTN */}

          <button
            type="submit"
            className="auth-btn"

            disabled={
              loading || !codeSent
            }
          >

            {
              loading
                ? "Criando..."
                : "Criar Conta"
            }

          </button>

        </form>

        {/* FOOTER */}

        <div className="auth-footer">

          Já tens conta?

          <Link to="/login">

            Entrar

          </Link>

        </div>

      </div>

    </div>
  )
}