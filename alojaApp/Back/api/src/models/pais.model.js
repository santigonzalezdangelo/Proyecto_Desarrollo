import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const paisModel = sequelize.define(
  "Pais",
  {
    id_pais: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre_pais: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  },
  { sequelize, modelName: "Pais", tableName: "paises", timestamps: false }
);

export default paisModel;
