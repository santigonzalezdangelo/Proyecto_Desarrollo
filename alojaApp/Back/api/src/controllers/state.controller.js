import stateDao from "../dao/state.dao.js";

class StateController {
  createState = async (req, res) => {
    try {
      const stateData = req.body;
      const newState = await stateDao.createState(stateData);
      res.status(201).json(newState);
    } catch (error) {
      console.error("Error creating state:", error);
      res.status(500).json({ error: "Error creating state" });
    }
  };
    getStateById = async (req, res) => {
    try {
      const { id_estado } = req.params;
      const state = await stateDao.getStateById(id_estado);
      res.status(200).json(state);
    } catch (error) {
      console.error("Error fetching state by id:", error);
      res.status(500).json({ error: "Error fetching state by id" });
    }
  };

}

export default new StateController();
