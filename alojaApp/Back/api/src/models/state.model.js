import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
const stateModel = sequelize.define(
  "states",
  {
    id_estado: {
      type: DataTypes.INTEGER,
      primaryKey: true, 
        autoIncrement: true,
    },
    nombre_estado: {
      type: DataTypes.STRING(50),
        allowNull: false,
    },
    },
    {
        sequelize,
        modelName: 'states',
        tableName: 'estados',
        timestamps: false,
    }
);

export default stateModel;
