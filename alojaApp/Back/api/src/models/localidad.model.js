// src/models/localidad.model.js

import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const localidadModel = sequelize.define(
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
    // puedes añadir 'id_provincia' o 'codigo_postal' si los tienes
  },
  {
    sequelize,
    modelName: "Localidad",
    tableName: "localidades", // El nombre de la tabla que referencia tu propertyModel
    timestamps: false,
  }
);

export default localidadModel;