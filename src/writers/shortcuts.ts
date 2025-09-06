import { Key } from "./Writer";
import { i18n } from "@/locales";
import SaveIcon from "@/images/symbolicSave.svg?url"
import GearIcon from "@/images/gear.svg?url"
import TrashIcon from "@/images/trash.svg?url"
import KeyIcon from "@/images/key.svg?url"
import EditIcon from "@/images/edit.svg?url"
import ResizeIcon from "@/images/resizer.svg?url"
import MoveUpIcon from "@/images/moveUp.svg?url"
import MoveDownIcon from "@/images/moveDown.svg?url"
import AddIcon from "@/images/plus.svg?url"
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
        title: i18n.global.t('reviews.elemSettings'),
        icon: GearIcon
    },
    {
        shortcut: [Key.Alt | Key.Shift, 'Q'],
        action: ["containerDelete"],
        title: i18n.global.t('reviews.rmElem'),
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
    {
        shortcut: [Key.Alt, 'L'],
        action: ["addLevel"],
        title: i18n.global.t('reviews.addLevel'),
        icon: AddIcon
    },
    {
        shortcut: [Key.Alt, '-'],
        action: ["resizeSmaller"],
        title: i18n.global.t('reviews.decSize'),
        icon: ResizeIcon
    },
    {
        shortcut: [Key.Alt, '+'],
        action: ["resizeBigger"],
        title: i18n.global.t('reviews.incSize'),
        icon: ResizeIcon
    },
    {
        shortcut: [Key.Alt | Key.Shift, 'ArrowUp'],
        action: ["moveUp"],
        title: i18n.global.t('reviews.elUp'),
        icon: MoveUpIcon
    },
    {
        shortcut: [Key.Alt | Key.Shift, 'ArrowDown'],
        action: ["moveDown"],
        title: i18n.global.t('reviews.elDown'),
        icon: MoveDownIcon
    },
]

var actionsFun
export const shortcutListen = (toolbar, actions) => {
    window.addEventListener("keydown", blockNativeShortcuts)
    window.addEventListener("keyup", checkForShortcut)

    actionsFun = actions
    getShortcuts(toolbar)
}

export const shortcutUnload = () => {
    window.removeEventListener("keydown", blockNativeShortcuts)
    window.removeEventListener("keyup", checkForShortcut)
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

                if (button?.shortcut) {
                    if (typeof button.shortcut?.[0] == 'object') {
                        for (let i = 0; i < button.shortcut.length; i++) {
                            let icon = `${BASE}/formatting/${button.icon[i]}.svg`
                            keyShortcuts.push([button.shortcut[i], [button.action[0], button.action[1][i]], button?.dropdownText?.[i], icon])
                        }
                    }
                    else {
                        let icon = `${BASE}/formatting/${typeof button?.icon == 'object' ? button.icon[0] : button.icon}.svg`
                        keyShortcuts.push([button.shortcut, button.action, button?.title || button?.tooltip || button?.titleSwitchable?.[0], icon])
                    }
                }
    
                // Fixed shortcuts apply only if a given toolbar is active
                // TODO
                // if (button?.shortcutFixed && true)
                //     keyShortcuts.push([button?.shortcutFixed, button?.action, button.title || button?.tooltip, icon])
            }
        }
    }
}

const isValidShortcut = (combo: number, key: string, code: string) => {
    for (let i = 0; i < keyShortcuts.length; i++) {
        if (keyShortcuts[i][0][0] == combo && (keyShortcuts[i][0][1] == key || keyShortcuts[i][0][1] == code))
            return keyShortcuts[i][1]
        if (typeof keyShortcuts[i][0][0] == 'object')
            for (let j = 0; j < keyShortcuts[i][0].length; j++) {
                if (keyShortcuts[i][0][j][0] == combo && (keyShortcuts[i][0][j][1] == key || keyShortcuts[i][0][j][1] == code))
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
    comboHeld.value = combo

	if (combo != Key.None && (isValidShortcut(combo, e.key.toUpperCase(), e.code))) {
		e.preventDefault()
	}
}

function checkForShortcut(e: KeyboardEvent) {
    isShortcut = null
	let currCombo = getCombo(e)
    comboHeld.value = currCombo

	let f: string[] | boolean;
	if (currCombo != Key.None && (f = isValidShortcut(currCombo, e.key.toUpperCase(), e.code)))
        actionsFun(...f)

}

function getCombo(e: KeyboardEvent) {
    return +e.ctrlKey * Key.Ctrl | +e.shiftKey * Key.Shift | +e.altKey * Key.Alt
}

const overrides = {
    'Digit1': '1',
    'Digit2': '2',
    'Digit3': '3',
    'ArrowUp': '▲',
    'ArrowDown': '▼'
}

export const doOverride = (key: string) => {
    if (overrides[key])
        return overrides[key]
    return key
}