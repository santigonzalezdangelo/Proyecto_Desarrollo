import { reservationDao } from "../dao/reservation.dao.js";

class ReservationController {
  create = async (req, res) => {
    try {
      const { id_usuario, id_propiedad, fecha_inicio, fecha_fin } = req.body ?? {};

      // Validar datos obligatorios
      if (!id_usuario || !id_propiedad || !fecha_inicio || !fecha_fin) {
        return res.status(400).json({ error: "Faltan datos requeridos" });
      }

      // Crear reserva (valida fechas internamente)
      const reserva = await reservationDao.create({
        id_usuario,
        id_propiedad,
        fecha_inicio,
        fecha_fin,
      });

      return res.status(200).json(reserva);
    } catch (err) {
      console.error("Error creando reserva:", err.message);

      // ⚠️ Si el error es por solapamiento, devolver 409
      if (err.message.includes("ya está reservada")) {
        return res
          .status(409)
          .json({ error: "La propiedad no está disponible en las fechas seleccionadas" });
      }

      // Otros errores (por ejemplo: fechas inválidas, propiedad no encontrada)
      return res
        .status(500)
        .json({ error: err?.message ?? "Error creando reserva" });
    }
  };

  getMine = async (req, res) => {
    try {
      const raw =
        req.query.id_usuario ?? req.params.id_usuario ?? req.user?.id_usuario;
      const id_usuario = Number(raw);
      if (!id_usuario)
        return res.status(400).json({ error: "id_usuario es requerido" });

      const rows = await reservationDao.findMine(id_usuario);
      const now = new Date();

      const mapped = rows.map((r) => {
        const d0 = new Date(r.fecha_inicio);
        const d1 = new Date(r.fecha_fin);
        const etiqueta =
          now < d0 ? "proxima" : now < d1 ? "activa" : "finalizada";

        const p = r.propiedad;
        const e = r.estado;
        return {
          id_reserva: r.id_reserva,
          id_propiedad: r.id_propiedad,
          nombre_propiedad: p?.descripcion ?? null,
          fecha_inicio: r.fecha_inicio,
          fecha_fin: r.fecha_fin,
          noches: r.cantidad_dias,
          precio_por_noche: p ? Number(p.precio_por_noche) : null,
          total_estimado: Number(r.precio_final),
          estado_db: e?.nombre_estado ?? null,
          etiqueta,
        };
      });

      const activas = mapped.filter((x) => x.etiqueta === "activa");
      const historial = mapped
        .filter((x) => x.etiqueta !== "activa")
        .sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio));

      return res.status(200).json({
        activas,
        historial,
        stats: { activas: activas.length, previas: historial.length },
      });
    } catch (err) {
      console.error("Error en getMyReservations:", err);
      return res
        .status(500)
        .json({ error: "Error obteniendo reservas del usuario" });
    }
  };
}

export const reservationController = new ReservationController();
