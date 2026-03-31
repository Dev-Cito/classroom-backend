import AgentAPI from "apminsight";
AgentAPI.config()

import express from "express";
import subjectsRouter from "./routes/subjects.js";
import usersRouter from "./routes/users.js";
import cors from "cors";
import securityMiddleware from "./middleware/security.js";
import {toNodeHandler} from "better-auth/node";
import auth from "./lib/auth.js";
import classesRouter from "./routes/classes.js";


const app = express();
const PORT = process.env.PORT || 8080;

const allowedOrigins = [
  'https://classroom-frontend-plum.vercel.app',
  'https://classroom-frontend-git-main-dev-citos-projects.vercel.app',
  process.env.FRONTEND_URL,
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    console.log("Incoming origin:", origin);

    if (!origin) return callback(null, true);

    if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }

    console.warn(`[CORS] Blocked: ${origin}`);
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 204,
}));
app.use(express.json());

app.use((req, res, next) => {
  const origin = req.headers.origin || '(no origin)';
  console.log(`[REQ] ${req.method} ${req.path} - Origin: ${origin}`);
  next();
});


app.all('/api/auth/*splat', toNodeHandler(auth));

app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end();
});

app.use(securityMiddleware);

app.use("/api/subjects", subjectsRouter)
app.use("/api/users", usersRouter)
app.use("/api/classes", classesRouter)

app.get("/", (req, res) => {
  res.send("Welcome to the classroom API!");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on port ${PORT}`);
});
