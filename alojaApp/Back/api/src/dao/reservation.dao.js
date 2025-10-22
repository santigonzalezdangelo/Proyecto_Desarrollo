import { Op } from "sequelize";
import { reservationModel, propertyModel, stateModel } from "../models/associations.js";

const MS_DAY = 24 * 60 * 60 * 1000;

function diffDays(a, b) {
  const start = new Date(a);
  const end = new Date(b);
  return Math.ceil((end - start) / MS_DAY);
}

class ReservationDAO {
  create = async ({ id_usuario, id_propiedad, fecha_inicio, fecha_fin }) => {
    // 🔹 Validar rango de fechas
    const cantidad_dias = diffDays(fecha_inicio, fecha_fin);
    if (!cantidad_dias || cantidad_dias <= 0) {
      throw new Error("Rango de fechas inválido");
    }

    // 🔹 Verificar si existe alguna reserva solapada para la misma propiedad
    const overlap = await reservationModel.findOne({
      where: {
        id_propiedad,
        [Op.or]: [
          // caso 1: inicio dentro del rango
          { fecha_inicio: { [Op.between]: [fecha_inicio, fecha_fin] } },
          // caso 2: fin dentro del rango
          { fecha_fin: { [Op.between]: [fecha_inicio, fecha_fin] } },
          // caso 3: la reserva existente engloba completamente el nuevo rango
          {
            fecha_inicio: { [Op.lte]: fecha_inicio },
            fecha_fin: { [Op.gte]: fecha_fin },
          },
        ],
      },
    });

    if (overlap) {
      throw new Error("La propiedad ya está reservada en las fechas seleccionadas");
    }

    // 🔹 Obtener propiedad y precio
    const prop = await propertyModel.findByPk(id_propiedad, {
      attributes: ["id_propiedad", "precio_por_noche"],
    });
    if (!prop) throw new Error("Propiedad no encontrada");

    // 🔹 Obtener id_estado = 'confirmado'
    const estadoConfirmado = await stateModel.findOne({
      where: { nombre_estado: "confirmado" },
      attributes: ["id_estado"],
    });
    if (!estadoConfirmado) throw new Error("Estado 'confirmado' no existe");

    // 🔹 Calcular precio total
    const precio_final = cantidad_dias * Number(prop.precio_por_noche);

    // 🔹 Crear la reserva
    const reserva = await reservationModel.create({
      fecha_inicio,
      fecha_fin,
      cantidad_dias,
      precio_final,
      id_usuario,
      id_propiedad,
      id_estado: estadoConfirmado.id_estado,
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
        {
          model: propertyModel,
          as: "propiedad",
          attributes: ["id_propiedad", "descripcion", "precio_por_noche"],
        },
        {
          model: stateModel,
          as: "estado",
          attributes: ["id_estado", "nombre_estado"],
        },
      ],
      order: [["fecha_inicio", "DESC"]],
    });
  };
}

export const reservationDao = new ReservationDAO();
