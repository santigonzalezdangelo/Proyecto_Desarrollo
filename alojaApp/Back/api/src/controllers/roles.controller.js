import { roleDao } from "../dao/role.dao.js";

export const addRole = async (req, res) => {
  try {
    const { nombre_rol } = req.body ?? {};
    if (!nombre_rol) return res.status(400).json({ error: "nombre_rol requerido" });

    const exists = await roleDao.findByName(nombre_rol);
    if (exists) return res.status(400).json({ error: "El rol ya existe" });

    const role = await roleDao.create(nombre_rol);
    return res.status(201).json(role);
  } catch (e) {
    console.error("addRole error:", e);
    return res.status(500).json({ error: "Error interno" });
  }
};
