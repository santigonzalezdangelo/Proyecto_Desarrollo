import { verifyToken } from "../utils/jwt.js";
import  UserDao  from "../dao/user.dao.js";
import { roleDao } from "../dao/role.dao.js";

// Verifica JWT desde cookie y adjunta req.user
export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.aloja_token;
    if (!token) return res.status(401).json({ error: "No autenticado" });

    const decoded = verifyToken(token); // { id_usuario, id_rol }
    const user = await UserDao.findById(decoded.id_usuario);
    if (!user) return res.status(401).json({ error: "Sesión inválida" });

    req.user = {
      id_usuario: user.id_usuario,
      id_rol: user.id_rol,
      rol: user.Role?.nombre_rol,
    };
    next();
  } catch (e) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

// Restringe por nombre de rol (ej: 'anfitrion')
export const requireRole = (rolName) => async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    if (req.user.rol !== rolName)
      return res.status(403).json({ error: "Permiso insuficiente" });
    next();
  } catch (e) {
    return res.status(403).json({ error: "Permiso insuficiente" });
  }
};

// Asegura que exista el rol 'huesped' y devuelve su id (para register)
export const ensureGuestRoleId = async () => {
  const name = "huesped";
  const exists = await roleDao.findByName(name);
  if (exists) return exists.id_rol;
  const created = await roleDao.create(name);
  return created.id_rol;
};
