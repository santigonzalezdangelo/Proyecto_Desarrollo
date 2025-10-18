import { Sequelize } from "sequelize";
import 'dotenv/config' 

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,   
  process.env.DB_PASS,  
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false, 
  }
  
);


export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Conectado a ${process.env.DB_NAME} en PostgreSQL`);
  } catch (error) {
    console.error("Error en conexión:", error);
    process.exit(1);
  }
};