import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const localidadModel = sequelize.define(
  "Localidad",
  {
    id_localidad: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre_localidad: { type: DataTypes.STRING(100), allowNull: false },
    id_ciudad: { type: DataTypes.INTEGER, allowNull: false, references: { model: "ciudades", key: "id_ciudad" } },
  },
  { sequelize, modelName: "Localidad", tableName: "localidades", timestamps: false }
);

export default localidadModel;
