const fs = require('fs/promises');
const path = require('path');

const ORDERS_DIR = path.join(__dirname, '..', 'orders');

function createOrderData(region, product, basePrice, finalPrice) {
  return {
    region,
    productName: product.name,
    category: product.category,
    basePrice,
    finalPrice,
    createdAt: new Date().toISOString()
  };
}

async function saveOrder(orderData) {
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
