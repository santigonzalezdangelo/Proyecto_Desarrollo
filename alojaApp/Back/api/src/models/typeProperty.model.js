import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const typePropertyModel = sequelize.define(
  "TipoPropiedad",
  {
    id_tipo_propiedad: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre_tipo: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  },
  { sequelize, modelName: "TipoPropiedad", tableName: "tipos_propiedad", timestamps: false }
);

export default typePropertyModel;
