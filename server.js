import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connectDatabase from "./config/database.js";

connectDatabase();

const PORT = 1100;

app.get("/", (req, res) => {
  res.redirect(`${process.env.DOMAIN}`);
});

app.listen(PORT, () => {
  console.log(`active port: ${PORT} => mode: ${process.env.NODE_ENV}`);
});
