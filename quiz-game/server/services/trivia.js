const API_URL = "https://opentdb.com/api.php"

const DICTIONARY = {
  "What": "O que",
  "Which": "Qual",
  "Who": "Quem",
  "Where": "Onde",
  "When": "Quando",
  "is": "é",
  "are": "são",
  "capital": "capital",
  "country": "país",
  "city": "cidade",
  "largest": "maior",
  "smallest": "menor",
  "known": "conhecido",
  "population": "população",
  "in": "em",
  "the": "",
  "of": "de"
}


/**
 * 🧼 limpa HTML entities da API
 */
function clean(text) {
  if (!text) return ""

  return text
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&eacute;", "é")
    .replaceAll("&iacute;", "í")
    .replaceAll("&aacute;", "á")
    .replaceAll("&oacute;", "ó")
    .replaceAll("&uacute;", "ú")
}

/**
 * 🌍 tradução simples PT-BR/PT-PT
 */
function translate(text = "") {
  let result = text

  for (const key in DICTIONARY) {
    const regex = new RegExp(`\\b${key}\\b`, "gi")
    result = result.replace(regex, DICTIONARY[key])
  }

  return result
}

/**
 * 🎯 busca perguntas por tema
 */
async function fetchByCategory(category, amount = 5) {
  try {
    const res = await fetch(
      `${API_URL}?amount=${amount}&category=${category}&type=multiple`
    )

    const data = await res.json()

    if (!data.results || data.results.length === 0) return []

    return data.results.map((q) => {
      const options = [...q.incorrect_answers, q.correct_answer]
        .map(clean)
        .map(translate)
        .sort(() => Math.random() - 0.5)

      return {
        question: translate(clean(q.question)),
        options,
        answer: translate(clean(q.correct_answer)),
        category
      }
    })
  } catch (err) {
    console.error("Erro API Trivia:", err)
    return []
  }
}

/**
 * 🎮 função principal usada pelo jogo
 * recebe temas e devolve perguntas
 */
export async function generateQuestions(themes = []) {
  if (!themes || themes.length === 0) return []

  let allQuestions = []

  // 🔁 garante variedade por tema
  for (const theme of themes) {
    const questions = await fetchByCategory(theme, 3)

    allQuestions = [...allQuestions, ...questions]
  }

  // 🔥 fallback caso API falhe
  if (allQuestions.length === 0) {
    return [
      {
        question: "Qual é a capital de Angola?",
        options: ["Luanda", "Benguela", "Huambo", "Lubango"],
        answer: "Luanda",
        category: "fallback"
      }
    ]
  }

  // 🔀 mistura final
  return allQuestions.sort(() => Math.random() - 0.5)
}

export { generateQuestions as getTriviaQuestions }