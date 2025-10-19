import reservationDao from "../dao/reservation.dao.js";


class ReservationController {
  createReservation = async (req, res) => {
    try {
      const reservationData = req.body; 
      const newReservation = await reservationDao.createReservation(reservationData);
      res.status(201).json(newReservation);
    } catch (error) {
      console.error("Error creating reservation:", error);
      res.status(500).json({ error: "Error creating reservation" });
    }
  };
    // 📅 Obtener reservas por ID de usuario
    getReservationsByUserId = async (req, res) => {
      try {
        const { id_usuario } = req.params;
        const reservations = await reservationDao.getReservationsByUserId(id_usuario);
        res.status(200).json(reservations);
      } catch (error) {
        console.error("Error fetching reservations by user id:", error);
        res.status(500).json({ error: "Error fetching reservations by user id" });
      }
    };
    // 📅 Obtener reservas por ID de propiedad
    getReservationsByPropertyId = async (req, res) => {
      try {
        const { id_propiedad } = req.params;
        const reservations = await reservationDao.getReservationsByPropertyId(id_propiedad);
        res.status(200).json(reservations);
      } catch (error) {
        console.error("Error fetching reservations by property id:", error);
        res.status(500).json({ error: "Error fetching reservations by property id" });
      }
    };
}

export default new ReservationController();
