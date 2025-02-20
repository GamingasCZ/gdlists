import { Key } from "./Writer";
import { i18n } from "@/locales";
import SaveIcon from "@/images/symbolicSave.svg?url"
import GearIcon from "@/images/gear.svg?url"
import TrashIcon from "@/images/trash.svg?url"
import KeyIcon from "@/images/key.svg?url"
import EditIcon from "@/images/edit.svg?url"
import { ref } from "vue";

const writerShortcuts = [
    {
        shortcut: [Key.Ctrl, 'S'],
        action: ["save"],
        title: i18n.global.t('other.save'),
        icon: SaveIcon
    },
    {
        shortcut: [Key.Alt | Key.Shift, 'P'],
        action: ["containerOptions"],
        title: "Možnosti prvku",
        icon: GearIcon
    },
    {
        shortcut: [Key.Alt | Key.Shift, 'Q'],
        action: ["containerDelete"],
        title: "Smazat prvek",
        icon: TrashIcon
    },
    {
        shortcut: [Key.Ctrl | Key.Alt, 'K'],
        action: ["shortcutsMenu"],
        title: i18n.global.t('reviews.keysh'),
        icon: KeyIcon
    },
    {
        shortcut: [Key.Ctrl, 'O'],
        action: ["drafts"],
        title: i18n.global.t('reviews.drafts'),
        icon: EditIcon
    },
]

var actionsFun
export const shortcutListen = (toolbar, actions) => {
    document.documentElement.addEventListener("keydown", blockNativeShortcuts)
    document.documentElement.addEventListener("keyup", checkForShortcut)

    actionsFun = actions
    getShortcuts(toolbar)
}

export const shortcutUnload = () => {
    document.documentElement.removeEventListener("keydown", blockNativeShortcuts)
    document.documentElement.removeEventListener("keyup", checkForShortcut)
}


export var keyShortcuts: [Key, any[]][] = []
const BASE = import.meta.env.BASE_URL
const getShortcuts = (toolbar) => {
    keyShortcuts = []
    writerShortcuts.forEach(button => 
        keyShortcuts.push([button.shortcut, button.action, button.title, button.icon]))

    for (const key in toolbar) {
        for (const key2 in toolbar[key]) {
            for (const button of toolbar[key][key2]) {
                let icon = `${BASE}/formatting/${typeof button?.icon == 'object' ? button.icon[0] : button.icon}.svg`

                if (button?.shortcut)
                    keyShortcuts.push([button?.shortcut, button?.action, button?.title || button?.tooltip, icon])
    
                // Fixed shortcuts apply only if a given toolbar is active
                // TODO
                if (button?.shortcutFixed && true)
                    keyShortcuts.push([button?.shortcutFixed, button?.action, button.title || button?.tooltip, icon])
            }
        }
    }
}

const isValidShortcut = (combo: number, key: string) => {
    for (let i = 0; i < keyShortcuts.length; i++) {
        if (keyShortcuts[i][0][0] == combo && keyShortcuts[i][0][1] == key)
            return keyShortcuts[i][1]
        if (typeof keyShortcuts[i][0][0] == 'object')
            for (let j = 0; j < keyShortcuts[i][0].length; j++) {
                if (keyShortcuts[i][0][j][0] == combo && keyShortcuts[i][0][j][1] == key)
                    return [keyShortcuts[i][1][0], keyShortcuts[i][1][1][j]]
            }
    }
    return false
}

// Mainly for text selection to keep working
// Disables browser shortcuts
var isShortcut = null
export const comboHeld = ref(Key.None)
function blockNativeShortcuts(e: KeyboardEvent) {
	let combo = getCombo(e)
	let key = getKey(e)
    comboHeld.value = combo

	if (combo != Key.None && (isValidShortcut(combo, key))) {
		e.preventDefault()
	}
}

function checkForShortcut(e: KeyboardEvent) {
    isShortcut = null
	let currCombo = getCombo(e)
	let key = getKey(e)
    comboHeld.value = currCombo

	let f: string[] | boolean;
	if (currCombo != Key.None && (f = isValidShortcut(currCombo, key)))
        actionsFun(...f)

}

function getCombo(e: KeyboardEvent) {
    return +e.ctrlKey * Key.Ctrl | +e.shiftKey * Key.Shift | +e.altKey * Key.Alt
}


function getKey(e: KeyboardEvent) {
    let key = e.key.toUpperCase()
	switch (key) {
		case '+': key = '1'; break;
		case 'Ě': key = '2'; break;
		case 'Š': key = '3'; break;
		default: break;
	}
    return key
}
