
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

  findByEmail = async (correo) => {
    try {
      return await this.model.findOne({ where: { correo } });
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw new Error(error);
    }
  };
}
export default new UserDAO();

