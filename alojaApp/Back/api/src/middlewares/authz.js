
import { verifyToken } from "../utils/jwt.js";
import UserDao from "../dao/user.dao.js";

/** Opcional: mapa rápido por si no traés la asociación Role */
const ROLE_NAME_BY_ID = {
  5: "huesped",
  6: "anfitrion",
};

/** Si usás IDs fijos, dejalos acá */
export const ROLES = {
  HUESPED: 5,
  ANFITRION: 6,
};

// Verifica JWT desde cookie y adjunta req.user: { id_usuario, id_rol, rol }
export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.aloja_jwt;
    if (!token) return res.status(401).json({ error: "No autenticado" });

    const decoded = verifyToken(token);
    const id_usuario = decoded.id ?? decoded.id_usuario ?? decoded.uid;
    if (!id_usuario) return res.status(401).json({ error: "Token inválido" });

    // IMPORTANTE: que traiga Role o al menos id_rol
    const user = await UserDao.findById(id_usuario); 
    if (!user) return res.status(401).json({ error: "Sesión inválida" });

    const id_rol = user.id_rol ?? decoded.id_rol ?? null;
    const rolName =
      user.Role?.nombre_rol ??
      ROLE_NAME_BY_ID[Number(id_rol)] ??
      null;

    req.user = { id_usuario: user.id_usuario, id_rol: Number(id_rol), rol: rolName };
    next();
  } catch (e) {
    console.error("requireAuth error:", e.name, e.message);
    return res
      .status(401)
      .json({
        error:
          e.name === "TokenExpiredError"
            ? "Sesión expirada"
            : "Token inválido o expirado",
      });
  }
};

// Restringe por NOMBRE de rol (case-insensitive)
export const requireRole = (rolName) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "No autenticado" });
  const need = String(rolName || "").toLowerCase().trim();
  const have = String(req.user.rol || "").toLowerCase().trim();
  if (!need || have !== need) return res.status(403).json({ error: "Permiso insuficiente" });
  next();
};

// Alternativa recomendada: restringe por ID de rol
export const verifyRole = (allowedRoleIds = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "No autenticado" });
  const ok = allowedRoleIds.includes(Number(req.user.id_rol));
  if (!ok) return res.status(403).json({ error: "Permiso insuficiente" });
  next();
};
