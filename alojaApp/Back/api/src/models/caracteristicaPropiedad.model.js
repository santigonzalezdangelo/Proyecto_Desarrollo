import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const CaracteristicaPropiedadModel = sequelize.define(
  "caracteristicas_propiedad",
  {
    id_caracteristica_propiedad: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_propiedad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'propiedades', // Referencia al nombre de la tabla
        key: 'id_propiedad',
      },
    },
    id_caracteristica: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'caracteristicas', // Referencia al nombre de la tabla
        key: 'id_caracteristica',
      },
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: true, // Puede ser 0 o null si solo indica presencia
      defaultValue: 1, 
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['id_propiedad', 'id_caracteristica']
      }
    ]
  }
);

export default CaracteristicaPropiedadModel;
