// import CaracteristicaDAO from '../dao/caracteristica.dao.js';

// class CaracteristicaController {
//   createCaracteristica = async (req, res) => { // Método para crear una nueva característica
//     try {
//       // Se esperan 'nombre_caracteristica' y 'nombre_categoria'
//       const { nombre_caracteristica, nombre_categoria } = req.body;

//       if (!nombre_caracteristica || !nombre_categoria) {
//         return res.status(400).json({ error: 'Faltan campos obligatorios: nombre_caracteristica y nombre_categoria.' });
//       }

//       const newCaracteristica = await CaracteristicaDAO.create({
//         nombre_caracteristica,
//         nombre_categoria // El DAO debe poder manejar este campo
//       });

//       res.status(201).json(newCaracteristica);

//     } catch (error) {
//       console.error("Error al crear característica:", error);
//       res.status(500).json({ error: 'Error interno del servidor al crear la característica.' });
//     }
//   };

//   getAllCaracteristicas = async (req, res) => { // Método para obtener todas las características
//     try {
//       const caracteristicas = await CaracteristicaDAO.getAll();

//       // Mapeamos para incluir todos los campos necesarios
//       const mappedCaracs = caracteristicas.map(c => ({
//         id_caracteristica: c.id_caracteristica,
//         nombre_caracteristica: c.nombre_caracteristica,
//         nombre_categoria: c.nombre_categoria || 'Otros', // Incluir la categoría
//         tipo_valor: c.tipo_valor || 'numerica' // Incluir el tipo de valor
//       }));

//       res.status(200).json(mappedCaracs);
//     } catch (error) {
//       console.error("Error al obtener todas las características:", error);
//       res.status(500).json({ error: 'Error interno del servidor al obtener características.' });
//     }
//   };
// }

// export default new CaracteristicaController();

import CaracteristicaDAO from "../dao/caracteristica.dao.js";

class CaracteristicaController {
  createCaracteristica = async (req, res) => {
    try {
      const { nombre_caracteristica, nombre_categoria, tipo_valor } =
        req.body ?? {};
      if (!nombre_caracteristica) {
        return res
          .status(400)
          .json({ error: "nombre_caracteristica es obligatorio" });
      }
      const created = await CaracteristicaDAO.create({
        nombre_caracteristica,
        nombre_categoria,
        tipo_valor,
      });
      res.status(201).json(created);
    } catch (error) {
      console.error("Error al crear característica:", error);
      res
        .status(500)
        .json({
          error: "Error interno del servidor al crear la característica.",
        });
    }
  };

  getAllCaracteristicas = async (_req, res) => {
    try {
      const caracteristicas = await CaracteristicaDAO.getAll();
      const mapped = caracteristicas.map((c) => ({
        id_caracteristica: c.id_caracteristica,
        nombre_caracteristica: c.nombre_caracteristica,
        nombre_categoria: c.nombre_categoria || "Otros",
        tipo_valor: c.tipo_valor || "numerica",
      }));
      res.status(200).json(mapped);
    } catch (error) {
      console.error("Error al obtener todas las características:", error);
      res
        .status(500)
        .json({
          error: "Error interno del servidor al obtener características.",
        });
    }
  };

  /** ---------- NUEVO: catálogo + valores de una propiedad ---------- */
  getCaracteristicasForProperty = async (req, res) => {
    try {
      const id = Number(req.params.id_propiedad ?? req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "id_propiedad inválido" });
      }
      const merged = await CaracteristicaDAO.getAllMergedForProperty(id);
      res.status(200).json(merged);
    } catch (error) {
      console.error("Error al obtener características de la propiedad:", error);
      res.status(500).json({ error: "Error interno del servidor." });
    }
  };

  /** ---------- NUEVO: guardar edición completa ---------- */
  setCaracteristicasForProperty = async (req, res) => {
    try {
      const id = Number(req.params.id_propiedad ?? req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "id_propiedad inválido" });
      }

      const items = Array.isArray(req.body?.items) ? req.body.items : [];
      // cada item: { id_caracteristica, tipo_valor: "booleana"|"numerica", checked?:bool, cantidad?:number }
      await CaracteristicaDAO.setForProperty(id, items);
      res.status(200).json({ ok: true, message: "Características guardadas" });
    } catch (error) {
      console.error("Error al guardar características de la propiedad:", error);
      res.status(500).json({ error: "Error interno del servidor." });
    }
  };
}

export default new CaracteristicaController();
