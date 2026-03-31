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
].filter(Boolean) as string[];

// CORS options: explicitly allow common preflight-triggering headers and methods
const corsOptions = {
  origin: (origin: any, callback: any) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // in development allow any origin to ease local testing
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[CORS] Non-matching origin in dev, allowing: ${origin}`);
      return callback(null, true);
    }

    console.warn(`[CORS] Rejected origin: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`);
    // do not throw an Error here; respond with CORS failure
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  // explicitly allow headers that commonly trigger preflight
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// apply CORS for all routes (must be before route handlers)
app.use(cors(corsOptions));

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


app.use("/api/subjects", subjectsRouter)
app.use("/api/users", usersRouter)
app.use("/api/classes", classesRouter)

app.use(securityMiddleware);


app.get("/", (req, res) => {
  res.send("Welcome to the classroom API!");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on port ${PORT}`);
});
