
import { reservationModel, propertyModel, stateModel } from "../models/associations.js";

const MS_DAY = 24 * 60 * 60 * 1000;

function diffDays(a, b) {
  const start = new Date(a);
  const end = new Date(b);
  return Math.ceil((end - start) / MS_DAY);
}

class ReservationDAO {
  create = async ({ id_usuario, id_propiedad, fecha_inicio, fecha_fin }) => {
    // validar fechas
    const cantidad_dias = diffDays(fecha_inicio, fecha_fin);
    if (!cantidad_dias || cantidad_dias <= 0) {
      throw new Error("Rango de fechas inválido");
    }

    // traer propiedad para precio
    const prop = await propertyModel.findByPk(id_propiedad, {
      attributes: ["id_propiedad", "precio_por_noche"],
    });
    if (!prop) throw new Error("Propiedad no encontrada");

    // id_estado = 'reservado'
    const estadoReservado = await stateModel.findOne({
      where: { nombre_estado: "reservado" },
      attributes: ["id_estado"],
    });
    if (!estadoReservado) throw new Error("Estado 'reservado' no existe");

    const precio_final = cantidad_dias * Number(prop.precio_por_noche);

    // crear reserva
    const reserva = await reservationModel.create({
      fecha_inicio,
      fecha_fin,
      cantidad_dias,
      precio_final,
      id_usuario,
      id_propiedad,
      id_estado: estadoReservado.id_estado,
    });

    return reserva;
  };

  findMine = async (id_usuario) => {
    return await reservationModel.findAll({
      where: { id_usuario },
      attributes: [
        "id_reserva",
        "fecha_inicio",
        "fecha_fin",
        "cantidad_dias",
        "precio_final",
        "id_propiedad",
      ],
      include: [
        { model: propertyModel, as: "propiedad", attributes: ["id_propiedad", "descripcion", "precio_por_noche"] },
        { model: stateModel,    as: "estado",    attributes: ["id_estado", "nombre_estado"] },
      ],
      order: [["fecha_inicio", "DESC"]],
    });
  };

}
export const reservationDao = new ReservationDAO();
