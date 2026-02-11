import express, { Request, Response } from "express";

const app = express();
const PORT = 8080;

// Middleware
app.use(express.json());

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.send("Classroom backend API is running!🚀");
});

// Start server
app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Server is running at ${url}`);
});
