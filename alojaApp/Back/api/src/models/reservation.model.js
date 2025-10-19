import {DataTypes} from "sequelize";
import { sequelize } from "../config/db.js";  

const reservationModel = sequelize.define(
    'reservations',
    {
        id_reserva: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
         },        
        fecha_inicio: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        fecha_fin: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        cantidad_dias: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        precio_final: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "usuarios", key: "id_usuario" },
        },
        id_propiedad: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "propiedades", key: "id_propiedad" },
        },
        id_estado:{
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "estados", key: "id_estado" },
        },
    },
    {
        sequelize,
        modelName: 'reservations',
        tableName: 'reservas',
        timestamps: false,
    }
);

export default reservationModel;
