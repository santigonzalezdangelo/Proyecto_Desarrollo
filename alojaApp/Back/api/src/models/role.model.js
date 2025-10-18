import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const roleModel = sequelize.define(
  "Role",
  {
    id_rol: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_rol: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Role",
    tableName: "roles", //usuarios apunta aca
    timestamps: false,
  }
);

export default roleModel;