// Registry of every photo the site shows. Alt text and captions are
// user-facing, so they live in i18n (`Images.<id>.alt` / `.caption`) —
// never typed into templates.
//
// Captions describe what is visible. Only use a menu dish name when the
// photo is known to be that dish (photos come from the 2022 Greater Art
// Solutions shoot and the 2009 shoot — see docs/content-inventory.md).

export const IMAGES = {
  // Ambience
  tableSpreadMural: '/images/ambience/table-spread-mural.webp',
  tableSpreadMuralWide: '/images/ambience/table-spread-mural-wide.webp',
  tableSpreadOverhead: '/images/ambience/table-spread-overhead.webp',
  bar: '/images/ambience/bar.webp',
  diningRoom: '/images/ambience/dining-room.webp',
  diningRoomYellow: '/images/ambience/dining-room-yellow.webp',
  chef: '/images/ambience/chef.webp',

  // Locations
  middletownStorefront: '/images/locations/middletown-storefront.webp',
  stMatthewsStorefront: '/images/locations/st-matthews-mojito-storefront.webp',

  // Food
  churrasco: '/images/food/mains/churrasco-chimichurri.webp',
  roastChicken: '/images/food/mains/roast-chicken.webp',
  cubanSandwich: '/images/food/mains/cubano-sandwich.webp',
  chickenPeppers: '/images/food/mains/pollo-salteado.webp',
  steakOnions: '/images/food/mains/bistec-encebollado.webp',
  grilledFish: '/images/food/mains/grilled-fish-maduros.webp',
  chickenStew: '/images/food/mains/fricase-stew.webp',
  appetizerSpread: '/images/food/appetizers/appetizer-spread.webp',
  croquetas: '/images/food/appetizers/croquetas.webp',
  garlicShrimp: '/images/food/appetizers/gambas-al-ajillo.webp',
  empanadas: '/images/food/appetizers/empanadas.webp',
  seafoodStew: '/images/food/appetizers/seafood-cazuela.webp',
  tamal: '/images/food/appetizers/tamal.webp',
  shrimpCeviche: '/images/food/appetizers/ceviche.webp',
  stuffedDates: '/images/food/appetizers/bacon-wrapped-dates.webp',
  shreddedMeatYuca: '/images/food/mains/shredded-meat-pickled-onion-yuca.webp',
  porkOnions: '/images/food/mains/pork-with-onions.webp',
  sandwichFries: '/images/food/mains/burger.webp',
  houseSalad: '/images/food/appetizers/house-salad.webp',
  papaRellena: '/images/food/appetizers/papa-rellena.webp',
  blackBeanSoup: '/images/food/appetizers/black-bean-soup.webp',
  layerCake: '/images/food/desserts/tres-leches.webp',
  breadPudding: '/images/food/desserts/bread-pudding.webp',

  // Drinks
  mojito: '/images/drinks/mojito.webp',
  bloodyMary: '/images/drinks/bloody-mary-classic-car.webp',
  sangria: '/images/drinks/sangria.webp',
  swirlCocktail: '/images/drinks/sangria-glass.webp',
  cocktailsPair: '/images/drinks/cocktails-pair.webp',
  coconutCocktail: '/images/drinks/coconut-cocktail.webp',
  cafeConLeche: '/images/drinks/cafe-con-leche.webp'
} as const

export type ImageId = keyof typeof IMAGES
