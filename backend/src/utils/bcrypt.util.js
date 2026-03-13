const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * Hash un mot de passe
 * @param {String} password - Mot de passe en clair
 * @returns {String} Mot de passe hashé
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare un mot de passe avec un hash
 * @param {String} password - Mot de passe en clair
 * @param {String} hash - Mot de passe hashé
 * @returns {Boolean} True si les mots de passe correspondent
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  comparePassword
};

