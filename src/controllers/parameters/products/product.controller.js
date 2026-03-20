const { Op } = require("sequelize");
const { Product, Supplier, Location, LocationProduct, Category} = require("../../../models/model-index");

/** ============================================================
 * 📋 LISTAR TODOS LOS PRODUCTOS
============================================================ */
const index = async (req, res) => {
  try {
    const products = await Product.findAll({
   
      include: [
         { model: Category, as: "category" },   // 👈 agregar esto
        { model: Supplier, as: "supplier" },
        { model: Location, as: "locations", through: { attributes: ["stock"] } }, // incluir stock por ubicación
      ],
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      status: true,
      msg: "Productos listados de forma correcta",
      products,
    });
  } catch (error) {
    console.error("❌ Error al listar productos:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno al listar productos",
      products: [],
    });
  }
};

/** ============================================================
 * 🏬 LISTAR PRODUCTOS FILTRADOS POR UBICACIÓN
============================================================ */
const getProductsByLocation = async (req, res) => {
  try {
    const { location_id } = req.params;

    if (!location_id) {
      return res.status(400).json({
        status: false,
        msg: "Debe especificar una ubicación",
      });
    }

    // Buscar productos relacionados a esta ubicación
    const locationProducts = await LocationProduct.findAll({
      where: { location_id },
      include: [
        { model: Product, include: [{ model: Supplier, as: "supplier" }] },
        { model: Location },
      ],
    });

    const products = locationProducts.map(lp => ({
      ...lp.Product.toJSON(),
      stock: lp.stock,
      location: lp.Location,
    }));

    return res.status(200).json({
      status: true,
      msg: "Productos filtrados por ubicación",
      products,
    });
  } catch (error) {
    console.error("❌ Error al obtener productos por ubicación:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno del servidor",
      products: [],
    });
  }
};



/** ============================================================
 * ➕ CREAR PRODUCTO Y ASIGNAR STOCK EN LOCATION
============================================================ */
const create = async (req, res) => {
  try {
    let {
      name,
      category_id,
      quantity,       // stock global
      minimum_stock,   // 👈 FALTA ESTO
      purchasePrice,
      salePrice,
      supplierId,
      locationId,     // ubicación inicial opcional
      image,
      isActive,
      taxType,
     taxRate
    } = req.body;

    // Limpiar y validar nombre
    name = name?.trim();
    if (!name) {
      return res.status(400).json({
        status: false,
        msg: "El nombre es obligatorio",
        product: null,
      });
    }

    // Convertir locationId a número válido o null
    locationId = locationId ? Number(locationId) : null;

    // Validar que la ubicación exista si se envía locationId
    if (locationId) {
      const locationExists = await Location.findByPk(locationId);
      if (!locationExists) {
        return res.status(400).json({ status: false, msg: "La ubicación no existe" });
      }
    }

    // Generar código automático
    const last = await Product.findOne({ order: [["id", "DESC"]] });
    const newCode = last ? `P${String(last.id + 1).padStart(4, "0")}` : "P0001";

    // Crear producto
    const newProduct = await Product.create({
      code: newCode,
      name,
      category_id,
      quantity,
      minimum_stock,   // 👈 FALTA ESTO
      purchasePrice,
      salePrice,
      supplier_id: supplierId || null,
      image,
      isActive: isActive ?? true,
      taxType,
  taxRate   // 👈 ESTA ES LA LÍNEA QUE FALTABA

    });

    // ✅ Crear registro en LocationProduct si hay locationId
    if (locationId) {
      await LocationProduct.create({
        product_id: newProduct.id,
        location_id: locationId,
        stock: quantity || 0
      });

      // Actualizar description de la ubicación
      const location = await Location.findByPk(locationId);
      if (location) {
        const existingDesc =
          !location.description || location.description === "No hay productos"
            ? ""
            : location.description + "; ";
        location.description = `${existingDesc}${name},${quantity}`;
        await location.save();
      }
    }

    return res.status(201).json({
      status: true,
      msg: "Producto creado correctamente y stock asignado a ubicación",
      product: newProduct,
    });
  } catch (error) {
    console.error("❌ Error al crear producto:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno del servidor",
      product: null,
      error: error.message,
    });
  }
};

/** ============================================================
 * 🔍 MOSTRAR PRODUCTO POR ID
============================================================ */
const show = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        { model: Supplier, as: "supplier" },
        { model: Location, as: "locations", through: { attributes: ["stock"] } },
      ],
    });

    if (!product) {
      return res.status(404).json({ status: false, msg: "Producto no encontrado", product: null });
    }

    return res.status(200).json({ status: true, msg: "Producto encontrado", product });
  } catch (error) {
    console.error("❌ Error al buscar producto:", error);
    return res.status(500).json({ status: false, msg: "Error interno al buscar producto", product: null });
  }
};

/** ============================================================
 * ✏️ ACTUALIZAR PRODUCTO
============================================================ */
const update = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
     category_id,
      quantity,
      purchasePrice,
      salePrice,
      supplierId,
      image,
      isActive,
       taxType,
  taxRate
    } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        status: false,
        msg: "Producto a actualizar no encontrado",
        product: null,
      });
    }

  await product.update({
  name,
 category_id,
  quantity,
  purchasePrice,
  salePrice,
  supplier_id: supplierId,
  image,
  isActive,
  taxType,
  taxRate
});
    const productUpdated = await Product.findByPk(id, {
      include: [
        { model: Supplier, as: "supplier" },
        { model: Location, as: "locations", through: { attributes: ["stock"] } },
      ],
    });

    return res.status(200).json({
      status: true,
      msg: "Producto actualizado correctamente",
      product: productUpdated,
    });

  } catch (error) {
    console.error("❌ Error al actualizar producto:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno al actualizar producto",
      product: null,
    });
  }
};

/** ============================================================
 * 🗑️ ELIMINAR PRODUCTO
============================================================ */
const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ status: false, msg: "Producto no encontrado", product: null });
    }

    // Eliminar todas las relaciones con LocationProduct antes de borrar el producto
    await LocationProduct.destroy({ where: { product_id: id } });

    await product.destroy();
    return res.status(200).json({ status: true, msg: "Producto eliminado correctamente", product });
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error);
    return res.status(500).json({ status: false, msg: "Error interno al eliminar producto", product: null });
  }
};

module.exports = { index, getProductsByLocation, create, show, update, destroy };
