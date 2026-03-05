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

        return 'Please enter y or n.';
      }
    }
  ]);

  return answer === 'y';
}

function printOrderPreview(region, product, price) {
  console.log('\nSelected order:');
  console.log(`Region: ${region}`);
  console.log(`Product: ${product.name}`);
  console.log(`Category: ${product.category}`);
  console.log(`Price: ${price} RUB`);
}

async function main() {
  try {
    const materials = await loadCatalog();
    const regions = getRegions(materials);

    const { region } = await inquirer.prompt([
      {
        type: 'list',
        name: 'region',
        message: 'Select a region:',
        choices: regions
      }
    ]);

    const { materialId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'materialId',
        message: 'Select a material:',
        choices: materials.map((material) => formatMaterialChoice(material, region))
      }
    ]);

    const selectedMaterial = findMaterialById(materials, materialId);
    const selectedPrice = selectedMaterial.prices[region];

    printOrderPreview(region, selectedMaterial, selectedPrice);

    const firstConfirmation = await askYesNo('Confirm order? (y/n)');

    if (firstConfirmation) {
      const orderData = createOrderData(region, selectedMaterial, selectedPrice, selectedPrice);
      const savedPath = await saveOrder(orderData);
      console.log(`\nOrder confirmed and saved to: ${savedPath}`);
      return;
    }

    const offer = buildRetentionOffer(selectedMaterial, materials, region);

    console.log(`\n${offer.message}`);
    console.log('Final offer:');
    console.log(`Product: ${offer.product.name}`);
    console.log(`Category: ${offer.product.category}`);
    console.log(`Base price: ${offer.basePrice} RUB`);
    console.log(`Final price: ${offer.finalPrice} RUB`);

    const secondConfirmation = await askYesNo('Confirm order? (y/n)');

    if (!secondConfirmation) {
      console.log('\nOrder was not confirmed.');
      return;
    }

    const orderData = createOrderData(region, offer.product, offer.basePrice, offer.finalPrice);
    const savedPath = await saveOrder(orderData);

    console.log(`\nOrder confirmed and saved to: ${savedPath}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
