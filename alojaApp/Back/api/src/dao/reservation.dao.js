import reservationModel from "../models/reservation.model.js";

import PostgresDAO from "./postgres.dao.js";

class ReservationDAO extends PostgresDAO {
  constructor() {
    super(reservationModel);
  }

  createReservation = async (reservationData) => {
    try {
      const newReservation = await this.model.create(reservationData);
      return newReservation;
    } catch (error) {
      console.error("Error creating reservation:", error);
      throw new Error(error);
    }
  };

    getReservationsByUserId = async (id_usuario) => {
    try {
      return await this.model.findAll({ where: { id_usuario } });
    } catch (error) {
      console.error("Error fetching reservations by user id:", error);
      throw new Error(error);
    }
  };

  getReservationsByPropertyId = async (id_propiedad) => {
    try {
      return await this.model.findAll({ where: { id_propiedad } });
    } catch (error) {
      console.error("Error fetching reservations by property id:", error);
      throw new Error(error);
    }
  };
}

export default new ReservationDAO();
