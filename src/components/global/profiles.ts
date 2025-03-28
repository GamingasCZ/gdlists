import { ref } from "vue"

export const lastPFPchange = ref(Date.now())
export const currentCutout = ref(0)
export const currentUID = ref("0")
export const profileCutouts = [
    'circle()',
    'rect(0 0 100% 100% round 10%)',
  'polygon(50% 5%, 68% 26%, 100% 40%, 80% 63%, 79% 95%, 50% 88%, 21% 95%, 20% 63%, 0 40%, 30% 26%)',
  'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  'polygon(49% 15%, 75% 25%, 90% 0%, 100% 70%, 80% 95%, 50% 100%, 19% 95%, 0% 70%, 10% 0%, 25% 25%)',
]

export const currentUnread = ref(0)
export const notificationCache = ref([[],[]])

