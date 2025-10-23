import CaracteristicaDAO from '../dao/caracteristica.dao.js';

class CaracteristicaController {
  createCaracteristica = async (req, res) => { // Método para crear una nueva característica
    try {
      // Se esperan 'nombre_caracteristica' y 'nombre_categoria'
      const { nombre_caracteristica, nombre_categoria } = req.body; 

      if (!nombre_caracteristica || !nombre_categoria) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: nombre_caracteristica y nombre_categoria.' });
      }

      const newCaracteristica = await CaracteristicaDAO.create({ 
        nombre_caracteristica, 
        nombre_categoria // El DAO debe poder manejar este campo
      });
      
      res.status(201).json(newCaracteristica);

    } catch (error) {
      console.error("Error al crear característica:", error);
      res.status(500).json({ error: 'Error interno del servidor al crear la característica.' });
    }
  };

  getAllCaracteristicas = async (req, res) => { // Método para obtener todas las características
    try {
      const caracteristicas = await CaracteristicaDAO.getAll();
      
      // Mapeamos para incluir todos los campos necesarios
      const mappedCaracs = caracteristicas.map(c => ({
        id_caracteristica: c.id_caracteristica,
        nombre_caracteristica: c.nombre_caracteristica,
        nombre_categoria: c.nombre_categoria || 'Otros', // Incluir la categoría
        tipo_valor: c.tipo_valor || 'numerica' // Incluir el tipo de valor
      }));

      res.status(200).json(mappedCaracs);
    } catch (error) {
      console.error("Error al obtener todas las características:", error);
      res.status(500).json({ error: 'Error interno del servidor al obtener características.' });
    }
  };
}

export default new CaracteristicaController();
