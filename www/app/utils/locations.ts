// Single source of truth for the four restaurants.
// Each location keeps its own brand name and logo; the parent site uses the
// Cuban flag. Data captured from the live site on 2026-11-14 (docs/seo-migration.md).
//
// `slug` is also the public URL (/middletown/, /highlands/, …). Those paths
// are indexed by Google — never change a slug without a 301 in firebase.json.

import type { ImageId } from './images'

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'

export interface OpeningHours {
  days: DayOfWeek[]
  /** 24h "HH:MM" */
  opens: string
  /** 24h "HH:MM" */
  closes: string
}

export interface RestaurantLocation {
  slug: 'middletown' | 'highlands' | 'st-matthews' | 'lyndon'
  /** Brand name shown for this location */
  brand: string
  /** Neighborhood label */
  area: string
  /** Logo in /public; null → fall back to the parent flag mark */
  logo: string | null
  /**
   * Visual identity for this location's page and card, from its logo /
   * storefront sign: palette, heading lettering and banner colours.
   * Styles: [data-brand="…"] in assets/css/main.css.
   */
  theme: 'havana' | 'havana-tapas' | 'mojito'
  /** Hero / card photo — key of IMAGES (alt text lives in i18n `Images.*`) */
  imageId: ImageId
  address: {
    street: string
    city: string
    region: string
    postalCode: string
  }
  phone: string
  hours: OpeningHours[]
  ordering: {
    pickup: string
    delivery: string
  }
  giftCardUrl: string
  /** Shows the shared weekly drink specials */
  hasWeeklySpecials: boolean
  /** Dish names featured as house specialties */
  specialties: string[]
  /**
   * Food photos for the page's photo grid, in order — keys of IMAGES.
   * Only dishes on THIS location's menu (content/menus/<slug>.json); the
   * comment beside each list names the menu item. The first photo is shown large; 9 or 8 photos
   * fill the grid evenly.
   */
  foodPhotos: ImageId[]
  /** Year this location (or its concept) opened */
  since: number
}

const WEEKDAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday']

export const LOCATIONS: RestaurantLocation[] = [
  {
    slug: 'middletown',
    brand: 'Havana Rumba',
    area: 'Middletown',
    logo: '/images/brand/logo-middletown-havana-rumba.webp',
    theme: 'havana',
    imageId: 'middletownStorefront',
    address: { street: '12003 Shelbyville Road', city: 'Louisville', region: 'KY', postalCode: '40243' },
    phone: '502-244-5375',
    hours: [
      { days: WEEKDAYS, opens: '17:00', closes: '21:00' },
      { days: ['Friday'], opens: '11:30', closes: '22:00' },
      { days: ['Saturday'], opens: '12:00', closes: '22:00' },
      { days: ['Sunday'], opens: '12:00', closes: '20:30' }
    ],
    ordering: {
      pickup: 'https://havanarumbamiddletown.hrpos.heartland.us',
      delivery: 'https://ordering.chownow.com/order/42125/locations/63686'
    },
    giftCardUrl: 'https://havanarumbamiddletown.hrpos.heartland.us/gift',
    hasWeeklySpecials: true,
    specialties: ['Churrasco Steak', 'Pinchos Solomillo', 'Cuban Tamale', 'Pescado a la Parrilla', 'Lechón Asado', 'Palomilla Steak'],
    // content/menus/middletown.json: Steak Chimichurri, Cuban Tamale,
    // Pescado a la Parrilla, Lechón Asado, Palomilla Steak, Pollo Asado,
    // Cuban Sampler Plate, Camarones al Ajillo, Cubano Sandwich
    foodPhotos: ['churrasco', 'tamal', 'grilledFish', 'shreddedMeatYuca', 'steakOnions', 'roastChicken', 'appetizerSpread', 'garlicShrimp', 'cubanSandwich'],
    since: 2010
  },
  {
    slug: 'highlands',
    brand: 'Havana Rumba & Tapas Bar',
    area: 'Highlands',
    logo: '/images/brand/logo-highlands-havana-rumba-tapas.webp',
    theme: 'havana-tapas',
    // TODO: replace with the Highlands storefront (highlands-rest.jpg on the old site)
    imageId: 'tableSpreadMural',
    address: { street: '2210 Bardstown Road', city: 'Louisville', region: 'KY', postalCode: '40205' },
    phone: '502-749-4600',
    hours: [
      { days: WEEKDAYS, opens: '17:00', closes: '21:00' },
      { days: ['Friday', 'Saturday'], opens: '12:00', closes: '22:00' },
      { days: ['Sunday'], opens: '12:00', closes: '20:30' }
    ],
    ordering: {
      pickup: 'https://havanarumbaexpress.hrpos.heartland.us/menu',
      delivery: 'https://ordering.chownow.com/order/42125/locations/63801'
    },
    giftCardUrl: 'https://havanarumbaexpress.hrpos.heartland.us/gift',
    hasWeeklySpecials: true,
    specialties: ['Churrasco Steak', 'Pinchos Solomillo', 'Cuban Tamale', 'Pescado a la Parrilla', 'Lechón Asado', 'Palomilla Steak'],
    // content/menus/highlands.json: Camarones al Ajillo, Ensalada Tropical,
    // Empanadas, Papas Rellenas, Croquetas, Cuban Tamale, Steak Chimichurri,
    // Lechón Asado, Zarzuela de Mariscos (Shrimp Ceviche is 86'd online)
    foodPhotos: ['garlicShrimp', 'houseSalad', 'empanadas', 'papaRellena', 'croquetas', 'tamal', 'churrasco', 'shreddedMeatYuca', 'seafoodStew'],
    since: 2015
  },
  {
    slug: 'st-matthews',
    brand: 'Mojito in Havana',
    area: 'St. Matthews',
    // HR-St-Matthews-logo.png from the old site (wp-content/uploads/2022/09)
    logo: '/images/brand/logo-st-matthews-mojito-in-havana.webp',
    theme: 'mojito',
    imageId: 'stMatthewsStorefront',
    address: { street: '3939 Shelbyville Road', city: 'Louisville', region: 'KY', postalCode: '40207' },
    phone: '502-897-1959',
    hours: [
      { days: WEEKDAYS, opens: '17:00', closes: '21:00' },
      { days: ['Friday'], opens: '11:30', closes: '21:30' },
      { days: ['Saturday'], opens: '12:00', closes: '21:30' },
      { days: ['Sunday'], opens: '12:00', closes: '20:30' }
    ],
    ordering: {
      pickup: 'https://mojitoinhavana.hrpos.heartland.us',
      delivery: 'https://ordering.chownow.com/order/42125/locations/63687'
    },
    giftCardUrl: 'https://mojitoinhavana.hrpos.heartland.us/gift',
    hasWeeklySpecials: true,
    specialties: ['Churrasco Steak', 'Pinchos Solomillo', 'Cuban Tamale', 'Pescado a la Parrilla', 'Lechón Asado', 'Palomilla Steak'],
    // content/menus/st-matthews.json: Zarzuela de Mariscos, Steak
    // Chimichurri, Lechón Asado, Fricasé de Pollo, Palomilla Steak, Cuban Sampler
    // Plate, Ensalada Tropical, Churrasco Chicken sandwich, Pescado a la Parrilla
    foodPhotos: ['seafoodStew', 'churrasco', 'shreddedMeatYuca', 'chickenStew', 'steakOnions', 'appetizerSpread', 'houseSalad', 'sandwichFries', 'grilledFish'],
    since: 2004
  },
  {
    slug: 'lyndon',
    brand: 'Mojitos Tapas',
    area: 'Lyndon',
    logo: '/images/brand/logo-lyndon-mojito-tapas.webp',
    theme: 'mojito',
    // TODO: replace with the Lyndon storefront (lyndon-rest.jpg on the old site)
    imageId: 'stuffedDates',
    address: { street: '2231 Holiday Manor Center', city: 'Louisville', region: 'KY', postalCode: '40222' },
    phone: '502-425-0949',
    hours: [
      { days: WEEKDAYS, opens: '17:00', closes: '21:00' },
      { days: ['Friday', 'Saturday'], opens: '12:00', closes: '21:30' },
      { days: ['Sunday'], opens: '12:00', closes: '20:30' }
    ],
    ordering: {
      pickup: 'https://mojitostapas.hrpos.heartland.us/',
      delivery: 'https://ordering.chownow.com/order/42125/locations/63802'
    },
    giftCardUrl: 'https://mojitostapas.hrpos.heartland.us/gift',
    hasWeeklySpecials: false,
    specialties: ['Goat Cheese Flan', 'Churrasco Steak', 'Trío de Hummus', 'Pinchos Solomillo', 'Paella', 'Albóndigas', 'Ceviche de Camarones'],
    // content/menus/lyndon.json: Gambas al Ajillo, Zarzuela de Mariscos,
    // Empanadas, Croquetas, Tabla de Chimichurri, Sandwich Cubano, Black Beans,
    // Dátiles Rellenos. No other photographed dish is on this menu.
    foodPhotos: ['garlicShrimp', 'seafoodStew', 'empanadas', 'croquetas', 'churrasco', 'cubanSandwich', 'blackBeanSoup', 'stuffedDates'],
    since: 2007
  }
]

/** Weekly specials run by every location with `hasWeeklySpecials`. Copy: i18n `Specials.*` */
export const WEEKLY_SPECIALS = [
  { day: 'Monday', key: 'monday', icon: 'i-lucide-wine' },
  { day: 'Tuesday', key: 'tuesday', icon: 'i-lucide-beer' },
  { day: 'Wednesday', key: 'wednesday', icon: 'i-lucide-martini' }
] as const satisfies readonly { day: DayOfWeek, key: string, icon: string }[]

export const LOCATION_SLUGS = LOCATIONS.map(l => l.slug)

export function getLocation(slug: string): RestaurantLocation | undefined {
  return LOCATIONS.find(l => l.slug === slug)
}

export function telHref(phone: string): string {
  return `tel:+1${phone.replace(/\D/g, '')}`
}

export function directionsHref(loc: RestaurantLocation): string {
  const q = `${loc.brand}, ${loc.address.street}, ${loc.address.city}, ${loc.address.region} ${loc.address.postalCode}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}

const DAY_INDEX: Record<DayOfWeek, number> = {
  Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0
}

/** Localized weekday name via Intl (2024-01-07 was a Sunday). */
export function formatDay(day: DayOfWeek, locale: string, style: 'long' | 'short' = 'long'): string {
  const d = new Date(Date.UTC(2024, 0, 7 + DAY_INDEX[day], 12))
  return new Intl.DateTimeFormat(locale, { weekday: style, timeZone: 'UTC' }).format(d)
}

/** Localized "5:00 PM" / "17:00" via Intl. */
export function formatTime(hhmm: string, locale: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(Date.UTC(2024, 0, 1, h, m))
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(d)
}

/** "Monday – Thursday" style label for a group of consecutive days. */
export function formatDayRange(days: DayOfWeek[], locale: string): string {
  if (days.length === 1) return formatDay(days[0]!, locale)
  return `${formatDay(days[0]!, locale)} – ${formatDay(days[days.length - 1]!, locale)}`
}
