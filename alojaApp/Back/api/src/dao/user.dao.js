// src/dao/user.dao.js
import PostgresDAO from "./postgres.dao.js";
import {
  userModel,
  roleModel,
  localidadModel,
  ciudadModel,
  paisModel,
} from "../models/associations.js";

class UserDAO extends PostgresDAO {
  constructor() {
    super(userModel);
  }

  findByEmail = async (email) => {
    try {
      return await this.model.findOne({
        where: { correo: email },
        include: [{ model: roleModel, as: "rol", required: false }],
      });
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw error;
    }
  };

  create = async (data) => {
    try {
      return await this.model.create(data);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  };

  findById = async (id_usuario) => {
    try {
      return await this.model.findOne({
        where: { id_usuario },
        include: [
          { model: roleModel, as: "rol", required: false },
          {
            model: localidadModel,
            as: "localidad",
            required: false,
            include: [
              {
                model: ciudadModel,
                as: "ciudad",
                required: false,
                include: [{ model: paisModel, as: "pais", required: false }],
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.error("Error in UserDAO.findById:", error);
      throw error;
    }
  };

  updateById = async (id_usuario, data) => {
    try {
      return await this.model.update(data, { where: { id_usuario } });
    } catch (error) {
      console.error("Error in UserDAO.updateById:", error);
      throw error;
    }
  };

  updateRoleByUserId = async (id_usuario, id_rol) => {
    await userModel.update({ id_rol }, { where: { id_usuario } });
    return this.findById(id_usuario); // opcional: devolver el user actualizado
  };
}

export default new UserDAO();
