import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import invoiceRoutes from "./routes/invoices.js";
import templateRoutes from "./routes/templates.js";
import analyticsRoutes from "./routes/analytics.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", app: "aurix-smart-invoice-api" });
});

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/templates", templateRoutes);
app.use("/analytics", analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
