import UserDAO from "../dao/user.dao.js";

class UserController {
  // Obtener usuario por ID (ej: /api/users/3)
  findById = async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!id) {
        return res
          .status(400)
          .json({ success: false, message: "ID inválido" });
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
}

export default new UserController();
