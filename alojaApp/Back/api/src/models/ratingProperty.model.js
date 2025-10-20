import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const ratingPropertyModel = sequelize.define(
  "RatingProperty",
  {
    id_calificacion_propiedad: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    puntuacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comentario: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    id_reserva: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: "reservas", key: "id_reserva" },
    },
  },
  {
    tableName: "calificaciones_propiedad",
    timestamps: false,
  }
);

export default ratingPropertyModel;
