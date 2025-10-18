import roleModel from "../models/role.model.js";

export const roleDao = {
  // Crea un rol
  create: (nombre_rol) => roleModel.create({ nombre_rol }),

  // Trae por nombre
  findByName: (nombre_rol) => roleModel.findOne({ where: { nombre_rol } }),

  // Trae por id
  findById: (id_rol) => roleModel.findByPk(id_rol),

  // Lista todos
  findAll: () => roleModel.findAll(),

  // Actualiza nombre
  updateName: (id_rol, nuevoNombre) =>
    roleModel.update({ nombre_rol: nuevoNombre }, { where: { id_rol } }),

  // Elimina
  deleteById: (id_rol) => roleModel.destroy({ where: { id_rol } }),
};
