// src/dao/user.dao.js
import PostgresDAO from "./postgres.dao.js";
import { userModel, roleModel } from "../models/associations.js";

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
        include: [{ model: roleModel, as: "rol", required: false }],
      });
    } catch (error) {
      console.error("Error in UserDAO.findById:", error);
      throw error;
    }
  };
}

export default new UserDAO();
