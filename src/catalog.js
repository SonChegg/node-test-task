const fs = require('fs/promises');
const path = require('path');

const CATALOG_PATH = path.join(__dirname, '..', 'materials.json');

async function loadCatalog() {
  const file = await fs.readFile(CATALOG_PATH, 'utf-8');
  const materials = JSON.parse(file);

  if (!Array.isArray(materials) || materials.length === 0) {
    throw new Error('Каталог пустой или имеет неверный формат.');
  }

  return materials;
}

function getRegions(materials) {
  const firstMaterial = materials[0];
  return Object.keys(firstMaterial.prices || {});
}

function formatMaterialChoice(material, region) {
  const price = material.prices[region];
  return {
    name: `[${material.id}] ${material.name} | ${material.category} | ${price} руб.`,
    value: material.id
  };
}

function findMaterialById(materials, id) {
  return materials.find((material) => material.id === id);
}

module.exports = {
  loadCatalog,
  getRegions,
  formatMaterialChoice,
  findMaterialById
};
