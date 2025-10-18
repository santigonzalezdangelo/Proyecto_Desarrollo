
export default class PostgresDAO {
  constructor(model) {
    this.model = model;
  }

  getAll = async () => {
    try {
      return await this.model.findAll();
    } catch (error) {
      console.error("Error fetching data:", error);
      throw new Error(error);
    }
  }

  getById = async (id) => {
    try {
      return await this.model.findByPk(id);
    } catch (error) {
      console.error("Error fetching data:", error);
      throw new Error(error);
    }
  }

  create = async (data) => {
    try {
      return await this.model.create(data);
    } catch (error) {
      console.error("Error creating data:", error);
      throw new Error(error);
    }
  }

  update = async (id, data) => {
    try {
      const [updated] = await this.model.update(data, {
        where: { id },
      });
      if (!updated) throw new Error("Id not found");
      return await this.model.findByPk(id);
    } catch (error) {
      console.error("Error updating data:", error);
      throw new Error(error);
    }
  }

  delete = async (id) => {
    try {
      const deleted = await this.model.destroy({
        where: { id },
      });
      if (!deleted) throw new Error("Id not found");
      return deleted;
    } catch (error) {
      console.error("Error deleting data:", error);
      throw new Error(error);
    }
  }

}

