import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

// Dynamic CORS Middleware to support external frontends (e.g. Netlify)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    res.header("Access-Control-Allow-Origin", "*");
  }
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Path to bets storage
const BETS_FILE = path.join(process.cwd(), "bets.json");

// Admin credentials
const ADMIN_USER = "Iblamehsan";
const ADMIN_PASS = "200379ea";
const ADMIN_TOKEN = "arcpredict_admin_super_secret_token_2026_ebf821";

// Helpers to load/save bets
function getBets(): any[] {
  try {
    if (fs.existsSync(BETS_FILE)) {
      const data = fs.readFileSync(BETS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading bets file:", err);
  }
  return [];
}

function saveBets(bets: any[]) {
  try {
    fs.writeFileSync(BETS_FILE, JSON.stringify(bets, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing bets file:", err);
  }
}

// 16 World Cup 2026 Round of 32 Matches Definitions
const serverMatches = [
  { id: 1, group: "Round of 32", teamA: "South Africa", teamB: "Canada", logoA: "🇿🇦", logoB: "🇨🇦", oddsYes: "2.10", oddsDraw: "2.90", oddsNo: "2.50", probYes: "38%", probDraw: "30%", probNo: "32%", date: "June 28, 19:00 UTC", kickoff: "2026-06-28T19:00:00Z" },
  { id: 2, group: "Round of 32", teamA: "Brazil", teamB: "Japan", logoA: "🇧🇷", logoB: "🇯🇵", oddsYes: "1.35", oddsDraw: "3.75", oddsNo: "5.45", probYes: "62%", probDraw: "23%", probNo: "15%", date: "June 29, 17:00 UTC", kickoff: "2026-06-29T17:00:00Z" },
  { id: 3, group: "Round of 32", teamA: "Germany", teamB: "Paraguay", logoA: "🇩🇪", logoB: "🇵🇾", oddsYes: "1.45", oddsDraw: "3.50", oddsNo: "4.75", probYes: "58%", probDraw: "24%", probNo: "18%", date: "June 29, 20:30 UTC", kickoff: "2026-06-29T20:30:00Z" },
  { id: 4, group: "Round of 32", teamA: "Netherlands", teamB: "Morocco", logoA: "🇳🇱", logoB: "🇲🇦", oddsYes: "1.85", oddsDraw: "2.95", oddsNo: "2.80", probYes: "43%", probDraw: "28%", probNo: "29%", date: "June 30, 01:00 UTC", kickoff: "2026-06-30T01:00:00Z" },
  { id: 5, group: "Round of 32", teamA: "Ivory Coast", teamB: "Norway", logoA: "🇨🇮", logoB: "🇳🇴", oddsYes: "2.25", oddsDraw: "2.85", oddsNo: "2.35", probYes: "35%", probDraw: "29%", probNo: "36%", date: "June 30, 17:00 UTC", kickoff: "2026-06-30T17:00:00Z" },
  { id: 6, group: "Round of 32", teamA: "France", teamB: "Sweden", logoA: "🇫🇷", logoB: "🇸🇪", oddsYes: "1.40", oddsDraw: "3.60", oddsNo: "5.00", probYes: "60%", probDraw: "24%", probNo: "16%", date: "June 30, 21:00 UTC", kickoff: "2026-06-30T21:00:00Z" },
  { id: 7, group: "Round of 32", teamA: "Mexico", teamB: "Ecuador", logoA: "🇲🇽", logoB: "🇪🇨", oddsYes: "1.95", oddsDraw: "2.90", oddsNo: "2.65", probYes: "41%", probDraw: "30%", probNo: "29%", date: "July 1, 01:00 UTC", kickoff: "2026-07-01T01:00:00Z" },
  { id: 8, group: "Round of 32", teamA: "England", teamB: "DR Congo", logoA: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logoB: "🇨🇩", oddsYes: "1.25", oddsDraw: "4.00", oddsNo: "6.50", probYes: "67%", probDraw: "21%", probNo: "12%", date: "July 1, 16:00 UTC", kickoff: "2026-07-01T16:00:00Z" },
  { id: 9, group: "Round of 32", teamA: "Belgium", teamB: "Senegal", logoA: "🇧🇪", logoB: "🇸🇳", oddsYes: "1.55", oddsDraw: "3.25", oddsNo: "4.20", probYes: "54%", probDraw: "26%", probNo: "20%", date: "July 1, 20:00 UTC", kickoff: "2026-07-01T20:00:00Z" },
  { id: 10, group: "Round of 32", teamA: "USA", teamB: "Bosnia & Herzegovina", logoA: "🇺🇸", logoB: "🇧🇦", oddsYes: "1.75", oddsDraw: "3.00", oddsNo: "3.35", probYes: "47%", probDraw: "28%", probNo: "25%", date: "July 2, 00:00 UTC", kickoff: "2026-07-02T00:00:00Z" },
  { id: 11, group: "Round of 32", teamA: "Spain", teamB: "Austria", logoA: "🇪🇸", logoB: "🇦🇹", oddsYes: "1.50", oddsDraw: "3.40", oddsNo: "4.50", probYes: "56%", probDraw: "25%", probNo: "19%", date: "July 2, 19:00 UTC", kickoff: "2026-07-02T19:00:00Z" },
  { id: 12, group: "Round of 32", teamA: "Portugal", teamB: "Croatia", logoA: "🇵🇹", logoB: "🇭🇷", oddsYes: "1.80", oddsDraw: "3.00", oddsNo: "2.90", probYes: "44%", probDraw: "28%", probNo: "28%", date: "July 2, 23:00 UTC", kickoff: "2026-07-02T23:00:00Z" },
  { id: 13, group: "Round of 32", teamA: "Switzerland", teamB: "Algeria", logoA: "🇨🇭", logoB: "🇩🇿", oddsYes: "1.90", oddsDraw: "2.95", oddsNo: "2.75", probYes: "42%", probDraw: "29%", probNo: "29%", date: "July 3, 03:00 UTC", kickoff: "2026-07-03T03:00:00Z" },
  { id: 14, group: "Round of 32", teamA: "Australia", teamB: "Egypt", logoA: "🇦🇺", logoB: "🇪🇬", oddsYes: "2.15", oddsDraw: "2.85", oddsNo: "2.45", probYes: "37%", probDraw: "30%", probNo: "33%", date: "July 3, 18:00 UTC", kickoff: "2026-07-03T18:00:00Z" },
  { id: 15, group: "Round of 32", teamA: "Argentina", teamB: "Cape Verde", logoA: "🇦🇷", logoB: "🇨🇻", oddsYes: "1.12", oddsDraw: "5.00", oddsNo: "9.00", probYes: "75%", probDraw: "17%", probNo: "8%", date: "July 3, 22:00 UTC", kickoff: "2026-07-03T22:00:00Z" },
  { id: 16, group: "Round of 32", teamA: "Colombia", teamB: "Ghana", logoA: "🇨🇴", logoB: "🇬🇭", oddsYes: "1.65", oddsDraw: "3.15", oddsNo: "3.65", probYes: "51%", probDraw: "26%", probNo: "23%", date: "July 4, 01:30 UTC", kickoff: "2026-07-04T01:30:00Z" }
];

// Persistent match scores system
interface ScoreOverride {
  scoreA: number;
  scoreB: number;
  completed?: boolean;
  timeLabel?: string;
}

let scoreOverrides: { [matchId: number]: ScoreOverride } = {};
const SCORES_FILE = path.join(process.cwd(), "scores.json");

function loadScores() {
  try {
    if (fs.existsSync(SCORES_FILE)) {
      const data = fs.readFileSync(SCORES_FILE, "utf-8");
      scoreOverrides = JSON.parse(data);
    } else {
      // Default: Canada vs South Africa ended 1-0 for Canada.
      // TeamA is South Africa (0) and TeamB is Canada (1).
      scoreOverrides = {
        1: { scoreA: 0, scoreB: 1, completed: true, timeLabel: "FT" }
      };
      saveScores();
    }
  } catch (err) {
    console.error("Error reading scores.json:", err);
  }
}

function saveScores() {
  try {
    fs.writeFileSync(SCORES_FILE, JSON.stringify(scoreOverrides, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing scores.json:", err);
  }
}

// Perform initial score load
loadScores();

// Helper to calculate live or final match score
function getMatchScore(matchId: number) {
  const match = serverMatches.find(m => m.id === matchId);
  if (!match) return null;
  
  const kickoffTime = new Date(match.kickoff);
  const now = new Date();
  const isPastKickoff = now >= kickoffTime;
  const isCompleted = now >= new Date(kickoffTime.getTime() + 7200000); // 2 hours
  
  if (scoreOverrides[matchId]) {
    const o = scoreOverrides[matchId];
    return {
      started: true,
      completed: o.completed !== undefined ? o.completed : isCompleted,
      scoreA: o.scoreA,
      scoreB: o.scoreB,
      display: `${o.scoreA} - ${o.scoreB}`,
      time: o.timeLabel || (isCompleted ? "FT" : "LIVE")
    };
  }

  if (!isPastKickoff) {
    return { started: false, completed: false, scoreA: 0, scoreB: 0, display: "0 - 0", time: "00'" };
  }
  
  const elapsedMs = now.getTime() - kickoffTime.getTime();
  const elapsedMinutes = Math.min(120, Math.floor(elapsedMs / 60000));
  
  const goalMinutesA = [(match.id * 17) % 85 + 5, (match.id * 37) % 85 + 5].filter((val, i, arr) => arr.indexOf(val) === i);
  const goalMinutesB = [(match.id * 29) % 85 + 5, (match.id * 47) % 85 + 5].filter((val, i, arr) => arr.indexOf(val) === i);
  
  const maxA = parseFloat(match.oddsYes) < parseFloat(match.oddsNo) ? 3 : 2;
  const maxB = parseFloat(match.oddsNo) < parseFloat(match.oddsYes) ? 3 : 2;
  
  const activeA = goalMinutesA.slice(0, maxA);
  const activeB = goalMinutesB.slice(0, maxB);
  
  let scoreA = 0;
  let scoreB = 0;
  
  activeA.forEach(m => {
    if (elapsedMinutes >= m) scoreA++;
  });
  
  activeB.forEach(m => {
    if (elapsedMinutes >= m) scoreB++;
  });
  
  let timeLabel = "";
  if (isCompleted) {
    timeLabel = "FT";
  } else {
    timeLabel = elapsedMinutes <= 90 ? `${elapsedMinutes}'` : `90+${elapsedMinutes - 90}'`;
  }
  
  return {
    started: true,
    completed: isCompleted,
    scoreA,
    scoreB,
    display: `${scoreA} - ${scoreB}`,
    time: timeLabel
  };
}

// Helper to determine the winner of a match deterministically based on match kickoff and current time
function getMatchWinner(matchId: number): "YES" | "NO" | "DRAW" | null {
  const score = getMatchScore(matchId);
  if (!score || !score.started || !score.completed) return null;
  if (score.scoreA > score.scoreB) return "YES";
  if (score.scoreA < score.scoreB) return "NO";
  return "DRAW";
}

// API Endpoint to fetch current leaderboard stats
app.get("/api/leaderboard", (req, res) => {
  try {
    const bets = getBets();
    const addressStats: { [walletAddress: string]: { wins: number; total: number; profit: number } } = {};
    
    // Seed some active top gamblers so leaderboard has content right away
    const seedPlayers = [
      { walletAddress: "0x71C80a...8E5a", wins: 14, total: 22, profit: 12.50 },
      { walletAddress: "0x3Fd912...19Bc", wins: 11, total: 18, profit: 8.20 },
      { walletAddress: "0x9Aa00c...F52d", wins: 9, total: 15, profit: 5.40 },
      { walletAddress: "0x2Db765...48Ce", wins: 8, total: 12, profit: 6.80 },
      { walletAddress: "0xE1f52a...907A", wins: 6, total: 10, profit: 3.10 }
    ];
    
    // Group and calculate wins for real user bets
    bets.forEach((bet) => {
      const addr = bet.walletAddress;
      if (!addr) return;
      
      if (!addressStats[addr]) {
        addressStats[addr] = { wins: 0, total: 0, profit: 0.0 };
      }
      addressStats[addr].total += 1;
      
      let isWin = false;
      let resolved = false;

      if (bet.matchId === "champion") {
        const now = new Date();
        const tournamentEnd = new Date("2026-07-04T00:00:00Z"); // Resolved after round of 32 finishes
        if (now >= tournamentEnd) {
          resolved = true;
          if (bet.teamName === "Brazil") {
            isWin = true;
          }
        }
      } else {
        const mId = parseInt(bet.matchId);
        const match = serverMatches.find(m => m.id === mId);
        if (match) {
          const score = getMatchScore(mId);
          if (score && score.completed) {
            resolved = true;
            if (bet.pick && (bet.pick.startsWith("OVER_") || bet.pick.startsWith("UNDER_"))) {
              // Over / Under goals bet resolution
              const totalGoals = score.scoreA + score.scoreB;
              const threshold = parseFloat(bet.pick.split("_")[1]);
              if (bet.pick.startsWith("OVER_")) {
                isWin = totalGoals > threshold;
              } else {
                isWin = totalGoals < threshold;
              }
            } else {
              // Standard 1X2 outcome
              const winner = getMatchWinner(mId);
              if (winner !== null && bet.pick === winner) {
                isWin = true;
              }
            }
          }
        }
      }

      if (resolved) {
        if (isWin) {
          addressStats[addr].wins += 1;
          const returnMultiplier = parseFloat(bet.odds) || 1.0;
          addressStats[addr].profit += (returnMultiplier - 1.0);
        } else {
          addressStats[addr].profit -= 1.0;
        }
      }
    });
    
    // Merge seeds and real users
    const mergedList: any[] = [];
    
    // Add seeds first
    seedPlayers.forEach(p => {
      mergedList.push({
        walletAddress: p.walletAddress,
        wins: p.wins,
        total: p.total,
        profit: p.profit,
        isSeed: true
      });
    });
    
    // Add real users
    Object.keys(addressStats).forEach(addr => {
      const displayAddr = addr.length > 12 ? (addr.substring(0, 8) + "..." + addr.substring(addr.length - 4)) : addr;
      
      // Match seed by truncated format or exact
      const seedIndex = mergedList.findIndex(p => {
        const pAddr = p.walletAddress || "";
        return pAddr.toLowerCase() === displayAddr.toLowerCase() || pAddr.toLowerCase() === addr.toLowerCase();
      });
      const stats = addressStats[addr];
      
      if (seedIndex >= 0) {
        mergedList[seedIndex].wins += stats.wins;
        mergedList[seedIndex].total += stats.total;
        mergedList[seedIndex].profit += stats.profit;
        mergedList[seedIndex].isSeed = false;
      } else {
        mergedList.push({
          walletAddress: addr,
          wins: stats.wins,
          total: stats.total,
          profit: stats.profit,
          isSeed: false
        });
      }
    });
    
    // Sort by wins desc, then profit desc
    mergedList.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.profit - a.profit;
    });
    
    const top10 = mergedList.slice(0, 10);
    return res.json({ success: true, leaderboard: top10 });
  } catch (err) {
    console.error("Error generating leaderboard:", err);
    return res.status(500).json({ error: "Failed to generate leaderboard stats" });
  }
});

// API Endpoint to record user bet
app.post("/api/record-bet", (req, res) => {
  try {
    const bet = req.body;
    if (!bet || !bet.walletAddress || !bet.matchId) {
      return res.status(400).json({ error: "Invalid bet data structure" });
    }

    const bets = getBets();
    const newRecord = {
      id: Date.now() + Math.random().toString(36).substr(2, 5),
      walletAddress: bet.walletAddress,
      matchId: bet.matchId,
      teamA: bet.teamA || "Team A",
      teamB: bet.teamB || "Team B",
      logoA: bet.logoA || "⚽",
      logoB: bet.logoB || "⚽",
      pick: bet.pick || "YES",
      teamName: bet.teamName || bet.teamA || "Team A",
      odds: bet.odds || "1.00",
      amount: "1.00",
      timestamp: bet.timestamp || new Date().toISOString()
    };

    bets.push(newRecord);
    saveBets(bets);

    console.log(`[DATABASE] Recorded bet for wallet ${bet.walletAddress} on match #${bet.matchId}`);
    return res.json({ success: true, record: newRecord });
  } catch (err: any) {
    console.error("Error recording bet:", err);
    return res.status(500).json({ error: "Failed to record bet on server" });
  }
});

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

    console.log(`[TRADE REPORT] Received trade report request: "${subject}"`);

    if (!user || !pass) {
      console.warn("SMTP_USER and/or SMTP_PASS are not configured in environment variables. Email could not be sent.");
      return res.json({
        success: true,
        logged: true,
        message: "Trade report logged on server. (SMTP credentials not configured in secrets panel)"
      });
    }

    // Initialize transporter elegantly, with Gmail service fallback for maximum reliability
    let transporter;
    if (host === "smtp.gmail.com" || user.endsWith("@gmail.com")) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user,
          pass,
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });
    }

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

// Admin login endpoint
app.post("/api/admin/login", (req, res) => {
  try {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      return res.json({ success: true, token: ADMIN_TOKEN });
    }
    return res.status(401).json({ error: "Invalid username or password" });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Admin secure bets list endpoint
app.get("/api/admin/bets", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${ADMIN_TOKEN}`) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    const bets = getBets();
    return res.json({ success: true, bets });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load bets" });
  }
});

// GET matches and their current live/overridden scores
app.get("/api/match-scores", (req, res) => {
  return res.json({ success: true, scores: scoreOverrides });
});

// Update a match score override (Secure, requires Admin authentication)
app.post("/api/match-scores", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${ADMIN_TOKEN}`) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    
    const { matchId, scoreA, scoreB, completed, timeLabel } = req.body;
    if (!matchId) {
      return res.status(400).json({ error: "Missing matchId" });
    }
    
    const parsedA = parseInt(scoreA, 10);
    const parsedB = parseInt(scoreB, 10);
    scoreOverrides[matchId] = {
      scoreA: isNaN(parsedA) ? 0 : parsedA,
      scoreB: isNaN(parsedB) ? 0 : parsedB,
      completed: !!completed,
      timeLabel: timeLabel || (completed ? "FT" : "LIVE")
    };
    
    saveScores();
    return res.json({ success: true, scores: scoreOverrides });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update score" });
  }
});

// Admin management room HTML serving route
app.get("/management", (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ArcPredict • Central Management Room</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
      body {
        font-family: 'Inter', sans-serif;
        background-color: #030112;
      }
      .font-display {
        font-family: 'Space Grotesk', sans-serif;
      }
      .font-mono {
        font-family: 'JetBrains Mono', monospace;
      }
      /* Custom Scrollbar */
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      ::-webkit-scrollbar-track {
        background: #030112;
      }
      ::-webkit-scrollbar-thumb {
        background: #1e154a;
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #3b2282;
      }
    </style>
  </head>
  <body class="text-slate-100 min-h-screen flex flex-col justify-between">
    
    <!-- Top Nav Header -->
    <header class="border-b border-purple-950/70 bg-[#06041c]/90 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <i data-lucide="shield-check" class="w-4 h-4 text-white"></i>
          </div>
          <div>
            <h1 class="text-sm font-bold tracking-tight uppercase font-display text-white">ArcPredict</h1>
            <p class="text-[9px] text-purple-400 font-bold uppercase tracking-widest leading-none mt-0.5">Central Audit & Management Room</p>
          </div>
        </div>
        <div id="logout-container" class="hidden">
          <button onclick="handleLogout()" class="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-900 text-purple-200 text-xs font-semibold rounded-lg transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer">
            <i data-lucide="log-out" class="w-3.5 h-3.5"></i> Logout
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-8 flex-grow w-full flex items-center justify-center">

      <!-- ================= LOGIN CARD ================= -->
      <div id="login-card" class="w-full max-w-md bg-[#0a0724] border border-purple-900/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600"></div>
        <div class="text-center mb-6">
          <div class="inline-flex p-3 bg-purple-950/50 rounded-full border border-purple-900/40 text-purple-400 mb-3">
            <i data-lucide="lock" class="w-6 h-6"></i>
          </div>
          <h2 class="text-xl font-bold font-display text-white">Authorized Access Only</h2>
          <p class="text-xs text-purple-400 mt-1">Please enter your node management credentials</p>
        </div>

        <form id="login-form" onsubmit="handleLogin(event)" class="space-y-4">
          <div>
            <label class="block text-[10px] uppercase font-mono tracking-wider text-purple-300 font-semibold mb-1.5">Username</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-500">
                <i data-lucide="user" class="w-4 h-4"></i>
              </span>
              <input 
                type="text" 
                id="username-field" 
                required
                class="w-full bg-[#030112] border border-purple-900/60 rounded-lg pl-9 pr-3 py-2 text-xs text-purple-100 placeholder-purple-850 focus:border-purple-500 focus:outline-none transition-all font-sans font-medium" 
                placeholder="Enter username" 
              />
            </div>
          </div>

          <div>
            <label class="block text-[10px] uppercase font-mono tracking-wider text-purple-300 font-semibold mb-1.5">Password</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-500">
                <i data-lucide="key-round" class="w-4 h-4"></i>
              </span>
              <input 
                type="password" 
                id="password-field" 
                required
                class="w-full bg-[#030112] border border-purple-900/60 rounded-lg pl-9 pr-3 py-2 text-xs text-purple-100 placeholder-purple-850 focus:border-purple-500 focus:outline-none transition-all font-sans font-medium" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <div id="login-error" class="hidden text-[11px] text-red-400 font-medium bg-red-950/40 border border-red-900/40 p-2.5 rounded-lg flex items-center gap-1.5">
            <i data-lucide="alert-triangle" class="w-3.5 h-3.5 flex-shrink-0"></i>
            <span id="error-text">Invalid credentials. Access denied.</span>
          </div>

          <button 
            type="submit" 
            class="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer"
          >
            Authenticate <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </button>
        </form>
      </div>

      <!-- ================= MAIN DASHBOARD CONTAINER ================= -->
      <div id="dashboard-container" class="hidden w-full space-y-6">
        
        <!-- Stats Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total Predictions -->
          <div class="bg-[#0a0724] border border-purple-900/60 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span class="text-[9px] font-bold uppercase tracking-widest text-purple-400 block font-mono">Total Predictions</span>
              <span id="stat-total" class="text-2xl font-bold font-display text-white block mt-1">0</span>
            </div>
            <div class="p-3 bg-purple-950/50 rounded-lg text-purple-400 border border-purple-900/30">
              <i data-lucide="database" class="w-5 h-5"></i>
            </div>
          </div>

          <!-- Total Locked Volume -->
          <div class="bg-[#0a0724] border border-purple-900/60 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span class="text-[9px] font-bold uppercase tracking-widest text-purple-400 block font-mono">Total Stake Locked</span>
              <span id="stat-volume" class="text-2xl font-bold font-display text-white block mt-1">0.00 USDC</span>
            </div>
            <div class="p-3 bg-purple-950/50 rounded-lg text-green-400 border border-purple-900/30">
              <i data-lucide="coins" class="w-5 h-5"></i>
            </div>
          </div>

          <!-- Active Wallet Addresses -->
          <div class="bg-[#0a0724] border border-purple-900/60 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span class="text-[9px] font-bold uppercase tracking-widest text-purple-400 block font-mono">Active Wallets</span>
              <span id="stat-wallets" class="text-2xl font-bold font-display text-white block mt-1">0</span>
            </div>
            <div class="p-3 bg-purple-950/50 rounded-lg text-indigo-400 border border-purple-900/30">
              <i data-lucide="wallet" class="w-5 h-5"></i>
            </div>
          </div>

          <!-- Audit Reporting Node Status -->
          <div class="bg-[#0a0724] border border-purple-900/60 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span class="text-[9px] font-bold uppercase tracking-widest text-purple-400 block font-mono">System Status</span>
              <span class="text-sm font-bold uppercase text-green-400 flex items-center gap-1.5 mt-2.5">
                <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Node Online
              </span>
            </div>
            <div class="p-3 bg-purple-950/50 rounded-lg text-green-400 border border-purple-900/30">
              <i data-lucide="activity" class="w-5 h-5"></i>
            </div>
          </div>
        </div>

        <!-- Table Card -->
        <div class="bg-[#0a0724] border border-purple-900/60 rounded-2xl overflow-hidden shadow-2xl">
          <div class="p-5 border-b border-purple-950 bg-[#0e0a30]/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 class="text-base font-bold font-display text-white">Consolidated Client Predictions</h3>
              <p class="text-[11px] text-purple-300">Detailed record of all trades locked across every user wallet</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="relative max-w-xs">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-400">
                  <i data-lucide="search" class="w-3.5 h-3.5"></i>
                </span>
                <input 
                  type="text" 
                  id="search-input" 
                  oninput="filterBetsTable()" 
                  placeholder="Search wallet, fixture or outcome" 
                  class="bg-[#030112] border border-purple-900/60 rounded-lg pl-8 pr-3 py-1.5 text-[11px] text-purple-100 placeholder-purple-800 focus:border-purple-500 focus:outline-none w-56 font-sans"
                />
              </div>
              <button onclick="loadBets()" class="p-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-900 text-purple-200 rounded-lg transition-all active:scale-95 cursor-pointer" title="Refresh records">
                <i data-lucide="refresh-cw" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-purple-950/40 border-b border-purple-950 text-purple-300 font-mono text-[10px] uppercase font-bold tracking-wider">
                  <th class="py-3.5 px-5">Timestamp (UTC)</th>
                  <th class="py-3.5 px-5">User Wallet Address</th>
                  <th class="py-3.5 px-5">Fixture / Match</th>
                  <th class="py-3.5 px-5">Chosen Outcome</th>
                  <th class="py-3.5 px-5 text-right">Odds</th>
                  <th class="py-3.5 px-5 text-right">Stake</th>
                </tr>
              </thead>
              <tbody id="bets-table-body" class="divide-y divide-purple-950/60">
                <!-- Injected dynamically -->
                <tr>
                  <td colspan="6" class="py-12 text-center text-purple-400 font-mono">
                    <div class="inline-block animate-spin w-5 h-5 border-2 border-purple-500/20 border-t-purple-500 rounded-full mb-2"></div>
                    <div>Establishing handshake with audit node database...</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Real-time Match Score Board & Live Controls -->
        <div class="bg-[#0a0724] border border-purple-900/60 rounded-2xl overflow-hidden shadow-2xl">
          <div class="p-5 border-b border-purple-950 bg-[#0e0a30]/80">
            <h3 class="text-base font-bold font-display text-white">🏆 Real-time Match Score Board & Live Controls</h3>
            <p class="text-[11px] text-purple-300">Override and correct score status for live and finished fixtures of World Cup 2026. All active prediction evaluations instantly follow these scores.</p>
          </div>
          
          <div class="p-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="scores-control-grid">
              <div class="col-span-1 md:col-span-2 text-center text-purple-400 font-mono py-6">
                Loading live scoreboard controllers...
              </div>
            </div>
          </div>
        </div>

      </div>

    </main>

    <!-- Clean Minimalist Footer -->
    <footer class="border-t border-purple-950 bg-[#040214] py-6 text-center text-[10px] font-mono text-purple-400 uppercase tracking-widest opacity-80">
      ArcPredict Core Verification Protocol • Node 2026-6 • Secure Socket Active
    </footer>

    <!-- Script Logic -->
    <script>
      let adminToken = localStorage.getItem("arcpredict_admin_token") || "";
      let allBets = [];

      // Auto-load screen state on page boot
      window.addEventListener("DOMContentLoaded", () => {
        if (adminToken) {
          showDashboard();
        } else {
          showLogin();
        }
        if (typeof lucide !== "undefined") {
          lucide.createIcons();
        }
      });

      // Complete match layout list for the central controllers
      const serverMatches = [
        { id: 1, teamA: "South Africa", teamB: "Canada", logoA: "🇿🇦", logoB: "🇨🇦" },
        { id: 2, teamA: "Brazil", teamB: "Japan", logoA: "🇧🇷", logoB: "🇯🇵" },
        { id: 3, teamA: "Germany", teamB: "Paraguay", logoA: "🇩🇪", logoB: "🇵🇾" },
        { id: 4, teamA: "Netherlands", teamB: "Morocco", logoA: "🇳🇱", logoB: "🇲🇦" },
        { id: 5, teamA: "Ivory Coast", teamB: "Norway", logoA: "🇨🇮", logoB: "🇳🇴" },
        { id: 6, teamA: "France", teamB: "Sweden", logoA: "🇫🇷", logoB: "🇸🇪" },
        { id: 7, teamA: "Mexico", teamB: "Ecuador", logoA: "🇲🇽", logoB: "🇪🇨" },
        { id: 8, teamA: "England", teamB: "DR Congo", logoA: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logoB: "🇨🇩" },
        { id: 9, teamA: "Belgium", teamB: "Senegal", logoA: "🇧🇪", logoB: "🇸🇳" },
        { id: 10, teamA: "USA", teamB: "Bosnia & Herzegovina", logoA: "🇺🇸", logoB: "🇧🇦" },
        { id: 11, teamA: "Spain", teamB: "Austria", logoA: "🇪🇸", logoB: "🇦🇹" },
        { id: 12, teamA: "Portugal", teamB: "Croatia", logoA: "🇵🇹", logoB: "🇭🇷" },
        { id: 13, teamA: "Switzerland", teamB: "Algeria", logoA: "🇨🇭", logoB: "🇩🇿" },
        { id: 14, teamA: "Australia", teamB: "Egypt", logoA: "🇦🇺", logoB: "🇪🇬" },
        { id: 15, teamA: "Argentina", teamB: "Cape Verde", logoA: "🇦🇷", logoB: "🇨🇻" },
        { id: 16, teamA: "Colombia", teamB: "Ghana", logoA: "🇨🇴", logoB: "🇬🇭" }
      ];

      let scoreOverrides = {};

      async function loadScores() {
        try {
          const res = await fetch("/api/match-scores");
          const data = await res.json();
          if (data.success) {
            scoreOverrides = data.scores || {};
          }
          renderScoresControl();
        } catch (err) {
          console.error("Failed to load scores", err);
        }
      }

      function renderScoresControl() {
        const grid = document.getElementById("scores-control-grid");
        if (!grid) return;
        grid.innerHTML = "";

        serverMatches.forEach(match => {
          const over = scoreOverrides[match.id] || { scoreA: 0, scoreB: 0, completed: false, timeLabel: "" };
          const card = document.createElement("div");
          card.className = "p-3 bg-purple-950/25 border border-purple-900/40 rounded-xl flex flex-col justify-between gap-3 text-xs";
          card.innerHTML = \`
            <div class="flex items-center justify-between border-b border-purple-900/30 pb-2">
              <span class="font-bold text-white font-mono">Match #\${match.id}</span>
              <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold \${over.completed ? "bg-green-950/60 text-green-400 border border-green-900/30" : "bg-purple-950 text-purple-300"}">
                \${over.timeLabel || (over.completed ? "FT" : "LIVE")}
              </span>
            </div>
            
            <div class="flex items-center justify-between gap-4 py-1">
              <div class="flex items-center gap-2 w-1/3">
                <span class="text-base">\${match.logoA}</span>
                <span class="font-medium text-slate-200 truncate font-display">\${match.teamA}</span>
              </div>
              
              <div class="flex items-center gap-2 justify-center w-1/3">
                <input 
                  type="number" 
                  id="score-a-\${match.id}" 
                  value="\${over.scoreA}" 
                  class="w-10 bg-[#030112] border border-purple-900/60 rounded text-center py-1 text-white font-bold text-xs"
                  min="0"
                />
                <span class="text-purple-400 font-bold">:</span>
                <input 
                  type="number" 
                  id="score-b-\${match.id}" 
                  value="\${over.scoreB}" 
                  class="w-10 bg-[#030112] border border-purple-900/60 rounded text-center py-1 text-white font-bold text-xs"
                  min="0"
                />
              </div>
              
              <div class="flex items-center gap-2 justify-end w-1/3 text-right">
                <span class="font-medium text-slate-200 truncate font-display mr-2">\${match.teamB}</span>
                <span class="text-base">\${match.logoB}</span>
              </div>
            </div>
            
            <div class="flex items-center justify-between gap-3 pt-2 border-t border-purple-900/30">
              <label class="flex items-center gap-1.5 cursor-pointer text-[10px] text-purple-300 select-none">
                <input 
                  type="checkbox" 
                  id="completed-\${match.id}" 
                  \${over.completed ? "checked" : ""} 
                  class="rounded bg-[#030112] border-purple-900 text-purple-600 focus:ring-0"
                />
                Completed (FT)
              </label>
              
              <input 
                type="text" 
                id="time-label-\${match.id}" 
                value="\${over.timeLabel || ""}" 
                placeholder="FT or 65'" 
                class="bg-[#030112] border border-purple-900/60 rounded px-2 py-0.5 text-[10px] text-purple-200 w-24 text-center placeholder-purple-800"
              />
              
              <button 
                onclick="saveMatchScore(\${match.id})" 
                class="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] rounded transition-all active:scale-95 cursor-pointer"
              >
                Save
              </button>
            </div>
          \`;
          grid.appendChild(card);
        });
      }

      async function saveMatchScore(matchId) {
        const scoreA = document.getElementById(\`score-a-\${matchId}\`).value;
        const scoreB = document.getElementById(\`score-b-\${matchId}\`).value;
        const completed = document.getElementById(\`completed-\${matchId}\`).checked;
        const timeLabel = document.getElementById(\`time-label-\${matchId}\`).value;

        try {
          const res = await fetch("/api/match-scores", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": "Bearer " + adminToken
            },
            body: JSON.stringify({
              matchId,
              scoreA,
              scoreB,
              completed,
              timeLabel
            })
          });

          const data = await res.json();
          if (data.success) {
            scoreOverrides = data.scores || {};
            renderScoresControl();
            loadBets(); // reload stats to reflect score update
          } else {
            alert("Error: " + (data.error || "Failed to update"));
          }
        } catch (err) {
          alert("Error saving score: " + err.message);
        }
      }

      function showLogin() {
        document.getElementById("login-card").classList.remove("hidden");
        document.getElementById("dashboard-container").classList.add("hidden");
        document.getElementById("logout-container").classList.add("hidden");
      }

      function showDashboard() {
        document.getElementById("login-card").classList.add("hidden");
        document.getElementById("dashboard-container").classList.remove("hidden");
        document.getElementById("logout-container").classList.remove("hidden");
        loadBets();
        loadScores();
      }

      async function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById("username-field").value;
        const password = document.getElementById("password-field").value;
        const errorDiv = document.getElementById("login-error");

        errorDiv.classList.add("hidden");

        try {
          const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
          });

          if (!res.ok) {
            throw new Error("Invalid username or password");
          }

          const data = await res.json();
          adminToken = data.token;
          localStorage.setItem("arcpredict_admin_token", adminToken);
          showDashboard();
        } catch (err) {
          errorDiv.classList.remove("hidden");
          document.getElementById("error-text").innerText = err.message || "Failed to authenticate";
        }
      }

      function handleLogout() {
        adminToken = "";
        localStorage.removeItem("arcpredict_admin_token");
        showLogin();
      }

      async function loadBets() {
        const body = document.getElementById("bets-table-body");
        try {
          const res = await fetch("/api/admin/bets", {
            headers: { "Authorization": "Bearer " + adminToken }
          });

          if (res.status === 401) {
            handleLogout();
            return;
          }

          const data = await res.json();
          if (data.success) {
            allBets = data.bets || [];
            renderStats();
            renderBetsTable(allBets);
          } else {
            throw new Error("Failed response state");
          }
        } catch (err) {
          body.innerHTML = \`
            <tr>
              <td colspan="6" class="py-12 text-center text-red-400 font-bold">
                <i data-lucide="alert-octagon" class="w-6 h-6 mx-auto mb-2 text-red-400"></i>
                Failed to load on-chain verified records. Please reload or authenticate again.
              </td>
            </tr>
          \`;
          if (typeof lucide !== "undefined") {
            lucide.createIcons();
          }
        }
      }

      function renderStats() {
        document.getElementById("stat-total").innerText = allBets.length;
        const totalVol = allBets.reduce((acc, bet) => acc + parseFloat(bet.amount || "1.00"), 0);
        document.getElementById("stat-volume").innerText = totalVol.toFixed(2) + " USDC";
        
        const wallets = new Set(allBets.map(b => b.walletAddress));
        document.getElementById("stat-wallets").innerText = wallets.size;
      }

      function renderBetsTable(betsList) {
        const body = document.getElementById("bets-table-body");
        if (betsList.length === 0) {
          body.innerHTML = \`
            <tr>
              <td colspan="6" class="py-12 text-center text-purple-400 font-mono">
                No active bets recorded on this node database yet.
              </td>
            </tr>
          \`;
          return;
        }

        body.innerHTML = betsList.map(bet => {
          const dt = new Date(bet.timestamp);
          const timeFormatted = dt.toLocaleDateString() + " " + dt.toLocaleTimeString();
          const shortWallet = bet.walletAddress.substring(0, 8) + "..." + bet.walletAddress.substring(bet.walletAddress.length - 8);
          
          return \`
            <tr class="hover:bg-purple-950/20 transition-all">
              <td class="py-3 px-5 font-mono text-purple-300 text-[11px]">\${timeFormatted}</td>
              <td class="py-3 px-5 font-mono text-purple-100 font-semibold text-[11px]" title="\${bet.walletAddress}">
                <span class="bg-purple-950/60 border border-purple-900/40 px-2 py-0.5 rounded text-[10px] select-all">\${shortWallet}</span>
              </td>
              <td class="py-3 px-5 font-display text-white font-medium text-[11px]">
                \${bet.logoA} \${bet.teamA} <span class="text-purple-400 text-[10px]">vs</span> \s\${bet.logoB} \${bet.teamB}
              </td>
              <td class="py-3 px-5">
                <span class="px-2 py-0.5 rounded font-extrabold text-[10px] uppercase bg-green-950/50 text-green-400 border border-green-900/50">
                  \${bet.pick} (\${bet.teamName})
                </span>
              </td>
              <td class="py-3 px-5 text-right font-mono text-purple-200 font-bold">\${bet.odds}x</td>
              <td class="py-3 px-5 text-right font-mono text-purple-100 font-bold">1.00 USDC</td>
            </tr>
          \`;
        }).join("");

        if (typeof lucide !== "undefined") {
          lucide.createIcons();
        }
      }

      function filterBetsTable() {
        const val = document.getElementById("search-input").value.toLowerCase();
        const filtered = allBets.filter(bet => {
          return bet.walletAddress.toLowerCase().includes(val) ||
                 bet.teamA.toLowerCase().includes(val) ||
                 bet.teamB.toLowerCase().includes(val) ||
                 bet.pick.toLowerCase().includes(val) ||
                 (bet.teamName && bet.teamName.toLowerCase().includes(val));
        });
        renderBetsTable(filtered);
      }
    </script>
  </body>
</html>
`;
  return res.send(html);
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
