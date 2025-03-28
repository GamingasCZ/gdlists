import { nextTick, ref } from "vue";
import { createI18n } from "vue-i18n";
import { SETTINGS } from "./siteSettings";

export const locales = ['cs-CZ', 'en-US']

export const i18n = createI18n({
  legacy: false,
  pluralizationRules: {
    'cs-CZ': czech
  },
  locale: locales[SETTINGS.value.language],
});

export const langIndex = ref(0)
export async function setLanguage(lang: 0 | 1) {
  let message = await import(`./locales/${locales[lang]}.json`)
  i18n.global.setLocaleMessage(locales[lang], message.default)
  langIndex.value = lang
  i18n.global.locale.value = locales[lang]

  return nextTick()
}

function czech(choice) {
  console.log(choice)
  if (choice === 0) return 0
  if (choice === 1) return 1

  if (choice > 1 && choice < 5) return 2
  if (choice >= 5) return 0
}