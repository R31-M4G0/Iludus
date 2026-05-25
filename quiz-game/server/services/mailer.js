import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

// ========================================
// TRANSPORTER
// ========================================

const transporter = nodemailer.createTransport({

  host: "smtp.gmail.com",

  port: 465,

  secure: true,

  auth: {

    user: process.env.EMAIL_USER,

    pass: process.env.EMAIL_PASS
  }
})

// ========================================
// TESTE SMTP
// ========================================

transporter.verify((err, success) => {

  if (err) {

    console.log("===================================")
    console.log("❌ MAIL ERROR")
    console.log(err)
    console.log("===================================")

  } else {

    console.log("===================================")
    console.log("✅ MAIL SERVER READY")
    console.log("===================================")
  }
})

// ========================================
// ENVIAR EMAIL
// ========================================

export async function sendVerificationEmail(

  email,
  code

) {

  try {

    const info = await transporter.sendMail({

      from: `"Test Your Mind" <${process.env.EMAIL_USER}>`,

      to: email,

      subject: "Código de Verificação - Test Your Mind",

      html: `

        <div style="
          background:#020617;
          padding:40px;
          font-family:Arial;
          color:white;
          text-align:center;
        ">

          <div style="
            max-width:600px;
            margin:auto;
            background:#0f172a;
            border-radius:20px;
            padding:40px;
            border:1px solid rgba(255,255,255,0.08);
          ">

            <h1 style="
              margin-bottom:10px;
              color:#38bdf8;
              font-size:38px;
            ">
              Test Your Mind
            </h1>

            <p style="
              opacity:0.8;
              font-size:18px;
            ">
              O teu código de verificação é:
            </p>

            <div style="
              margin:35px auto;
              background:linear-gradient(135deg,#06b6d4,#2563eb);
              padding:20px;
              border-radius:18px;
              width:fit-content;
            ">

              <h2 style="
                margin:0;
                font-size:42px;
                letter-spacing:6px;
                color:white;
              ">
                ${code}
              </h2>

            </div>

            <p style="
              margin-top:30px;
              opacity:0.6;
              font-size:14px;
            ">
              Se não foste tu que pediste este código,
              podes ignorar este email.
            </p>

          </div>

        </div>

      `
    })

    console.log("===================================")
    console.log("✅ EMAIL ENVIADO")
    console.log("TO:", email)
    console.log("MESSAGE ID:", info.messageId)
    console.log("===================================")

    return true

  } catch (err) {

    console.log("===================================")
    console.log("❌ EMAIL SEND ERROR")
    console.log(err)
    console.log("===================================")

    throw err
  }
}