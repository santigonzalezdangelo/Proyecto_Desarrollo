// src/models/tipoPropiedad.model.js

import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js"; // Asegúrate que esta sea la ruta a tu config de BBDD

const tipoPropiedadModel = sequelize.define(
  "TipoPropiedad",
  {
    id_tipo_propiedad: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    // puedes añadir 'descripcion' si la tienes
  },
  {
    sequelize,
    modelName: "TipoPropiedad",
    tableName: "tipos_propiedad", // El nombre de la tabla que referencia tu propertyModel
    timestamps: false,
  }
);

export default tipoPropiedadModel;