import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs-extra'; // Usamos fs-extra para borrar archivos fácilmente

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Sube una imagen a Cloudinary y luego borra el archivo local.
 * @param {string} filePath - La ruta al archivo temporal guardado por multer.
 * @returns {Promise<object>} - El resultado de la subida de Cloudinary.
 */
export const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'alojaapp_properties' // Nombre de la carpeta en Cloudinary
    });
    // Una vez subida la imagen, eliminamos el archivo temporal del servidor
    await fs.unlink(filePath);
    return result;
  } catch (error) {
    // Si la subida falla, también intentamos borrar el archivo temporal
    try {
      await fs.unlink(filePath);
    } catch (cleanupError) {
      console.error('Error al limpiar archivo temporal después de un fallo de subida:', cleanupError);
    }
    // Re-lanzamos el error original de la subida
    console.error("Error en la subida a Cloudinary:", error);
    throw new Error('No se pudo subir la imagen a Cloudinary.');
  }
};

export const deleteImage = async (publicId) => {
    try {
        // 'destroy' es el método de Cloudinary para borrar una imagen por su public_id
        return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Error al eliminar imagen de Cloudinary:", error);
        throw new Error('No se pudo eliminar la imagen de Cloudinary.');
    }
};