const Account = require("../models/parameters/accounts/account.model");

const getAccountByCode = async (code) => {
  const account = await Account.findOne({
    where: { code }
  });

  if (!account) {
    throw new Error(`La cuenta ${code} no existe en el PUC`);
  }

  return account;
};

module.exports = {
  getAccountByCode
};
