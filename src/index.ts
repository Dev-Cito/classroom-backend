import express from "express";
import subjectsRouter from "./routes/subjects";

const app = express();

const PORT = 8080;

app.use(express.json());

app.use("/api/subjects", subjectsRouter)

app.get("/", (req, res) => {
  res.send("Welcome to the classroom API!");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
})