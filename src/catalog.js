const fs = require('fs/promises');
const path = require('path');

const CATALOG_PATH = path.join(__dirname, '..', 'materials.json');
const REQUIRED_REGIONS = ['SPB', 'MSK', 'KRD'];

function isValidPrice(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function validateMaterial(material, index, usedIds) {
  if (!material || typeof material !== 'object' || Array.isArray(material)) {
    throw new Error(`Материал #${index + 1} имеет неверный формат.`);
  }

  if (!Number.isInteger(material.id)) {
    throw new Error(`Материал #${index + 1} должен содержать целочисленный id.`);
  }

  if (usedIds.has(material.id)) {
    throw new Error(`Найден дублирующийся id: ${material.id}.`);
  }
  usedIds.add(material.id);

  if (typeof material.name !== 'string' || !material.name.trim()) {
    throw new Error(`Материал с id ${material.id} должен содержать имя.`);
  }

  if (typeof material.category !== 'string' || !material.category.trim()) {
    throw new Error(`Материал с id ${material.id} должен содержать категорию.`);
  }

  if (!material.prices || typeof material.prices !== 'object' || Array.isArray(material.prices)) {
    throw new Error(`Материал с id ${material.id} должен содержать объект prices.`);
  }

  for (const region of REQUIRED_REGIONS) {
    if (!isValidPrice(material.prices[region])) {
      throw new Error(`Материал с id ${material.id} имеет неверную цену для региона ${region}.`);
    }
  }

  return {
    id: material.id,
    name: material.name.trim(),
    category: material.category.trim(),
    prices: {
      SPB: material.prices.SPB,
      MSK: material.prices.MSK,
      KRD: material.prices.KRD
    }
  };
}

async function loadCatalog() {
  let file;
  try {
    file = await fs.readFile(CATALOG_PATH, 'utf-8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('Файл materials.json не найден.');
    }
    throw error;
  }

  let rawMaterials;
  try {
    rawMaterials = JSON.parse(file);
  } catch (_error) {
    throw new Error('Файл materials.json содержит невалидный JSON.');
  }

  if (!Array.isArray(rawMaterials) || rawMaterials.length === 0) {
    throw new Error('Каталог пустой или имеет неверный формат.');
  }

  const usedIds = new Set();
  const materials = rawMaterials.map((material, index) => validateMaterial(material, index, usedIds));

  return materials;
}

function getRegions() {
  return [...REQUIRED_REGIONS];
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
  findMaterialById,
  REQUIRED_REGIONS
};
