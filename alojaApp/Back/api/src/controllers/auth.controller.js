// src/controllers/auth.controller.js
import   UserDAO from "../dao/user.dao.js";
import { setAuthCookie, clearAuthCookie, signToken } from "../utils/jwt.js";
import { ensureGuestRoleId } from "../middlewares/auth.js";
import e from "express";
import {
  createHash,
  isValidHash,

} from "../utils/utils.js";

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET; // <-- poné uno real
const isProd = process.env.NODE_ENV === "production";


class AuthController {

  register = async (req, res) => {
      try {
        const { correo, password, id_rol, nombre, apellido, dni } = req.body ?? {};
        if (!correo || !password || (id_rol === undefined || id_rol === null) || !nombre || !apellido || !dni) {
          return res
            .status(400)
            .json({ error: "correo, password e id_rol son requeridos" });
        }

        const email = String(correo).trim().toLowerCase();
        const roleId = Number(id_rol);
        if (!Number.isInteger(roleId) || roleId <= 0) {
          return res.status(400).json({ error: "id_rol inválido" });
        }

        // evitar duplicados
        const exists = await UserDAO.findByEmail(email);
        if (exists) {
          return res.status(409).json({ error: "El correo ya está registrado" });
        }

        // 🔐 hash
        const hashed = await createHash(String(password));

        // IMPORTANTE: usa tu nombre de columna real
        // Si en tu modelo la columna se llama 'contrasena', usá 'contrasena'
        // Si tu atributo es 'password' mapeado a DB 'contrasena', cambialo a password: hashed
        const created = await UserDAO.create({
          correo: email,
          password: hashed,   
          id_rol: roleId,
          nombre: nombre,
          apellido: apellido,
          dni:dni,
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
        // errores comunes
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
      return res.status(400).json({ error: "correo y password son requeridos" });
    }

    const email = String(correo).trim().toLowerCase();
    const user = await UserDAO.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // según tu modelo puede ser 'contrasena' o 'password'
    const hashGuardado = user.contrasena ?? user.password;
    if (!hashGuardado) {
      // evita crashear si el campo no existe
      return res.status(500).json({ error: "Usuario sin contraseña definida" });
    }

    const ok = await isValidHash(password, hashGuardado);
    if (!ok) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const userId = user.id_usuario ?? user.id;
    const token = jwt.sign({ id: userId, id_rol: user.id_rol }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("aloja_jwt", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.status(200).json({
      id: userId,
      correo: user.correo,
      id_rol: user.id_rol,
      // opcional: role: user.Role?.nombre_rol,
    });
  } catch (error) {
    console.error("Error in login:", error); // mirá acá el mensaje exacto
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



    /**
     * POST /api/auth/logout
     * - Limpia la cookie del JWT
     */
    logout = async (req, res) => {
  try {
    clearAuthCookie(res);           // <-- borra con flags correctos
    return res.status(200).json({ message: "Logout correcto" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ error: "Error interno" });
  }
};
  current = (req, res) => {
  const { id_usuario, id_rol } = req.user || {};
  if (!id_usuario) return res.status(401).json({ error: "No autenticado" });
  // Solo estos dos campos
  return res.status(200).json({ id_usuario, id_rol });
};

}
export default new AuthController();