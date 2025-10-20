
import PostgresDAO from "./postgres.dao.js";
import {userModel, roleModel} from "../models/associations.js";

class UserDAO extends PostgresDAO {
  constructor() {
    super(userModel);
  } 

  findByEmail = async (email) => {
    try {
      return await this.model.findOne({ where: { correo: email }, include: roleModel });
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw new Error(error);
    }
  };

  create = async (data) => {
    try {
      return await this.model.create(data);
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error(error);
    } 
  };

  findById = async (id_usuario) => {
    try {
      const user = await this.model.findOne({
        where: { id_usuario },
        include: [
          { model: roleModel, as: "Role", required: false } // para user.Role?.nombre_rol
        ],
      });
      return user; // puede ser null si no existe
    } catch (error) {
      console.error("Error in UserDAO.findById:", error);
      throw error;
    }
  };
}
export default new UserDAO();

