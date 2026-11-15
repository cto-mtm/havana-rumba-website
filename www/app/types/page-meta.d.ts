// Custom page meta used across the app.
declare module '#app' {
  interface PageMeta {
    /**
     * The page opens with a dark, full-bleed hero (PageHero or the home hero).
     * SiteHeader then sits transparent with light text at scroll 0.
     * Pages without it get the solid header from the start.
     */
    heroOverlay?: boolean
  }
}

export {}
