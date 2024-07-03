import { nextTick, ref } from "vue";
import { createI18n } from "vue-i18n";

export const locales = ['cs-CZ', 'en-US']

export const i18n = createI18n({
  legacy: false,
});

export const langIndex = ref(0)
export async function setLanguage(lang: 0|1) {
  let message = await import(`./locales/${locales[lang]}.json`)
  i18n.global.setLocaleMessage(locales[lang], message.default)
  langIndex.value = lang
  i18n.global.locale.value = locales[lang]

  return nextTick()
}