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

function printOrderPreview(region, product, price) {
  console.log('\nВыбранный заказ:');
  console.log(`Регион: ${region}`);
  console.log(`Товар: ${product.name}`);
  console.log(`Категория: ${product.category}`);
  console.log(`Цена: ${price} руб.`);
}

async function main() {
  try {
    const materials = await loadCatalog();
    const regions = getRegions(materials);

    const { region } = await inquirer.prompt([
      {
        type: 'list',
        name: 'region',
        message: 'Выберите регион:',
        choices: regions
      }
    ]);

    const { materialId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'materialId',
        message: 'Выберите материал:',
        choices: materials.map((material) => formatMaterialChoice(material, region))
      }
    ]);

    const selectedMaterial = findMaterialById(materials, materialId);
    const selectedPrice = selectedMaterial.prices[region];

    printOrderPreview(region, selectedMaterial, selectedPrice);

    const firstConfirmation = await askYesNo('Подтвердить заказ? (y/n)');

    if (firstConfirmation) {
      const orderData = createOrderData(region, selectedMaterial, selectedPrice, selectedPrice);
      const savedPath = await saveOrder(orderData);
      console.log(`\nЗаказ подтвержден и сохранен в: ${savedPath}`);
      return;
    }

    const offer = buildRetentionOffer(selectedMaterial, materials, region);

    console.log(`\n${offer.message}`);
    console.log('Финальное предложение:');
    console.log(`Товар: ${offer.product.name}`);
    console.log(`Категория: ${offer.product.category}`);
    console.log(`Базовая цена: ${offer.basePrice} руб.`);
    console.log(`Итоговая цена: ${offer.finalPrice} руб.`);

    const secondConfirmation = await askYesNo('Подтвердить заказ? (y/n)');

    if (!secondConfirmation) {
      console.log('\nЗаказ не подтвержден.');
      return;
    }

    const orderData = createOrderData(region, offer.product, offer.basePrice, offer.finalPrice);
    const savedPath = await saveOrder(orderData);

    console.log(`\nЗаказ подтвержден и сохранен в: ${savedPath}`);
  } catch (error) {
    console.error(`Ошибка: ${error.message}`);
    process.exit(1);
  }
}

main();
