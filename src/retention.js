function findCheapestInCategory(materials, category, region) {
  const sameCategory = materials.filter((material) => {
    return material.category === category && Number.isFinite(material.prices[region]);
  });

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
  if (!selectedMaterial) {
    throw new Error('Не удалось подготовить предложение: товар не найден.');
  }

  const selectedPrice = selectedMaterial.prices && selectedMaterial.prices[region];
  if (!Number.isFinite(selectedPrice)) {
    throw new Error(`Для выбранного товара нет цены в регионе ${region}.`);
  }

  const cheapest = findCheapestInCategory(materials, selectedMaterial.category, region);

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
