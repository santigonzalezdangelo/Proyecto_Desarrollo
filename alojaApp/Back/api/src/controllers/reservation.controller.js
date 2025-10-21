
import { reservationDao } from "../dao/reservation.dao.js";

class ReservationController {
  // POST /api/reservas
  create = async (req, res) => {
    try {
      const { id_usuario, id_propiedad, fecha_inicio, fecha_fin } = req.body ?? {};
      if (!id_usuario || !id_propiedad || !fecha_inicio || !fecha_fin) {
        return res.status(400).json({ error: "Faltan datos requeridos" });
      }

      const reserva = await reservationDao.create({
        id_usuario,
        id_propiedad,
        fecha_inicio,
        fecha_fin,
      });

      return res.status(201).json(reserva);
    } catch (err) {
      console.error("Error creando reserva:", err);
      const msg = err?.message ?? "Error creando reserva";
      return res.status(500).json({ error: msg });
    }
  };

 getMine = async (req, res) => {
    try {
      const id_usuario = Number(req.query.id_usuario) || req.user?.id_usuario;
      if (!id_usuario) return res.status(400).json({ error: "id_usuario es requerido" });

      const rows = await reservationDao.findCardsByUser(id_usuario);

      const data = rows.map(r => ({
        id_reserva: r.id_reserva,
        nombre_propiedad: r.propiedad?.descripcion ?? null,   // “Casa en Barrio Tranquilo”
        fecha_inicio: r.fecha_inicio,
        fecha_fin: r.fecha_fin,
        noches: r.cantidad_dias,                               // días de estadía
        precio_por_noche: Number(r.propiedad?.precio_por_noche ?? 0),
        total_estimado: Number(r.precio_final),                // opcional por si lo necesitás en la UI
        estado: r.estado?.nombre ?? null                       // “reservado”
      }));

      return res.status(200).json(data);
    } catch (err) {
      console.error("Error en getMyReservations:", err);
      return res.status(500).json({ error: "Error obteniendo reservas del usuario" });
    }
  };
}

export const reservationController = new ReservationController();
