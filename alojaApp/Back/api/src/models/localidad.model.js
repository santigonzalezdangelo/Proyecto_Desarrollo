// src/models/localidad.model.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Localidad = sequelize.define(
  "Localidad",
  {
    id_localidad: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    // FK -> ciudades.id_ciudad
    id_ciudad: {
      type: DataTypes.INTEGER,
      allowNull: true,              // ponelo en false si tu esquema lo exige
      references: { model: "ciudades", key: "id_ciudad" },
    },
  },
  {
    tableName: "localidades",
    timestamps: false,
  }
);

export default Localidad;
