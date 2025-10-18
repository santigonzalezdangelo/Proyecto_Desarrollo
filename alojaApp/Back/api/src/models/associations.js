import roleModel from "./role.model.js";
import userModel from "./user.model.js";
import propertyModel from "./property.model.js";
import photoModel from "./photo.model.js";

propertyModel.hasMany(photoModel, {
  foreignKey: "id_propiedad",
  as: "fotos",
  onDelete: "CASCADE",
});
photoModel.belongsTo(propertyModel, {
  foreignKey: "id_propiedad",
  as: "propiedad",
});

roleModel.hasMany(userModel, { foreignKey: "id_rol" });
userModel.belongsTo(roleModel, { foreignKey: "id_rol" });
// userModel.belongsTo(Localidad, { foreignKey: "id_localidad" });
// Localidad.hasMany(userModel, { foreignKey: "id_localidad" });

export { 
    roleModel,
    userModel,
    propertyModel, 
    photoModel
};
