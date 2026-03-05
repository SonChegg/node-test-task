function getCheapestInCategory(materials, category, region) {
  const sameCategory = materials.filter((material) => material.category === category);

  if (sameCategory.length === 0) {
    return null;
  }

  let cheapest = sameCategory[0];

  for (const material of sameCategory) {
    if (material.prices[region] < cheapest.prices[region]) {
      cheapest = material;
    }
  }

  return cheapest;
}

function buildRetentionOffer(selectedMaterial, materials, region) {
  const cheapest = getCheapestInCategory(materials, selectedMaterial.category, region);
  const selectedPrice = selectedMaterial.prices[region];

  if (!cheapest) {
    return {
      type: 'none',
      product: selectedMaterial,
      basePrice: selectedPrice,
      finalPrice: selectedPrice,
      message: 'Дополнительное предложение недоступно.'
    };
  }

  const cheapestPrice = cheapest.prices[region];

  if (selectedPrice <= cheapestPrice) {
    const finalPrice = Number((selectedPrice * 0.95).toFixed(2));

    return {
      type: 'discount',
      product: selectedMaterial,
      basePrice: selectedPrice,
      finalPrice,
      message: 'Выбранный товар уже самый дешевый. Применяем скидку 5%.'
    };
  }

  return {
    type: 'alternative',
    product: cheapest,
    basePrice: cheapestPrice,
    finalPrice: cheapestPrice,
    message: 'Можем предложить более дешевый товар в той же категории.'
  };
}

module.exports = {
  buildRetentionOffer
};
