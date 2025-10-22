import CaracteristicaDAO from '../dao/caracteristica.dao.js';

class CaracteristicaController {
  
  getAllCaracteristicas = async (req, res) => {
    try {
      const caracteristicas = await CaracteristicaDAO.getAll();
      
      // Mapeamos para que la clave sea 'nombre_caracteristica' (tal como está en tu DB)
      const mappedCaracs = caracteristicas.map(c => ({
        id_caracteristica: c.id_caracteristica,
        nombre_caracteristica: c.nombre_caracteristica
      }));

      res.status(200).json(mappedCaracs);
    } catch (error) {
      console.error("Error al obtener todas las características:", error);
      res.status(500).json({ error: 'Error interno del servidor al obtener características.' });
    }
  };
}

export default new CaracteristicaController();
