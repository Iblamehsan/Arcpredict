import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API Endpoint to send trade report to amerehehsan@gmail.com
app.post("/api/send-trade", async (req, res) => {
  try {
    const { subject, htmlBody } = req.body;
    if (!subject || !htmlBody) {
      return res.status(400).json({ error: "Missing subject or htmlBody" });
    }

    const recipient = "amerehehsan@gmail.com";
    
    // Check SMTP configuration
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "587");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    console.log(`[TRADE REPORT] Received trade report: "${subject}"`);

    if (!user || !pass) {
      console.warn("SMTP_USER and/or SMTP_PASS are not configured in environment variables. Email could not be sent.");
      return res.json({
        success: true,
        logged: true,
        message: "Trade report logged on server. (SMTP credentials not configured in secrets panel)"
      });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from: `"ArcPredict Arena" <${user}>`,
      to: recipient,
      subject: subject,
      html: htmlBody,
    });

    console.log(`[EMAIL SUCCESS] Trade report email sent successfully to ${recipient}`);
    return res.json({
      success: true,
      sent: true,
      message: `Trade report sent successfully to ${recipient}`
    });

  } catch (error: any) {
    console.error("Error sending trade report:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message || error
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Fullstack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
