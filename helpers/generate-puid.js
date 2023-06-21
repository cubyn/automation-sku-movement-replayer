const Puid =require('puid');

const puid = new Puid();

function generatePuid() {
  return puid.generate();
}

module.exports = { generatePuid };
