export async function getQuizQuestions(themes = []) {
  try {
    const theme = themes?.join(",") || "general"

    const res = await fetch(
  `https://quizapi.io/api/v1/questions?apiKey=${process.env.QUIZ_API_KEY}&limit=5`
)
console.log("QUESTÕES RECEBIDAS:", data)
const data = await res.json()

console.log("STATUS:", res.status)
console.log("DATA:", data)

    if (!Array.isArray(data)) {
      throw new Error("Resposta inválida da QuizAPI")
    }

    return data.map(q => {
      // 🔥 montar opções corretamente
      const optionsMap = {
        A: q.answers?.answer_a,
        B: q.answers?.answer_b,
        C: q.answers?.answer_c,
        D: q.answers?.answer_d,
        E: q.answers?.answer_e
      }

      const options = Object.values(optionsMap).filter(Boolean)

      // 🔥 descobrir resposta correta corretamente
      let correct = null

      if (q.correct_answers?.answer_a_correct === "true") correct = optionsMap.A
      if (q.correct_answers?.answer_b_correct === "true") correct = optionsMap.B
      if (q.correct_answers?.answer_c_correct === "true") correct = optionsMap.C
      if (q.correct_answers?.answer_d_correct === "true") correct = optionsMap.D
      if (q.correct_answers?.answer_e_correct === "true") correct = optionsMap.E

      return {
        question: q.question,
        options,
        answer: correct || options[0]
      }
    })

  } catch (err) {
    console.error("QuizAPI erro:", err)
    console.log("STATUS:", res.status)
console.log("RAW RESPONSE:", data)

    return [
      {
        question: "Fallback: 2 + 2 = ?",
        options: ["1", "2", "3", "4"],
        answer: "4"
      }
    ]
  }
}