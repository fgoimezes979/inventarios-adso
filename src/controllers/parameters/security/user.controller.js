/**hastear una contraseña */

const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

const User = require('../../../models/security/user.model');
const { json } = require('sequelize');
const sequelize = require('../../../models/database/dbconnection');
const jwt = require('jsonwebtoken');

/** login */

const login = async (req, res) => {

  try {

    const { email, password } = req.body;

    /** buscar usuario por email */

    const existUser = await User.findOne({
      where: { email: email }
    });

    /** usuario no existe */

    if (!existUser) {

      return res.status(404).json({
        status: false,
        msg: "el usuario es invalido, verifiquelo",
        user: null,
      });

    }

    /** validar contraseña */

    const validpassword = bcrypt.compareSync(
      password,
      existUser.password
    );

    if (validpassword) {

      const token = jwt.sign(
        {
          id: existUser.id,
          email: existUser.email,
          role: existUser.role
        },
        process.env.JWT_SECRET || 'clave_secreta',
        { expiresIn: '1h' }
      );

      const { password, ...userSafe } = existUser.dataValues;

      return res.status(200).json({
        status: true,
        msg: "inicio de sesion correcta",
        user: userSafe,
        token: token
      });

    } else {

      return res.status(404).json({
        status: false,
        msg: "el password es incorrecto, verifiquelo",
        user: null,
      });

    }

  } catch (error) {

    return res.status(500).json({
      status: false,
      msg: "error en login - " + error.message,
      user: null,
    });

  }

};

/** exportar */

module.exports = {
  login
};