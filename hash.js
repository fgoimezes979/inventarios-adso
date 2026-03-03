const bcrypt = require("bcrypt");

console.log("Iniciando hash...");

bcrypt.hash("123456", 10)
  .then(hash => {
    console.log("HASH GENERADO:");
    console.log(hash);
  })
  .catch(err => console.error(err));
