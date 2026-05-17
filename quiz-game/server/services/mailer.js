import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

export async function sendVerificationEmail(

  email,
  code

) {

  await transporter.sendMail({

    from: process.env.EMAIL_USER,

    to: email,

    subject: "Código de Verificação - QuizGame",

    html: `

      <div style="
        font-family: Arial;
        padding: 30px;
        background: #0f172a;
        color: white;
      ">

        <h1>Test Your Mind</h1>

        <p>O teu código de verificação é:</p>

        <h2 style="
          color:#00d4ff;
          font-size:40px;
        ">
          ${code}
        </h2>

      </div>
    `
  })
}
console.log("MAIL USER:", process.env.EMAIL_USER)
console.log("MAIL PASS:", process.env.EMAIL_PASS)