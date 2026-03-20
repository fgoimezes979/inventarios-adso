const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database/dbconnection");

class User extends Model {}

User.init(
{
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },

  /** Primer nombre del usuario */
  firstname: {
    type: DataTypes.STRING(25),
    allowNull: false,
    comment: "primer nombre"
  },

  /** Segundo nombre del usuario */
  secondname: {
    type: DataTypes.STRING(25),
    allowNull: true,
    comment: "segundo nombre"
  },

  /** Primer apellido del usuario */
  firstlastname: {
    type: DataTypes.STRING(25),
    allowNull: false,
    comment: "primer apellido"
  },

  /** Segundo apellido del usuario */
  secondlastname: {
    type: DataTypes.STRING(25),
    allowNull: false,
    comment: "segundo apellido"
  },

  /** Tienda o ubicación del usuario */
  location_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "locations",
      key: "id"
    }
  },

  /** Fotografía del usuario */
  photo: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: "assets/img/avatar3.png",
    comment: "fotografía del usuario en formato texto"
  },

  /** Correo electrónico */
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    },
    comment: "dirección de correo electrónico"
  },

  /** Contraseña */
  password: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: "contraseña del usuario"
  },

  /** Rol del usuario */
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: "USER",
    comment: "rol del usuario (ADMIN, VENDEDOR, USER)"
  },

  /** Estado activo/inactivo */
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },

  /** Usuario que crea */
  user_creates_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  /** Fecha de creación */
  createdAt: {
    field: "created_at",
    type: DataTypes.DATE,
    allowNull: false
  },

  /** Usuario que actualiza */
  user_updates_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  /** Fecha de actualización */
  updatedAt: {
    field: "updated_at",
    type: DataTypes.DATE,
    allowNull: true
  }

},
{
  sequelize,
  modelName: "User",
  tableName: "users",
  timestamps: true,
  indexes: [
    { fields: ["firstname"] },
    { fields: ["firstlastname"] }
  ]
}
);

module.exports = User;