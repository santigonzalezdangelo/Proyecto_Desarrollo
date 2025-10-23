import UserDAO from "../dao/user.dao.js";
import { setAuthCookie, clearAuthCookie, signToken } from "../utils/jwt.js";
import { createHash, isValidHash } from "../utils/utils.js";

// const isProd = process.env.NODE_ENV === "production";

class AuthController {
  register = async (req, res) => {
    try {
      const { correo, password, id_rol, nombre, apellido, dni } =
        req.body ?? {};
      if (
        !correo ||
        !password ||
        id_rol === undefined ||
        id_rol === null ||
        !nombre ||
        !apellido ||
        !dni
      ) {
        return res
          .status(400)
          .json({ error: "correo, password e id_rol son requeridos" });
      }

      const email = String(correo).trim().toLowerCase();
      const roleId = Number(id_rol);
      if (!Number.isInteger(roleId) || roleId <= 0) {
        return res.status(400).json({ error: "id_rol inválido" });
      }

      const exists = await UserDAO.findByEmail(email);
      if (exists)
        return res.status(409).json({ error: "El correo ya está registrado" });

      const hashed = await createHash(String(password));

      const created = await UserDAO.create({
        correo: email,
        password: hashed,
        id_rol: roleId,
        nombre,
        apellido,
        dni,
      });

      return res.status(201).json({
        id: created.id ?? created.id_usuario,
        correo: created.correo,
        id_rol: created.id_rol,
        nombre: created.nombre,
        apellido: created.apellido,
        dni: created.dni,
      });
    } catch (error) {
      if (error?.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({ error: "El correo ya está registrado" });
      }
      if (error?.name === "SequelizeForeignKeyConstraintError") {
        return res.status(400).json({ error: "id_rol no existe (FK)" });
      }
      if (error?.name === "SequelizeValidationError") {
        return res
          .status(400)
          .json({ error: error.errors?.[0]?.message || "Datos inválidos" });
      }
      console.error("Error in register:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  login = async (req, res) => {
    try {
      const { correo, password } = req.body ?? {};
      if (!correo || !password) {
        return res
          .status(400)
          .json({ error: "correo y password son requeridos" });
      }

      const email = String(correo).trim().toLowerCase();
      const user = await UserDAO.findByEmail(email);
      if (!user)
        return res.status(401).json({ error: "Credenciales inválidas" });

      const hashGuardado = user.contrasena ?? user.password;
      if (!hashGuardado)
        return res
          .status(500)
          .json({ error: "Usuario sin contraseña definida" });

      const ok = await isValidHash(password, hashGuardado);
      if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

      const userId = user.id_usuario ?? user.id;

      //firma de token
      const token = signToken({
        id: userId,
        id_usuario: userId,
        id_rol: user.id_rol,
      });

      //seteo de cookie
      setAuthCookie(res, token);

      return res.status(200).json({
        id: userId,
        correo: user.correo,
        id_rol: user.id_rol,
      });
    } catch (error) {
      console.error("Error in login:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  logout = async (req, res) => {
    try {
      clearAuthCookie(res);
      return res.status(200).json({ message: "Logout correcto" });
    } catch (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Error interno" });
    }
  };

  current = (req, res) => {
    const { id_usuario, id_rol } = req.user || {};
    if (!id_usuario) return res.status(401).json({ error: "No autenticado" });
    return res.status(200).json({ id_usuario, id_rol });
  };
}

export default new AuthController();
