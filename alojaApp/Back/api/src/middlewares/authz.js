// src/middlewares/authz.js
import { verifyToken } from "../utils/jwt.js";
import UserDao from "../dao/user.dao.js";

// (Opcional) constantes de nombres para evitar typos
export const ROLE_NAMES = {
  HUESPED: "huesped",
  ANFITRION: "anfitrion",
};

// Verifica JWT desde cookie y adjunta req.user: { id_usuario, id_rol, rol }
export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.aloja_jwt;
    if (!token) return res.status(401).json({ error: "No autenticado" });

    const decoded = verifyToken(token);
    const id_usuario = decoded.id ?? decoded.id_usuario ?? decoded.uid;
    if (!id_usuario) return res.status(401).json({ error: "Token inválido" });

    const user = await UserDao.findById(id_usuario);
    if (!user) return res.status(401).json({ error: "Sesión inválida" });

    const id_rol = user.id_rol ?? decoded.id_rol ?? null;

    // === resolver nombre de rol SIN depender de IDs ===
    const roleNameRaw =
      user.Role?.nombre_rol ??
      user.rol ??
      user.role ??
      decoded.rol ??
      decoded.role ??
      ""; // si tenés otra key, sumala acá

    const rol = String(roleNameRaw).toLowerCase().trim() || null;

    req.user = {
      id_usuario: user.id_usuario,
      id_rol: id_rol ? Number(id_rol) : null,
      rol,
    };
    next();
  } catch (e) {
    console.error("requireAuth error:", e.name, e.message);
    return res.status(401).json({
      error:
        e.name === "TokenExpiredError"
          ? "Sesión expirada"
          : "Token inválido o expirado",
    });
  }
};

// Un solo nombre de rol (case-insensitive)
export const requireRole = (rolName) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "No autenticado" });
  const need = String(rolName || "")
    .toLowerCase()
    .trim();
  const have = String(req.user.rol || "")
    .toLowerCase()
    .trim();
  if (!need || have !== need)
    return res.status(403).json({ error: "Permiso insuficiente" });
  next();
};

// Varios nombres permitidos (case-insensitive)
export const verifyRoleName =
  (allowedNames = []) =>
  (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });

    const have = String(req.user.rol || "")
      .toLowerCase()
      .trim();
    const set = new Set(
      allowedNames.map((n) => String(n).toLowerCase().trim())
    );

    if (!set.has(have))
      return res.status(403).json({ error: "Permiso insuficiente" });
    next();
  };
