import express from "express";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import proveedoresRoutes from "./routes/proveedores.routes.js";
import ordenesRoutes from "./routes/ordenes.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import { pool } from "./db.js";
import { ORIGIN } from "./config.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.get("/", (req, res) => res.json({ message: "welcome to my API" }));
app.get("/api/ping", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  return res.json(result.rows[0]);
});
app.use("/api", authRoutes);
app.use("/api", proveedoresRoutes);
app.use("/api", ordenesRoutes);

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    status: "error",
    message: err.message,
  });
});

export default app;
