const ExcelJS = require("exceljs");

const {
  Operation,
  OperationDetail,
  Product,
  Location
} = require("../../models/model-index");

// ===============================
// EXPORTAR INVENTARIO A EXCEL
// ===============================
const exportInventoryExcel = async (req, res) => {
  try {

    const operations = await Operation.findAll({
      where: { is_active: true },
      order: [["date", "ASC"]],
      include: [
        {
          model: Location,
          as: "location"
        },
        {
          model: OperationDetail,
          as: "details",
          include: [
            {
              model: Product,
              as: "product"
            }
          ]
        }
      ]
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Inventario");

    // Encabezados
    sheet.addRow([
      "Producto",
      "Movimiento",
      "Cantidad",
      "Saldo",
      "Ubicación",
      "Usuario",
      "Fecha"
    ]);

    const balanceByProduct = {};

    operations.forEach(op => {

      if (!op.type) return;

      op.details.forEach(d => {

        if (!balanceByProduct[d.product.id]) {
          balanceByProduct[d.product.id] = 0;
        }

        // Sumas
        if (["ENTRY", "RETURN"].includes(op.type)) {
          balanceByProduct[d.product.id] += d.quantity;
        }

        // Restas
        if (op.type === "SALE") {
          balanceByProduct[d.product.id] -= d.quantity;
        }

        // Ajustes
        if (op.type === "ADJUST") {
          balanceByProduct[d.product.id] += d.quantity;
        }

        sheet.addRow([
          d.product.name,
          op.type,
          d.quantity,
          balanceByProduct[d.product.id],
          op.location ? op.location.name : "N/A",
          op.user || "Sistema",
          op.date
        ]);

      });
    });

    // Headers correctos
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=reporte_inventario.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("❌ Error Excel:", error);
    res.status(500).json({
      msg: "Error generando Excel"
    });
  }
};

// 🔥 EXPORTACIÓN CORRECTA
module.exports = {
  exportInventoryExcel
};
