import UserDAO from "../dao/user.dao.js";
import { roleDao } from "../dao/role.dao.js";
import { signToken, setAuthCookie } from "../utils/jwt.js";

class UserController {
  // Obtener usuario por ID (ej: /api/users/3)
  findById = async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!id) {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }

      const user = await UserDAO.findById(id);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      }

      return res.status(200).json({ success: true, data: user });
    } catch (e) {
      console.error("user.controller.findById:", e);
      return res
        .status(500)
        .json({ success: false, message: "Error interno del servidor" });
    }
  };

  // Obtener perfil del usuario autenticado (GET /api/users/me)
  getProfile = async (req, res) => {
    try {
      const id_usuario = req.user?.id_usuario;

      if (!id_usuario) {
        return res
          .status(401)
          .json({ success: false, message: "No autenticado" });
      }

      const user = await UserDAO.findById(id_usuario);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      }

      return res.status(200).json({ success: true, data: user });
    } catch (e) {
      console.error("user.controller.getProfile:", e);
      return res
        .status(500)
        .json({ success: false, message: "Error interno del servidor" });
    }
  };

  updateProfile = async (req, res) => {
    try {
      const id_usuario = req.user?.id_usuario; // viene del token
      if (!id_usuario) {
        return res
          .status(401)
          .json({ success: false, message: "No autenticado" });
      }

      const allowedFields = [
        "nombre",
        "apellido",
        "dni",
        "calle",
        "numero",
        "telefono",
        "cbu",
        "id_localidad",
      ];

      // Filtramos el body solo con los campos permitidos
      const data = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) data[key] = req.body[key];
      }

      // Ejecutamos la actualización
      const [updatedCount] = await UserDAO.updateById(id_usuario, data);

      if (updatedCount === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      }

      // Obtenemos el usuario actualizado
      const updatedUser = await UserDAO.findById(id_usuario);

      return res.status(200).json({
        success: true,
        message: "Perfil actualizado correctamente",
        data: updatedUser,
      });
    } catch (e) {
      console.error("user.controller.updateProfile:", e);
      return res
        .status(500)
        .json({ success: false, message: "Error interno del servidor" });
    }
  };

  upgradeToHost = async (req, res) => {
    try {
      const id_usuario = Number(req.body?.id_usuario ?? req.query?.id_usuario);
      if (!id_usuario) {
        return res.status(400).json({ error: "id_usuario es requerido" });
      }

      // Si no te pasan id_rol, lo buscamos por NOMBRE ("anfitrion")
      let newRoleId = Number(req.body?.id_rol);
      if (!Number.isInteger(newRoleId) || newRoleId <= 0) {
        const hostRole = await roleDao.findByName("anfitrion");
        if (!hostRole?.id_rol) {
          return res.status(404).json({ error: "Rol 'anfitrion' no existe" });
        }
        newRoleId = hostRole.id_rol;
      }

      const user = await UserDAO.findById(id_usuario);
      if (!user)
        return res.status(404).json({ error: "Usuario no encontrado" });

      if (Number(user.id_rol) === Number(newRoleId)) {
        // ya es anfitrión: refresco cookie igual para que el front vea el cambio al toque
        const token = signToken({ id_usuario, id_rol: newRoleId });
        setAuthCookie(res, token);
        return res.status(200).json({
          ok: true,
          data: {
            id_usuario,
            role: "anfitrion",
            msg: "El usuario ya era anfitrión",
          },
        });
      }

      await UserDAO.updateRoleByUserId(id_usuario, newRoleId);

      // Refresco JWT (útil si estás logueado en el navegador)
      const token = signToken({ id_usuario, id_rol: newRoleId });
      setAuthCookie(res, token);

      return res.status(200).json({
        ok: true,
        data: { id_usuario, newRole: "anfitrion", id_rol: newRoleId },
      });
    } catch (e) {
      console.error("upgradeToHost error:", e);
      return res.status(500).json({ error: "No se pudo actualizar el rol" });
    }
  };
}

export default new UserController();
