import type { NotificationContent } from "@/interfaces"
import { loggedIn } from "@/siteSettings"
import axios from "axios"
import { ref } from "vue"

export const allNotifs = ref<NotificationContent[]>([])
export const postNames = ref<NotificationContent[]>([])

export const currentUnread = ref(0)
export const notificationCache = ref([[],[]])

export enum NotifState {
    Error,
    MoreAvailable,
    AtEnd,
    Nothing
}

export async function fetchNotifications(force = false, sorting = 0, type = -1, isPing = false, page=0) {
    if (!force && notificationCache.value[0].length) {
        allNotifs.value = notificationCache.value[0]
        allNotifs.value.forEach(x => x.unread = false)
        postNames.value = notificationCache.value[1]
        currentUnread.value = 0
        return NotifState.Nothing
    }

    let params = {page: page}
    if (sorting > 0)
        params.sort = sorting
    if (type > -1)
        params.type = type
    if (isPing)
        params.np = 1 // np = notif ping, uBlock blocks ping GET requests lol :D

    const res = await axios.get(import.meta.env.VITE_API + "/notifications.php", {params: params})

    // No new notifications
    if (isPing) {
        if (!isNaN(parseInt(res.data)))
            currentUnread.value = res.data
        return NotifState.Nothing
    }
    if (res.data == "1") return NotifState.MoreAvailable // why i add this?

    // no new notifications
    if (res.data == "2") return NotifState.AtEnd

    if (page > 0) {
        allNotifs.value.push(...res.data[0])
        postNames.value.push(...res.data[1])
    }
    else {
        allNotifs.value = res.data[0]
        postNames.value = res.data[1]
        notificationCache.value = res.data    
    }
    currentUnread.value = res.data[2].c
    if (res.data[2]?.lastPage)
        return NotifState.AtEnd
    else
        return NotifState.MoreAvailable
}

export var notifTimeout: number | null = null
export const clearNotifListed = () => {
    if (notifTimeout != null) {
        clearTimeout(notifTimeout)
        notifTimeout = null
    }
}
export function listenForNotifications() {
    const MINUTE = 60000
    const HALF_MINUTE = MINUTE/2

    if (notifTimeout != null)
        clearNotifListed()

    // increase offset, if no new notifs arrive
    // if something arrives, nullify offset

    var offset = HALF_MINUTE
    const startNotifRead = async () => {
        let newNotifsArrived = await fetchNotifications(true, 0, -1, true)

        if (!newNotifsArrived)
            offset = Math.min(offset + Math.ceil(HALF_MINUTE / 2), 5*MINUTE)
        else
            offset = 0
        notifTimeout = setTimeout(startNotifRead, HALF_MINUTE+offset)
    }

    notifTimeout = setTimeout(() => {
        if (loggedIn.value)
            startNotifRead()
    }, MINUTE);
}

export function removeNotifs() {
    axios.delete(import.meta.env.VITE_API + "/notifications.php", {params: {all: 1}}).then(res => {
        allNotifs.value = []
        postNames.value = []
    })
}