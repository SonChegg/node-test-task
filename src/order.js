const fs = require('fs/promises');
const path = require('path');

const ORDERS_DIR = path.join(__dirname, '..', 'orders');

function normalizePrice(value, fieldName) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) {
    throw new Error(`Поле ${fieldName} должно быть неотрицательным числом.`);
  }

  return Number(numberValue.toFixed(2));
}

function createOrderData(region, product, basePrice, finalPrice) {
  if (typeof region !== 'string' || !region.trim()) {
    throw new Error('Регион заказа имеет неверный формат.');
  }

  if (!product || typeof product !== 'object') {
    throw new Error('Товар заказа имеет неверный формат.');
  }

  if (typeof product.name !== 'string' || !product.name.trim()) {
    throw new Error('Название товара отсутствует.');
  }

  if (typeof product.category !== 'string' || !product.category.trim()) {
    throw new Error('Категория товара отсутствует.');
  }

  return {
    region: region.trim(),
    productName: product.name.trim(),
    category: product.category.trim(),
    basePrice: normalizePrice(basePrice, 'basePrice'),
    finalPrice: normalizePrice(finalPrice, 'finalPrice'),
    createdAt: new Date().toISOString()
  };
}

async function saveOrder(orderData) {
  if (!orderData || typeof orderData !== 'object') {
    throw new Error('Невозможно сохранить пустой заказ.');
  }

  await fs.mkdir(ORDERS_DIR, { recursive: true });

  const timestamp = Date.now();
  const fileName = `order-${timestamp}.json`;
  const filePath = path.join(ORDERS_DIR, fileName);

  await fs.writeFile(filePath, JSON.stringify(orderData, null, 2), 'utf-8');

  return filePath;
}

module.exports = {
  createOrderData,
  saveOrder
};
