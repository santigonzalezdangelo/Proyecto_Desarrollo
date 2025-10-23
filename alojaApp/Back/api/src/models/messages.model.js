// models/message.model.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Message = sequelize.define(
  "message",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    from_user_id: { type: DataTypes.INTEGER, allowNull: false },
    to_user_id: { type: DataTypes.INTEGER, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
    delivered_at: { type: DataTypes.DATE },
    read_at: { type: DataTypes.DATE },
  },
  {
    tableName: "messages",
    underscored: true,
    timestamps: true, // created_at
    updatedAt: false,
  }
);

export default Message;
