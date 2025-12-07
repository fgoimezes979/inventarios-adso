const Client = require('../../../models/parameters/clients/client.model');
const { Op } = require("sequelize");

/** Lista todos los registros */
const index = async (req, res) => {
  try {
    const clients = await Client.findAll();

    return res.status(200).json({
      status: true,
      msg: "Clientes listados correctamente",
      clients
    });
  } catch (error) {
    console.error("Error en index:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno al listar clientes",
      clients: null
    });
  }
};

/** Crea un nuevo cliente */
/** Crea un nuevo cliente */
const create = async (req, res) => {
  try {
    let {
      code,
      name,
      last_name,
      birth,
      sex,
      direction,
      phone,
      email,
      is_active
    } = req.body;

    code = code?.trim().toUpperCase();
    name = name?.trim();
    last_name = last_name?.trim();

    if (!code || !name) {
      return res.status(400).json({
        status: false,
        msg: 'El código y el nombre son obligatorios',
        client: null
      });
    }

    const exist = await Client.findOne({ where: { code } });

    if (exist) {
      return res.status(409).json({
        status: false,
        msg: 'Ya existe un cliente con ese código',
        client: null
      });
    }

    const newClient = await Client.create({
      code,
      name,
      last_name,
      birth,
      sex,
      direction,
      phone,
      email,
      is_active
    });

    return res.status(201).json({
      status: true,
      msg: 'Cliente creado correctamente',
      client: newClient
    });

  } catch (error) {
    console.error('Error al crear cliente:', error);
    return res.status(500).json({
      status: false,
      msg: 'Error interno del servidor',
      client: null
    });
  }
};

/** Muestra un cliente por su ID */
const show = async (req, res) => {
  const { id } = req.params;

  const client = await Client.findByPk(id);

  if (!client) {
    return res.status(404).json({
      status: false,
      msg: "Cliente no encontrado",
      client: null
    });
  }

  return res.status(200).json({
    status: true,
    msg: "Cliente encontrado",
    client
  });
};

/** Actualiza un cliente por su ID */
const update = async (req, res) => {
  const { id } = req.params;
  const client = await Client.findByPk(id);

  if (!client) {
    return res.status(404).json({
      status: false,
      msg: "Cliente a actualizar no encontrado",
      client: null
    });
  }

  await Client.update(req.body, {
    where: { id }
  });

  const clientUpdate = await Client.findByPk(id);

  return res.status(200).json({
    status: true,
    msg: "Cliente actualizado correctamente",
    client: clientUpdate
  });
};

/** Elimina un cliente por su ID */
const destroy = async (req, res) => {
  const { id } = req.params;
  const client = await Client.findByPk(id);

  if (!client) {
    return res.status(404).json({
      status: false,
      msg: "Cliente no encontrado",
      client: null
    });
  }

  await client.destroy();

  return res.status(200).json({
    status: true,
    msg: "Cliente eliminado correctamente",
    client
  });
};

module.exports = {
  index,
  create,
  show,
  update,
  destroy
};
