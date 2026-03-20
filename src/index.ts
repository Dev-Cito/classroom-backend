import AgentAPI from "apminsight";
AgentAPI.config()

import express from "express";
import subjectsRouter from "./routes/subjects.js";
import usersRouter from "./routes/users.js";
import classesRouter from "./routes/classes.js";
import cors from "cors";
import securityMiddleware from "./middleware/security.js";
import {toNodeHandler} from "better-auth/node";
import auth from "./lib/auth.js";

const app = express();
const PORT = 8080;


const allowedOrigins = [
  'https://classroom-frontend-plum.vercel.app',
  'https://classroom-frontend-git-main-dev-citos-projects.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end();
});

app.all('/api/auth/*splat', toNodeHandler(auth));
app.use('/api/auth', securityMiddleware);

app.use(express.json());
app.use(securityMiddleware);

app.use("/api/subjects", subjectsRouter)
app.use("/api/users", usersRouter)
app.use("/api/classes", classesRouter)

app.get("/", (req, res) => {
  res.send("Welcome to the classroom API!");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
})