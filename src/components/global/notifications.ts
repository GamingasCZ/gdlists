import type { NotificationContent } from "@/interfaces"
import { loggedIn } from "@/siteSettings"
import axios from "axios"
import { ref } from "vue"

export const allNotifs = ref<NotificationContent[]>([])
export const postNames = ref<NotificationContent[]>([])

export const currentUnread = ref(0)
export const notificationCache = ref([[],[]])

export async function fetchNotifications(force = false, sorting = 0, type = -1, isPing = false) {
    if (!force && notificationCache.value[0].length) {
        allNotifs.value = notificationCache.value[0]
        allNotifs.value.forEach(x => x.unread = false)
        postNames.value = notificationCache.value[1]
        currentUnread.value = 0
        return
    }

    let params = {}
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
        return
    }
    if (res.data == "1") return false

    allNotifs.value = res.data[0]
    postNames.value = res.data[1]
    notificationCache.value = res.data
    currentUnread.value = res.data[2].c
    return true
}

export var notifTimeout: number | null = null
export function listenForNotifications() {
    const MINUTE = 6000
    const HALF_MINUTE = MINUTE/2

    // increase offset, if no new notifs arrive
    // if something arrives, nullify offset

    var offset = HALF_MINUTE
    const startNotifRead = async () => {
        let newNotifsArrived = await fetchNotifications(true, 0, -1, true)

        if (!newNotifsArrived)
            offset = Math.min(offset + Math.ceil(HALF_MINUTE / 2), 5*MINUTE)
        else
            offset = 0
        console.log(offset, notifTimeout)
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