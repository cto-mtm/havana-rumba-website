// Register every translation file here, namespaced by its file name.
// Usage in components: t('AppHeader.contact'), t('PageContact.form.name'), …
import AppHeader from './locales/components/AppHeader'
import AppFooter from './locales/components/AppFooter'
import Site from './locales/configs/Site'
import Specials from './locales/configs/Specials'
import Images from './locales/configs/Images'
import PageIndex from './locales/pages/PageIndex'
import PageContact from './locales/pages/PageContact'
import PageLocation from './locales/pages/PageLocation'
import PageAbout from './locales/pages/PageAbout'
import PageGallery from './locales/pages/PageGallery'
import PageCatering from './locales/pages/PageCatering'
import PageGiftCards from './locales/pages/PageGiftCards'
import PageCareers from './locales/pages/PageCareers'

const files = { AppHeader, AppFooter, Site, Specials, Images, PageIndex, PageContact, PageLocation, PageAbout, PageGallery, PageCatering, PageGiftCards, PageCareers }

type Lang = 'en' | 'es'
const pick = (lang: Lang) =>
  Object.fromEntries(Object.entries(files).map(([ns, f]) => [ns, f[lang]]))

export default defineI18nConfig(() => ({
  legacy: false,
  fallbackLocale: 'en',
  messages: {
    en: pick('en'),
    es: pick('es')
  }
}))
