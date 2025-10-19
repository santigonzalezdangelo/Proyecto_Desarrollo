import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const photoModel = sequelize.define(
  "Photo",
  {
    id_foto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    url_foto: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    nombre_foto: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    principal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    id_propiedad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "propiedades", key: "id_propiedad" },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "Photo",
    tableName: "fotos",
    timestamps: false,
  }
);

export default photoModel;
