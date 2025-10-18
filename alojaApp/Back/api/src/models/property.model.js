import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const propertyModel = sequelize.define(
  "Property",
  {
    id_propiedad: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    reglas_de_la_casa: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    precio_por_noche: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    cantidad_huespedes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estancia_minima: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    calle: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    numero: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    latitud: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    longitud: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    id_anfitrion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "usuarios", key: "id_usuario" },
    },
    id_tipo_propiedad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "tipos_propiedad", key: "id_tipo_propiedad" },
    },
    id_localidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "localidades", key: "id_localidad" },
    },
  },
  {
    sequelize,
    modelName: "Property",
    tableName: "propiedades",
    timestamps: false,
  }
);

export default propertyModel;
