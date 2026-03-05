# Construction Materials CLI

Simple Node.js console application for selecting construction materials by region and confirming an order.

## Features

- Loads materials from local `materials.json`
- Region selection (`SPB`, `MSK`, `KRD`)
- Shows prices for the selected region
- Material selection and order confirmation
- Retention flow if user answers `n`
  - Finds cheapest product in the same category
  - If selected product is already cheapest, applies 5% discount
  - Otherwise offers cheapest alternative
- Saves confirmed order JSON files to `orders/order-{timestamp}.json`

## Project structure

```text
project/
  package.json
  materials.json
  src/
    index.js
    catalog.js
    retention.js
    order.js
  orders/
  README.md
```

## Requirements

- Node.js 16+

## Run

```bash
npm install
npm start
```

## Output order format

```json
{
  "region": "SPB",
  "productName": "Portland Cement M500 (50kg)",
  "category": "Cement",
  "basePrice": 430,
  "finalPrice": 430,
  "createdAt": "2026-03-05T10:00:00.000Z"
}
```
