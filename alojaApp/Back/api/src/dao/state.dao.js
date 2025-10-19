import stateModel from "../models/state.model.js";
import PostgresDAO from "./postgres.dao.js";

class StateDAO extends PostgresDAO {
  constructor() {
    super(stateModel);
  } 


    createState = async (stateData) => {
    try {
        const newState = await this.model.create(stateData);
        return newState;
    } catch (error) {
        console.error("Error creating state:", error); // mantiene error.errors[]
        throw error; // <<-- importante
    }
    };


    getStateById = async (id_estado) => {
    try {
      return await this.model.findOne({ where: { id_estado } });
    } catch (error) {
      console.error("Error fetching state by id:", error);
      throw(error);
    }
  };
}

export default new StateDAO();
