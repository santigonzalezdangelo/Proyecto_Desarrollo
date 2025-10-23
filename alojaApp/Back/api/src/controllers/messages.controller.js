// src/controllers/messages.controller.js
import { MessageDAO } from "../dao/messages.dao.js";

class MessagesController {
  history = async (req, res) => {
    try {
      const me = Number(req.user.id);
      const peerId = Number(req.query.peerId);
      const limit = Math.min(Number(req.query.limit) || 50, 200);
      if (!peerId) return res.status(400).json({ error: "peerId requerido" });

      const rows = await MessageDAO.listConversation(me, peerId, { limit });
      res.json({ ok: true, messages: rows });
    } catch (e) {
      res.status(500).json({ error: "Error al cargar historial" });
    }
  };
}
export default new MessagesController();
