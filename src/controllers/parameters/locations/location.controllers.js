const { Location, Product, LocationProduct } = require('../../../models/model-index');

/* ===========================================================
   🔧 HELPERS
=========================================================== */

// Genera descripción dinámica desde LocationProduct
const formatDescriptionFromProducts = (products) => {
  if (!products || products.length === 0) return "Sin descripción";
  return products
    .map(p => `${p.name} (${p.LocationProduct?.stock ?? 0})`)
    .join(", ");
};

// Normaliza description para almacenar siempre JSON
const normalizeDescriptionForDB = (description) => {
  if (!description || !description.trim()) return JSON.stringify([]);

  // Si ya es JSON válido, lo devuelve tal cual
  try {
    const parsed = JSON.parse(description);
    if (Array.isArray(parsed)) return JSON.stringify(parsed);
    // Si es un objeto individual, lo envuelve en array
    return JSON.stringify([parsed]);
  } catch {
    // Si no es JSON, intenta parsear formato "Nombre, cantidad"
    const parts = description.split(",");
    if (parts.length === 2) {
      const name = parts[0].trim();
      const quantity = parseInt(parts[1].trim());
      if (!isNaN(quantity)) {
        return JSON.stringify([{ name, quantity }]);
      }
    }

    // Si tiene múltiples productos separados por ";"
    if (description.includes(";")) {
      const items = description
        .split(";")
        .map(entry => {
          const [name, qty] = entry.split(",");
          const quantity = parseInt(qty?.trim());
          return {
            name: name?.trim() || "Producto",
            quantity: isNaN(quantity) ? 0 : quantity
          };
        })
        .filter(item => item.name && item.quantity !== undefined);

      return JSON.stringify(items);
    }
  }

  // Si no coincide con ningún formato, devolver array vacío
  return JSON.stringify([]);
};

// Manejo simple de errores
const serverError = (res, error, msg) => {
  console.error(`❌ ${msg}:`, error);
  return res.status(500).json({ status: false, msg, error: error.message });
};

/* ===========================================================
   📦 LISTAR LOCATIONS CON PRODUCTOS
=========================================================== */
const index = async (req, res) => {
  try {
    const locations = await Location.findAll({
      include: [
        {
          model: Product,
          as: "products",
          through: { attributes: ["stock"] }
        }
      ]
    });

    const formatted = locations.map(loc => ({
      id: loc.id,
      code: loc.code,
      name: loc.name,
      ability: loc.ability,
      is_active: loc.is_active,
      description: formatDescriptionFromProducts(loc.products),
      products: loc.products.map(p => ({
        id: p.id,
        name: p.name,
        stock_global: p.quantity,
        stock_location: p.LocationProduct?.stock ?? 0
      }))
    }));

    return res.status(200).json({
      status: true,
      msg: "Locations listadas correctamente",
      locations: formatted
    });
  } catch (error) {
    return serverError(res, error, "Error al listar locations");
  }
};

/* ===========================================================
   🏗️ CREAR LOCATION
=========================================================== */
const create = async (req, res) => {
  try {
    let { code, name, description, ability, is_active } = req.body;

    code = code?.trim().toUpperCase();
    name = name?.trim();

    if (!code || !name) return res.status(400).json({ status: false, msg: "El código y nombre son obligatorios" });

    const exist = await Location.findOne({ where: { code } });
    if (exist) return res.status(409).json({ status: false, msg: "Ya existe una location con ese código" });

    const normalizedDescription = normalizeDescriptionForDB(description);

    const newLocation = await Location.create({ code, name, description: normalizedDescription, ability, is_active });

    return res.status(201).json({ status: true, msg: "Location creada correctamente", location: newLocation });
  } catch (error) {
    return serverError(res, error, "Error al crear location");
  }
};

/* ===========================================================
   🔍 MOSTRAR LOCATION POR ID (DINÁMICO)
=========================================================== */
const show = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findByPk(id, {
      include: [
        {
          model: Product,
          as: "products",
          through: { attributes: ["stock"] }
        }
      ]
    });

    if (!location) return res.status(404).json({ status: false, msg: "Location no encontrada" });

    const formatted = {
      id: location.id,
      code: location.code,
      name: location.name,
      ability: location.ability,
      is_active: location.is_active,
      description: formatDescriptionFromProducts(location.products),
      products: location.products.map(p => ({
        id: p.id,
        name: p.name,
        stock: p.LocationProduct?.stock ?? 0
      }))
    };

    return res.status(200).json({ status: true, msg: "Location encontrada correctamente", location: formatted });
  } catch (error) {
    return serverError(res, error, "Error al mostrar location");
  }
};

/* ===========================================================
   ✏️ ACTUALIZAR LOCATION
=========================================================== */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findByPk(id);
    if (!location) return res.status(404).json({ status: false, msg: "Location a actualizar no encontrada" });

    if (req.body.description) req.body.description = normalizeDescriptionForDB(req.body.description);

    await Location.update(req.body, { where: { id } });
    const updated = await Location.findByPk(id);

    return res.status(200).json({ status: true, msg: "Location actualizada correctamente", location: updated });
  } catch (error) {
    return serverError(res, error, "Error al actualizar location");
  }
};

/* ===========================================================
   🗑️ ELIMINAR LOCATION
=========================================================== */
const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findByPk(id);
    if (!location) return res.status(404).json({ status: false, msg: "Location no encontrada" });

    // Eliminar registros relacionados en LocationProduct
    await LocationProduct.destroy({ where: { location_id: id } });

    // Eliminar la location
    await location.destroy();

    return res.status(200).json({ status: true, msg: "Location eliminada correctamente", location });
  } catch (error) {
    return serverError(res, error, "Error al eliminar location");
  }
};

/* ===========================================================
   📤 EXPORTAR MÉTODOS
=========================================================== */
module.exports = {
  index,
  create,
  show,
  update,
  destroy,
};
