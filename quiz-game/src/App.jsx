import { BrowserRouter, Routes, Route } from "react-router-dom"

import Menu from "./pages/Menu"
import ThemeSelect from "./pages/ThemeSelect"
import Game from "./pages/Game"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Ranking from "../src/pages/Ranking.jsx"


function App() {
  
  return (

    <BrowserRouter>

      <Routes>

        {/* GAME */}

        <Route
          path="/"
          element={<Menu />}
        />

              {/* AUTH */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        <Route
          path="/themes"
          element={<ThemeSelect />}
        />

        <Route
          path="/game"
          element={<Game />}
        />

       <Route
          path="/ranking"
          element={<Ranking />}
  />

      </Routes>


    </BrowserRouter>
  )
}

export default App