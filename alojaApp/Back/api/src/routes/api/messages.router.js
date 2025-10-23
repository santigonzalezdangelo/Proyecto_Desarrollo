// src/routes/api/messages.routes.js
import { Router } from "express";
import messagesController from "../../controllers/messages.controller.js";
import { verifyToken } from "../../utils/jwt.js";

const AUTH_COOKIE = process.env.AUTH_COOKIE || "aloja_jwt";
const router = Router();

// auth mínima basada en cookie/Authorization usando tu verifyToken
function authRequired(req, res, next) {
  try {
    const cookie = req.headers.cookie || "";
    const token =
      req.headers.authorization?.replace("Bearer ", "") ||
      cookie
        .split(";")
        .map((v) => v.trim())
        .find((v) => v.startsWith(AUTH_COOKIE + "="))
        ?.split("=")[1];

    if (!token) return res.status(401).json({ error: "No token" });
    const payload = verifyToken(token);
    req.user = { id: Number(payload.id) };
    next();
  } catch {
    res.status(401).json({ error: "Auth failed" });
  }
}

router.get("/history", authRequired, messagesController.history);

export default router;
