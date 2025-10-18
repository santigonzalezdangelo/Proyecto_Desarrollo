import roleModel from "./role.model.js";
import userModel from "./user.model.js";

roleModel.hasMany(userModel, { foreignKey: "id_rol" });
userModel.belongsTo(roleModel, { foreignKey: "id_rol" });
// userModel.belongsTo(Localidad, { foreignKey: "id_localidad" });
// Localidad.hasMany(userModel, { foreignKey: "id_localidad" });

export { 
    roleModel,
    userModel
};