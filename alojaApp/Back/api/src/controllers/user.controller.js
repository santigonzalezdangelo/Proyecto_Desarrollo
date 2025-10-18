import  UserDao  from "../dao/user.dao.js";
import { roleDao } from "../dao/role.dao.js";

/**
 * PUT /api/users/:id/updateRole
 * Cambia el rol de un usuario al rol indicado por id_rol o nombre_rol.
 * Requiere permisos (ej: 'anfitrion').
 */
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    let { id_rol, nombre_rol } = req.body ?? {};

    if (!id_rol && !nombre_rol)
      return res.status(400).json({ error: "id_rol o nombre_rol requerido" });

    if (!id_rol) {
      const role = await roleDao.findByName(nombre_rol);
      if (!role) return res.status(404).json({ error: "Rol no encontrado" });
      id_rol = role.id_rol;
    }

    const [aff] = await UserDao.updateRole(Number(id), Number(id_rol));
    if (aff === 0) return res.status(404).json({ error: "Usuario no encontrado" });

    return res.json({ status: "ok", id_usuario: Number(id), id_rol: Number(id_rol) });
  } catch (e) {
    console.error("updateRole error:", e);
    return res.status(500).json({ error: "Error interno" });
  }
};
