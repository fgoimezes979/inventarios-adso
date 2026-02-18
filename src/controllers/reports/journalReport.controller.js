const ExcelJS = require("exceljs");
const { JournalEntry, Operation, User, } = require("../../models/model-index"); // Ajusta según tu estructura


const { Op } = require("sequelize");

/**
 * Exporta los asientos contables a Excel
 * Query opcional: ?startDate=2026-02-01&endDate=2026-02-28&user=1
 */
const exportJournalExcel = async (req, res) => {
    console.log("Ruta journal-excel llamada"); // Para verificar que entra
  try {
    const { startDate, endDate, user } = req.query;

    // Construir filtros dinámicos
    const filters = {};
    if (startDate && endDate) {
      filters.date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }
    if (user) {
      filters.user = user;
    }

    // Traer los asientos
    const journalEntries = await JournalEntry.findAll({
      where: filters,
      include: [
        { model: Operation, as: "operation", attributes: ["description"] },
      ],
      order: [["date", "ASC"]],
    });

    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Asientos Contables");

    // Cabecera
    sheet.columns = [
      { header: "Fecha", key: "date", width: 20 },
      { header: "Descripción", key: "description", width: 50 },
      { header: "Debe", key: "debit", width: 20 },
      { header: "Haber", key: "credit", width: 20 },
      { header: "Monto", key: "amount", width: 20 },
      { header: "Usuario", key: "user", width: 25 },
    ];

    // Agregar filas
    journalEntries.forEach((entry) => {
      sheet.addRow({
        date: entry.date.toLocaleString(),
        description: entry.description || entry.operation?.description || "",
        debit: entry.debitAccount || "",
        credit: entry.creditAccount || "",
        amount: Number(entry.amount).toFixed(2),
        user: entry.user || "",
      });
    });

    // Formato opcional: negrita para cabecera
    sheet.getRow(1).font = { bold: true };

    // Preparar la respuesta para descarga
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=asientos_contables.xlsx`
    );

    await workbook.xlsx.write(res);
    res.status(200).end();

  } catch (error) {
    console.error("❌ Error exportando journal a Excel:", error);
    res.status(500).json({ message: "Error exportando asientos contables" });
  }
};

module.exports = { exportJournalExcel,};
