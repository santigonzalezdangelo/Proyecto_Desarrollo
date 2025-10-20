import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const ciudadModel = sequelize.define(
  "Ciudad",
  {
    id_ciudad: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre_ciudad: { type: DataTypes.STRING(100), allowNull: false },
    id_pais: { type: DataTypes.INTEGER, allowNull: false, references: { model: "paises", key: "id_pais" } },
  },
  { sequelize, modelName: "Ciudad", tableName: "ciudades", timestamps: false }
);

export default ciudadModel;
