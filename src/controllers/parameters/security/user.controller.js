/**validar que la contraseña sea correcta,promero desencriptar la clave */

console.log("EMAIL RECIBIDO:", email);
console.log("PASSWORD RECIBIDO:", password);
console.log("USUARIO ENCONTRADO:", existUser);
console.log("HASH BD:", existUser.password);

const validpassword = bcrypt.compareSync(
  password,
  existUser.password
);

console.log("RESULTADO BCRYPT:", validpassword);

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

  /**mensaje error contaseña invalida */

  return res.status(404).json({
    status:false,
    msg: "el password es incorrecto, verifiquelo",
    user: null,
  });

}
