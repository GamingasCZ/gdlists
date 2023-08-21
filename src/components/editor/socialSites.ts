import { ref } from "vue"

export const socialMedia = [
    {'name': "YouTube kanál", 'icon': "youtube", 'color': "#FF0000"},
    {'name': "Twitter účet", 'icon': "twitter", 'color': "#1DA1F2"},
    {'name': "Discord jméno", 'icon': "discord", 'color': "#5865F2"},
    {'name': "Twitch kanál", 'icon': "twitch", 'color': "#9146ff"},
    {'name': "Vlastní odkaz", 'icon': "link", 'color': "#2C2F33"}
  ]
  
export const socialMediaImages = ref({})
  
const getSocialsIcons = async () => {
socialMedia.forEach(async web => {
    socialMediaImages.value[web.icon] = await import(`../../images/socials/${web.icon}.svg`).then(res => res.default)
})
}
getSocialsIcons()
  