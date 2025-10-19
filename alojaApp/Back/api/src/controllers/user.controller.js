import { UserDao}   from "../dao/user.dao.js";


/**
 * PUT /api/users/:id/updateRole
 * Cambia el rol de un usuario al rol indicado por id_rol o nombre_rol.
 * Requiere permisos (ej: 'anfitrion').
 */

class UserController {
  findById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return createResponse(req, res, 400, null, "id inválido");

    const user = await UserDAO.findById(id);
    if (!user) return createResponse(req, res, 404, null, "Usuario no encontrado");

    return createResponse(req, res, 200, {
      id_usuario: user.id_usuario,
      id_rol: user.id_rol,
      rol: user.Role?.nombre_rol ?? null,
      correo: user.correo,
    });
  } catch (e) {
    console.error("user.controller.findById:", e);
    return createResponse(req, res, 500, null, "Error interno");
  }
};

};

export default new UserController();