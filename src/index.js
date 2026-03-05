const inquirer = require('inquirer');

const {
  loadCatalog,
  getRegions,
  formatMaterialChoice,
  findMaterialById
} = require('./catalog');
const { buildRetentionOffer } = require('./retention');
const { createOrderData, saveOrder } = require('./order');

async function askYesNo(message) {
  const { answer } = await inquirer.prompt([
    {
      type: 'input',
      name: 'answer',
      message,
      filter: (value) => value.trim().toLowerCase(),
      validate: (value) => {
        if (value === 'y' || value === 'n') {
          return true;
        }

        return 'Введите y или n.';
      }
    }
  ]);

  return answer === 'y';
}

function printMaterialsForRegion(materials, region) {
  console.log('\nМатериалы и цены:');

  for (const material of materials) {
    console.log(`[${material.id}] ${material.name} | ${material.category} | ${material.prices[region]} руб.`);
  }
}

function printOrderPreview(region, product, price) {
  console.log('\nВыбранный заказ:');
  console.log(`Регион: ${region}`);
  console.log(`Товар: ${product.name}`);
  console.log(`Категория: ${product.category}`);
  console.log(`Цена: ${price} руб.`);
}

function printRetentionOffer(offer) {
  console.log(`\n${offer.message}`);
  console.log('Финальное предложение:');
  console.log(`Товар: ${offer.product.name}`);
  console.log(`Категория: ${offer.product.category}`);
  console.log(`Базовая цена: ${offer.basePrice} руб.`);
  console.log(`Итоговая цена: ${offer.finalPrice} руб.`);
}

async function saveAndPrintOrder(region, product, basePrice, finalPrice) {
  const orderData = createOrderData(region, product, basePrice, finalPrice);
  const savedPath = await saveOrder(orderData);
  console.log(`\nЗаказ подтвержден и сохранен в: ${savedPath}`);
}

async function main() {
  try {
    const materials = await loadCatalog();
    const regions = getRegions();

    if (!regions.length) {
      throw new Error('Список регионов пуст.');
    }

    const { region } = await inquirer.prompt([
      {
        type: 'list',
        name: 'region',
        message: 'Выберите регион:',
        choices: regions
      }
    ]);

    printMaterialsForRegion(materials, region);

    const { materialId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'materialId',
        message: 'Выберите материал:',
        choices: materials.map((material) => formatMaterialChoice(material, region))
      }
    ]);

    const selectedMaterial = findMaterialById(materials, materialId);
    if (!selectedMaterial) {
      throw new Error('Выбранный товар не найден в каталоге.');
    }

    const selectedPrice = selectedMaterial.prices[region];
    if (!Number.isFinite(selectedPrice)) {
      throw new Error(`Для товара "${selectedMaterial.name}" нет цены в регионе ${region}.`);
    }

    printOrderPreview(region, selectedMaterial, selectedPrice);

    const firstConfirmation = await askYesNo('Подтвердить заказ? (y/n)');
    if (firstConfirmation) {
      await saveAndPrintOrder(region, selectedMaterial, selectedPrice, selectedPrice);
      return;
    }

    const offer = buildRetentionOffer(selectedMaterial, materials, region);
    printRetentionOffer(offer);

    const secondConfirmation = await askYesNo('Подтвердить заказ? (y/n)');
    if (!secondConfirmation) {
      console.log('\nЗаказ не подтвержден.');
      return;
    }

    await saveAndPrintOrder(region, offer.product, offer.basePrice, offer.finalPrice);
  } catch (error) {
    console.error(`Ошибка: ${error.message}`);
    process.exit(1);
  }
}

main();
