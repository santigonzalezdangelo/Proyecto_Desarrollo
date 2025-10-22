// src/models/associations.js

import roleModel from "./role.model.js";
import userModel from "./user.model.js";
import propertyModel from "./property.model.js";
import photoModel from "./photo.model.js";
import reservationModel from "./reservation.model.js";
import stateModel from "./state.model.js";
import tipoPropiedadModel from "./tipoPropiedad.model.js";
import localidadModel from "./localidad.model.js";
import ciudadModel from "./ciudad.model.js";
import paisModel from "./pais.model.js";
import ratingPropertyModel from "./ratingProperty.model.js";
import caracteristicaModel from "./caracteristica.model.js";
import caracteristicaPropiedadModel from "./caracteristicaPropiedad.model.js";

/* ===================== */
/* 🌍 Relaciones Geográficas */
/* ===================== */

// Localidad → Ciudad → País
localidadModel.belongsTo(ciudadModel, { foreignKey: "id_ciudad", as: "ciudad" });
ciudadModel.hasMany(localidadModel, { foreignKey: "id_ciudad", as: "localidades" });

ciudadModel.belongsTo(paisModel, { foreignKey: "id_pais", as: "pais" });
paisModel.hasMany(ciudadModel, { foreignKey: "id_pais", as: "ciudades" });

/* ===================== */
/* 🏡 Propiedades */
/* ===================== */

// Tipo de Propiedad ↔ Propiedad
propertyModel.belongsTo(tipoPropiedadModel, { foreignKey: "id_tipo_propiedad", as: "tipoPropiedad" });
tipoPropiedadModel.hasMany(propertyModel, { foreignKey: "id_tipo_propiedad", as: "properties" });

// Usuario (Anfitrión) ↔ Propiedades
propertyModel.belongsTo(userModel, { foreignKey: "id_anfitrion", as: "anfitrion" });
userModel.hasMany(propertyModel, { foreignKey: "id_anfitrion", as: "properties" });

// Localidad ↔ Propiedad
propertyModel.belongsTo(localidadModel, { foreignKey: "id_localidad", as: "localidad" });
localidadModel.hasMany(propertyModel, { foreignKey: "id_localidad", as: "properties" });

// Propiedad tiene muchas Caracteristicas a través de CaracteristicasPropiedad
propertyModel.belongsToMany(caracteristicaModel, {
  through: caracteristicaPropiedadModel,
  foreignKey: "id_propiedad",
  otherKey: "id_caracteristica",
  as: "caracteristicas",
});

// Característica tiene muchas Propiedades a través de CaracteristicasPropiedad
caracteristicaModel.belongsToMany(propertyModel, {
  through: caracteristicaPropiedadModel,
  foreignKey: "id_caracteristica",
  otherKey: "id_propiedad",
  as: "propiedades",
});

// Definir las relaciones directas con la tabla intermedia para facilitar el DAO
caracteristicaPropiedadModel.belongsTo(propertyModel, { foreignKey: 'id_propiedad' });
caracteristicaPropiedadModel.belongsTo(caracteristicaModel, { foreignKey: 'id_caracteristica' });
propertyModel.hasMany(caracteristicaPropiedadModel, { foreignKey: 'id_propiedad', as: 'caracteristicas_propiedad', onDelete: "CASCADE" });
caracteristicaModel.hasMany(caracteristicaPropiedadModel, { foreignKey: 'id_caracteristica', as: 'caracteristicas_propiedad' });



/* ===================== */
/* 📸 Fotos */
/* ===================== */

propertyModel.hasMany(photoModel, { foreignKey: "id_propiedad", as: "fotos", onDelete: "CASCADE" });
photoModel.belongsTo(propertyModel, { foreignKey: "id_propiedad", as: "propiedad" });

/* ===================== */
/* 👤 Roles y Usuarios */
/* ===================== */

roleModel.hasMany(userModel, { foreignKey: "id_rol", as: "usuarios" });
userModel.belongsTo(roleModel, { foreignKey: "id_rol", as: "rol" });

/* ===================== */
/* 🏠 Localidad y Usuarios */
/* ===================== */

userModel.belongsTo(localidadModel, { foreignKey: "id_localidad", as: "localidad" });
localidadModel.hasMany(userModel, { foreignKey: "id_localidad", as: "usuarios" });

/* ===================== */
/* 📅 Reservas */
/* ===================== */

// Usuario ↔ Reservas
userModel.hasMany(reservationModel, { foreignKey: "id_usuario", as: "reservas" });
reservationModel.belongsTo(userModel, { foreignKey: "id_usuario", as: "usuario" });

// Propiedad ↔ Reservas
propertyModel.hasMany(reservationModel, { foreignKey: "id_propiedad", as: "reservas" });
reservationModel.belongsTo(propertyModel, { foreignKey: "id_propiedad", as: "propiedad" });

// Estado ↔ Reservas
stateModel.hasMany(reservationModel, { foreignKey: "id_estado", as: "reservas" });
reservationModel.belongsTo(stateModel, { foreignKey: "id_estado", as: "estado" });

/* ===================== */
/* 🌟 Calificaciones Propiedad */
/* ===================== */

// Una reserva tiene UNA calificación
reservationModel.hasOne(ratingPropertyModel, {
  foreignKey: "id_reserva",
  as: "calificacion",
  onDelete: "CASCADE",
});

// Una calificación pertenece a UNA reserva
ratingPropertyModel.belongsTo(reservationModel, {
  foreignKey: "id_reserva",
  as: "reserva",
});

/* ===================== */
/* 📤 Exportar modelos */
/* ===================== */

export {
  roleModel,
  userModel,
  propertyModel,
  photoModel,
  reservationModel,
  stateModel,
  tipoPropiedadModel,
  localidadModel,
  ciudadModel,
  paisModel,
  ratingPropertyModel,
  caracteristicaModel,
  caracteristicaPropiedadModel
};
