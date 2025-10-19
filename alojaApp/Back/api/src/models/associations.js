import roleModel from "./role.model.js";
import userModel from "./user.model.js";
import propertyModel from "./property.model.js";
import photoModel from "./photo.model.js";
import reservationModel from "./reservation.model.js";
import stateModel from "./state.model.js";

propertyModel.hasMany(photoModel, {
  foreignKey: "id_propiedad",
  as: "fotos",
  onDelete: "CASCADE",
});
photoModel.belongsTo(propertyModel, {
  foreignKey: "id_propiedad",
  as: "propiedad",
});

// Roles y usuarios

roleModel.hasMany(userModel, { foreignKey: "id_rol" });
userModel.belongsTo(roleModel, { foreignKey: "id_rol" });

// Localidad y usuarios

// userModel.belongsTo(Localidad, { foreignKey: "id_localidad" });
// Localidad.hasMany(userModel, { foreignKey: "id_localidad" });

//usuarios y reservas

userModel.hasMany(reservationModel, { foreignKey: "id_usuario" });
reservationModel.belongsTo(userModel, { foreignKey: "id_usuario" });

//propiedades y reservas

propertyModel.hasMany(reservationModel, { foreignKey: "id_propiedad" });
reservationModel.belongsTo(propertyModel, { foreignKey: "id_propiedad" });

//estados y reservas

stateModel.hasMany(reservationModel, { foreignKey: "id_estado" });
reservationModel.belongsTo(stateModel, { foreignKey: "id_estado" });

export { 
    roleModel,
    userModel,
    propertyModel,
    photoModel,
    reservationModel,
    stateModel
};
