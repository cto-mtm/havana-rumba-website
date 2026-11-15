// Brand tokens. Every component should pull color from these semantic names
// (text-primary, bg-secondary, ring-accent, …) — never from raw palette
// classes like text-red-600 — so a rebrand is a one-file change here.
export default defineAppConfig({
  ui: {
    colors: {
      // Palettes come from the in-house drink menu and are defined with
      // @theme in assets/css/main.css: tobacco (script, links), palm
      // (Mojito green), gold (on dark only), parchment (paper + charcoal ink).
      primary: 'tobacco',
      secondary: 'palm',
      accent: 'gold',
      success: 'palm',
      info: 'sky',
      warning: 'gold',
      error: 'hibiscus',
      neutral: 'parchment'
    },

    // Every UButton is drawn like the drink menu: condensed caps inside a
    // two-step-corner frame (utilities in assets/css/main.css). Solid →
    // charcoal frame; outline/subtle → parchment frame.
    button: {
      slots: {
        base: 'rounded-none font-condensed font-bold uppercase tracking-[0.08em] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0'
      },
      compoundVariants: [
        { color: 'primary', variant: 'solid', class: 'frame-dark-sm bg-transparent text-parchment-100 hover:bg-transparent active:bg-transparent' },
        { color: 'neutral', variant: 'solid', class: 'frame-dark-sm bg-transparent text-parchment-100 hover:bg-transparent active:bg-transparent' },
        { color: 'primary', variant: 'outline', class: 'frame-sm bg-transparent text-highlighted ring-0 hover:bg-transparent' },
        { color: 'neutral', variant: 'outline', class: 'frame-sm bg-transparent text-highlighted ring-0 hover:bg-transparent' }
      ]
    }
  },

  // Site navigation consumed by SiteHeader / SiteFooter.
  // `name` is the route name (file name in pages/) — it is always passed
  // through localePath(), never used as a raw href.
  // Locations are not listed here: they come from app/utils/locations.ts and
  // get their own dropdown. `footerOnly` items are hidden from the header.
  nav: [
    { name: 'about', labelKey: 'AppHeader.about', icon: 'i-lucide-book-open', footerOnly: false },
    { name: 'gallery', labelKey: 'AppHeader.gallery', icon: 'i-lucide-images', footerOnly: false },
    { name: 'catering', labelKey: 'AppHeader.catering', icon: 'i-lucide-chef-hat', footerOnly: false },
    { name: 'gift-cards', labelKey: 'AppHeader.giftCards', icon: 'i-lucide-gift', footerOnly: false },
    { name: 'careers', labelKey: 'AppHeader.careers', icon: 'i-lucide-briefcase', footerOnly: true },
    { name: 'contact-us', labelKey: 'AppHeader.contact', icon: 'i-lucide-mail', footerOnly: false }
  ],

  social: [
    // { label: 'Instagram', href: 'https://instagram.com/REPLACE_ME', icon: 'i-lucide-instagram' }
  ] as { label: string, href: string, icon: string }[]
})
