// src/dao/message.dao.js
import { Op } from "sequelize";
import messageModel from "../models/messages.model.js";

export const MessageDAO = {
  async create({ from, to, text }) {
    return messageModel.create({
      from_user_id: Number(from),
      to_user_id: Number(to),
      text: String(text),
    });
  },

  async listConversation(a, b, { limit = 50 } = {}) {
    const rows = await messageModel.findAll({
      where: {
        [Op.or]: [
          { from_user_id: a, to_user_id: b },
          { from_user_id: b, to_user_id: a },
        ],
      },
      order: [["created_at", "ASC"]],
      limit,
    });
    return rows.map((r) => r.toJSON());
  },

  async listUndelivered(toUserId) {
    const rows = await messageModel.findAll({
      where: { to_user_id: toUserId, delivered_at: { [Op.is]: null } },
      order: [["created_at", "ASC"]],
    });
    return rows.map((r) => r.toJSON());
  },

  async markDelivered(ids) {
    if (!ids?.length) return 0;
    return messageModel.update(
      { delivered_at: new Date() },
      { where: { id: { [Op.in]: ids } } }
    );
  },
};
