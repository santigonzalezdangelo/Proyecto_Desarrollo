import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const CaracteristicaModel = sequelize.define(
  "caracteristicas",
  {
    id_caracteristica: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    nombre_caracteristica: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    nombre_categoria: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

export default CaracteristicaModel;