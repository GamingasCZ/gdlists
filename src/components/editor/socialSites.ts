import { i18n } from "@/locales"
import { ref } from "vue"

export const socialMedia = [
    {'name': i18n.global.t('collabTools.yt'), 'icon': "youtube", 'baseUrl': "youtube.com", 'color': "#FF0000", 'index': 0},
    {'name': i18n.global.t('collabTools.twitter'), 'icon': "twitter", 'baseUrl': "twitter.com", 'color': "#1DA1F2", 'index': 1},
    {'name': i18n.global.t('collabTools.twitch'), 'icon': "twitch", 'baseUrl': "twitch.tv", 'color': "#9146ff", 'index': 2},
    {'name': i18n.global.t('collabTools.dis'), 'icon': "discord", 'baseUrl': "Discord", 'color': "#5865F2", 'index': 3},
    {'name': i18n.global.t('collabTools.customLink'), 'icon': "link", 'baseUrl': "Custom", 'color': "#2C2F33", 'index': 4}
  ]
  
export const socialMediaImages = ref({})
  
const getSocialsIcons = async () => {
    socialMedia.forEach(async web => {
        socialMediaImages.value[web.icon] = await import(`../../images/socials/${web.icon}.svg`).then(res => res.default)
    })
}
getSocialsIcons()

export function checkAndRemoveDomain(possibleURL: string) {
    try {
        let urlCheck = new URL(possibleURL)
        return urlCheck.pathname
    } catch (e) {
        return possibleURL
    }
}

  