import type { NotificationContent } from "@/interfaces"
import axios from "axios"
import { ref } from "vue"

export const allNotifs = ref<NotificationContent[]>([])
export const postNames = ref<NotificationContent[]>([])
export const unreadAmount = ref<number>([])

export const currentUnread = ref(0)
export const notificationCache = ref([[],[]])

export function fetchNotifications(force = false, sorting = 0, type = -1) {
    if (!force && notificationCache.value[0].length) {
        allNotifs.value = notificationCache.value[0]
        allNotifs.value.forEach(x => x.unread = false)
        postNames.value = notificationCache.value[1]
        currentUnread.value = 0
        return
    }

    let params = {all: 1}
    if (sorting > 0)
        params.sort = sorting
    if (type > -1)
        params.type = type

    axios.get(import.meta.env.VITE_API + "/notifications.php", {params: params}).then(res => {
        if (res == null) unreadAmount.value = 0
        allNotifs.value = res.data[0]
        postNames.value = res.data[1]
        notificationCache.value = res.data
        currentUnread.value = res.data[2]
    })
}

export function listenForNotifications() {
    const MINUTE = 60000
    const HALF_MINUTE = MINUTE/2

    // increase offset, if no new notifs arrive
    // if something arrives, nullify offset
    var offset = HALF_MINUTE
    setTimeout(() => {
        setInterval(() => {
            fetchNotifications(true)
            offset += Math.ceil(HALF_MINUTE / 2)
        }, HALF_MINUTE+offset);
    }, MINUTE);
}

export function removeNotifs() {
    axios.delete(import.meta.env.VITE_API + "/notifications.php", {params: {all: 1}}).then(res => {
        allNotifs.value = []
        postNames.value = []
        unreadAmount.value = 0
    })
}