import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";
// import { Localidad } from "./localidad.model.js";


const userModel = sequelize.define(
  "User",
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(60),
      allowNull: true,
    },
    apellido: {
      type: DataTypes.STRING(60),
      allowNull: true,
    },

    dni: {
        type: DataTypes.STRING(20),
      allowNull: true,
    },

     correo: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    calle: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },

    numero: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },

    cbu : {
        type: DataTypes.STRING(22),
        allowNull: true,
    },

    id_rol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "roles", key: "id_rol" },
    },
    id_localidad: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "localidades", key: "id_localidad" },
      },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "usuarios",
    timestamps: false,
    createdAt: "fecha_creacion",
    updatedAt: false,
  }
);

export default userModel;

