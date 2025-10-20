// src/models/associations.js

import roleModel from "./role.model.js";
import userModel from "./user.model.js";
import propertyModel from "./property.model.js";
import photoModel from "./photo.model.js";
import reservationModel from "./reservation.model.js";
import stateModel from "./state.model.js";
import localidadModel from "./localidad.model.js"; 
import tipoPropiedadModel from "./tipoPropiedad.model.js"; 

// --- Usuarios y Propiedades (Anfitriones) ---
userModel.hasMany(propertyModel, {
  foreignKey: 'id_anfitrion', 
  sourceKey: 'id_usuario',    
  as: 'properties',
});

propertyModel.belongsTo(userModel, {
  foreignKey: 'id_anfitrion', 
  targetKey: 'id_usuario',    
  as: 'anfitrion',
});
// ----------------------------------------------------

// --- Propiedades y Fotos
propertyModel.hasMany(photoModel, {
  foreignKey: "id_propiedad",
  as: "fotos",
  onDelete: "CASCADE",
});
photoModel.belongsTo(propertyModel, {
  foreignKey: "id_propiedad",
  as: "propiedad",
});

// --- Roles y Usuarios
roleModel.hasMany(userModel, { foreignKey: "id_rol" });
userModel.belongsTo(roleModel, { foreignKey: "id_rol" });

// --- Usuarios y Reservas 
userModel.hasMany(reservationModel, { foreignKey: "id_usuario" });
reservationModel.belongsTo(userModel, { foreignKey: "id_usuario" });

// --- Propiedades y Reservas 
propertyModel.hasMany(reservationModel, { foreignKey: "id_propiedad" });
reservationModel.belongsTo(propertyModel, { foreignKey: "id_propiedad" });

// --- Estados y Reservas 
stateModel.hasMany(reservationModel, { foreignKey: "id_estado" });
reservationModel.belongsTo(stateModel, { foreignKey: "id_estado" });

// --- Propiedad y Localidad ---
propertyModel.belongsTo(localidadModel, {
  foreignKey: 'id_localidad',
  targetKey: 'id_localidad',
  as: 'localidad',
});
localidadModel.hasMany(propertyModel, {
  foreignKey: 'id_localidad',
  sourceKey: 'id_localidad', 
  as: 'properties',
});

// --- Propiedad y Tipo de Propiedad ---
propertyModel.belongsTo(tipoPropiedadModel, {
  foreignKey: 'id_tipo_propiedad',
  targetKey: 'id_tipo_propiedad', 
  as: 'tipoPropiedad',
});
tipoPropiedadModel.hasMany(propertyModel, {
  foreignKey: 'id_tipo_propiedad',
  sourceKey: 'id_tipo_propiedad', 
  as: 'properties',
});

export { 
  roleModel,
  userModel,
  propertyModel,
  photoModel,
  reservationModel,
  stateModel,
  localidadModel,       // <--- Añadido
  tipoPropiedadModel    // <--- Añadido
};