import roleModel from "./role.model.js";
import userModel from "./user.model.js";
import propertyModel from "./property.model.js";
import photoModel from "./photo.model.js";
import reservationModel from "./reservation.model.js";
import stateModel from "./state.model.js";
import typePropertyModel from "./typeProperty.model.js";
import localidadModel from "./localidad.model.js";
import ciudadModel from "./ciudad.model.js";
import paisModel from "./pais.model.js";
import ratingPropertyModel from "./ratingProperty.model.js";





localidadModel.belongsTo(ciudadModel, { foreignKey: "id_ciudad", as: "ciudad" });
ciudadModel.hasMany(localidadModel, { foreignKey: "id_ciudad", as: "localidades" });

ciudadModel.belongsTo(paisModel, { foreignKey: "id_pais", as: "pais" });
paisModel.hasMany(ciudadModel, { foreignKey: "id_pais", as: "ciudades" });

/* ===================== */
/* 🏡 Propiedades */
/* ===================== */
propertyModel.belongsTo(typePropertyModel, { foreignKey: "id_tipo_propiedad", as: "tipo" });
typePropertyModel.hasMany(propertyModel, { foreignKey: "id_tipo_propiedad", as: "propiedades" });

propertyModel.belongsTo(userModel, { foreignKey: "id_anfitrion", as: "anfitrion" });
userModel.hasMany(propertyModel, { foreignKey: "id_anfitrion", as: "propiedades" });

propertyModel.belongsTo(localidadModel, { foreignKey: "id_localidad", as: "localidad" });
localidadModel.hasMany(propertyModel, { foreignKey: "id_localidad", as: "propiedades" });

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
/* ===================== */
/* 📅 Reservas */
/* ===================== */

// 👥 Usuario → Reservas
userModel.hasMany(reservationModel, { foreignKey: "id_usuario", as: "reservas" });
reservationModel.belongsTo(userModel, { foreignKey: "id_usuario", as: "usuario" });

// 🏡 Propiedad → Reservas
propertyModel.hasMany(reservationModel, { foreignKey: "id_propiedad", as: "reservas" });
reservationModel.belongsTo(propertyModel, { foreignKey: "id_propiedad", as: "propiedad" });

// 📊 Estado → Reservas
stateModel.hasMany(reservationModel, { foreignKey: "id_estado", as: "reservas" });
reservationModel.belongsTo(stateModel, { foreignKey: "id_estado", as: "estado" });

/* ===================== */
/* 🌟 Calificaciones Propiedad */
/* ===================== */

// 🔗 Una reserva tiene UNA calificación
reservationModel.hasOne(ratingPropertyModel, {
  foreignKey: "id_reserva",
  as: "calificacion",
  onDelete: "CASCADE",
});

// 🔗 Una calificación pertenece a UNA reserva
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
  typePropertyModel,
  localidadModel,
  ciudadModel,
  paisModel,
  ratingPropertyModel
};
