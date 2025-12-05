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
import RemoveIcon from "@/images/close.svg?url"
import { ref } from "vue";
import { hasLocalStorage, SETTINGS } from "@/siteSettings";

var defaultShortcuts = [
    {
        "save": [Key.Ctrl, 'S'],
        "containerOptions": [Key.Alt | Key.Shift, 'P'],
        "containerDelete": [Key.Alt | Key.Shift, 'Q'],
        "shortcutsMenu": [Key.Ctrl | Key.Alt, 'K'],
        "drafts": [Key.Ctrl, 'O'],
        "addLevel": [Key.Alt, 'L'],
        "resizeSmaller": [Key.Alt, '-'],
        "resizeBigger": [Key.Alt, '+'],
        "moveUp": [Key.Alt | Key.Shift, 'ArrowUp'],
        "moveDown": [Key.Alt | Key.Shift, 'ArrowDown'],
        "deselect": [Key.None, 'Escape'],

        "add.default": [Key.Alt | Key.Shift, 'F'],
        "preview.1": [Key.Alt | Key.Shift, 'J'],                
        "add.heading1": [Key.Alt, 'Digit1', true],
        "add.heading2": [Key.Alt, 'Digit2', true],
        "add.heading3": [Key.Alt, 'Digit3', true],
        "align.left": [Key.Alt, 'L'],
        "align.center": [Key.Alt, 'E'],
        "align.right": [Key.Alt, 'R'],
        "align.justify": [Key.Alt, 'J'],
        "add.showImage": [Key.Alt | Key.Shift, 'I'],
        "add.addVideo": [Key.Alt | Key.Shift, 'V'],
        "add.addCarousel": [Key.Alt | Key.Shift, 'C'],
        "add.divisor": [Key.Alt | Key.Shift, 'S'],
        "add.showLevel": [Key.Alt | Key.Shift, 'L'],
        "add.showRating": [Key.Alt | Key.Shift, 'R'],
        "add.showList": [Key.Alt | Key.Shift, 'E'],
        "columnCreate": [Key.Alt | Key.Shift, 'D'],
        "format.0": [Key.Ctrl, 'B'],
        "format.1": [Key.Ctrl, 'I'],
        "format.2": [Key.Ctrl, 'D'],
        "format.3": [Key.Ctrl, 'L'],
        "format.4": [Key.Ctrl, 'B'],
        "format.5": [Key.Ctrl, 'M'],
        "format.6": [Key.Ctrl, 'L'],
        "splitParagraph": [Key.Ctrl | Key.Alt, 'S']
    },
    {
        "save": [Key.Ctrl, 'S'],
        "containerOptions": [Key.Ctrl | Key.Shift, 'P'],
        "containerDelete": [Key.Ctrl | Key.Shift, 'Q'],
        "shortcutsMenu": [Key.Ctrl | Key.Alt, 'K'],
        "drafts": [Key.Ctrl, 'O'],
        "addLevel": [Key.Ctrl | Key.Shift, 'L'],
        "resizeSmaller": [Key.Alt, '-'],
        "resizeBigger": [Key.Alt, '+'],
        "moveUp": [Key.Ctrl | Key.Shift, 'ArrowUp'],
        "moveDown": [Key.Ctrl | Key.Shift, 'ArrowDown'],
        "deselect": [Key.None, 'Escape'],

        "add.default": [Key.Ctrl | Key.Shift, 'F'],
        "preview.1": [Key.Ctrl | Key.Shift, 'J'],                
        "add.heading1": [Key.Ctrl, 'Digit1', true],
        "add.heading2": [Key.Ctrl, 'Digit2', true],
        "add.heading3": [Key.Ctrl, 'Digit3', true],
        "align.left": [Key.Ctrl, 'L'],
        "align.center": [Key.Ctrl, 'E'],
        "align.right": [Key.Ctrl, 'R'],
        "align.justify": [Key.Ctrl, 'J'],
        "add.showImage": [Key.Ctrl | Key.Shift, 'I'],
        "add.addVideo": [Key.Ctrl | Key.Shift, 'V'],
        "add.addCarousel": [Key.Ctrl | Key.Shift, 'C'],
        "add.divisor": [Key.Ctrl | Key.Shift, 'S'],
        "add.showLevel": [Key.Ctrl | Key.Shift, 'L'],
        "add.showRating": [Key.Ctrl | Key.Shift, 'R'],
        "add.showList": [Key.Ctrl | Key.Shift, 'E'],
        "columnCreate": [Key.Ctrl | Key.Shift, 'D'],
        "format.0": [Key.Ctrl, 'B'],
        "format.1": [Key.Ctrl, 'I'],
        "format.2": [Key.Ctrl, 'D'],
        "format.3": [Key.Ctrl, 'L'],
        "format.4": [Key.Ctrl, 'B'],
        "format.5": [Key.Ctrl, 'M'],
        "format.6": [Key.Ctrl, 'L'],
        "splitParagraph": [Key.Ctrl | Key.Alt, 'S']
    },
    {
        "save": [Key.Ctrl, 'S'],
        "containerOptions": [Key.Ctrl | Key.Shift, 'P'],
        "containerDelete": [Key.Ctrl | Key.Shift, 'Q'],
        "shortcutsMenu": [Key.Ctrl | Key.Alt, 'K'],
        "drafts": [Key.Ctrl, 'O'],
        "addLevel": [Key.Alt, 'L'],
        "resizeSmaller": [Key.Alt, '-'],
        "resizeBigger": [Key.Alt, '+'],
        "moveUp": [Key.Alt | Key.Shift, 'ArrowUp'],
        "moveDown": [Key.Alt | Key.Shift, 'ArrowDown'],
        "deselect": [Key.None, 'Escape'],

        "add.default": [Key.None, 'P'],
        "preview.1": [Key.Shift, 'P'],
        "add.heading1": [Key.None, 'Digit1', true],
        "add.heading2": [Key.None, 'Digit2', true],
        "add.heading3": [Key.None, 'Digit3', true],
        "align.left": [Key.Ctrl, 'L'],
        "align.center": [Key.Ctrl, 'E'],
        "align.right": [Key.Ctrl, 'R'],
        "align.justify": [Key.Ctrl, 'J'],
        "add.showImage": [Key.None, 'I'],
        "add.addVideo": [Key.None, 'V'],
        "add.addCarousel": [Key.None, 'C'],
        "add.divisor": [Key.None, 'S'],
        "add.showLevel": [Key.None, 'L'],
        "add.showRating": [Key.None, 'R'],
        "add.showList": [Key.None, 'E'],
        "columnCreate": [Key.None, 'D'],
        "format.0": [Key.Ctrl, 'B'],
        "format.1": [Key.Ctrl, 'I'],
        "format.2": [Key.Ctrl, 'D'],
        "format.3": [Key.Ctrl, 'L'],
        "format.4": [Key.Ctrl, 'B'],
        "format.5": [Key.Ctrl, 'M'],
        "format.6": [Key.Ctrl, 'L'],
        "splitParagraph": [Key.Ctrl | Key.Alt, 'S']
    },
]

const writerShortcuts = [
    {
        action: ["save"],
        title: i18n.global.t('other.save'),
        icon: SaveIcon
    },
    {
        action: ["containerOptions"],
        title: i18n.global.t('reviews.elemSettings'),
        icon: GearIcon
    },
    {
        action: ["containerDelete"],
        title: i18n.global.t('reviews.rmElem'),
        icon: TrashIcon
    },
    {
        action: ["shortcutsMenu"],
        title: i18n.global.t('reviews.keysh'),
        icon: KeyIcon
    },
    {
        action: ["drafts"],
        title: i18n.global.t('reviews.drafts'),
        icon: EditIcon
    },
    {
        action: ["addLevel"],
        title: i18n.global.t('reviews.addLevel'),
        icon: AddIcon
    },
    {
        action: ["resizeSmaller"],
        title: i18n.global.t('reviews.decSize'),
        icon: ResizeIcon
    },
    {
        action: ["resizeBigger"],
        title: i18n.global.t('reviews.incSize'),
        icon: ResizeIcon
    },
    {
        action: ["moveUp"],
        title: i18n.global.t('reviews.elUp'),
        icon: MoveUpIcon
    },
    {
        action: ["moveDown"],
        title: i18n.global.t('reviews.elDown'),
        icon: MoveDownIcon
    },
    {
        action: ["deselect"],
        title: i18n.global.t('other.deselect'),
        icon: RemoveIcon
    }
]

var actionsFun
export const shortcutListen = (toolbar, actions) => {
    if (SETTINGS.value.shortcutProfile == -1) {
        if (isFirefox)
            SETTINGS.value.shortcutProfile = 1 // ctrl shortcuts bcus of firefox bug
        else
            SETTINGS.value.shortcutProfile = 0 // chromium ctrl shortcuts
    }

    window.addEventListener("keydown", blockNativeShortcuts)
    window.addEventListener("keyup", checkForShortcut)

    actionsFun = actions
    getShortcuts(toolbar)
}

export const shortcutUnload = () => {
    window.removeEventListener("keydown", blockNativeShortcuts)
    window.removeEventListener("keyup", checkForShortcut)
}

// forms a key string from action
export const getShortcut = (action?: any[]) => {
    let text = (action ?? Array()).join(".")
    let profile = defaultShortcuts[SETTINGS.value.shortcutProfile]
    let shortcut: [Key, string];
    if (!profile) // load custom
        shortcut = customShortcuts[text] ?? defaultShortcuts[0][text]
    else // pick from profile
        shortcut = profile[text]
    return shortcut
}

var customShortcuts = {}
export var keyShortcuts: [Key, any[]][] = []
const BASE = import.meta.env.BASE_URL
const getShortcuts = (toolbar) => {
    keyShortcuts = []
    if (hasLocalStorage()) {
        customShortcuts = JSON.parse(localStorage.getItem("customShortcuts")!) ?? {}
    }

    writerShortcuts.forEach(button => 
        keyShortcuts.push([getShortcut(button.action), button.action, button.title, button.icon]))

    for (const key in toolbar) {
        for (const key2 in toolbar[key]) {
            for (const button of toolbar[key][key2]) {
                let icon = `${BASE}/formatting/${typeof button?.icon == 'object' ? button.icon[0] : button.icon}.svg`
                if (typeof button.action?.[1] == 'object') {
                    for (let i = 0; i < button.action[1].length; i++) {
                        let icon = `${BASE}/formatting/${button.icon[i]}.svg`
                        let act = [button.action[0], button.action[1][i]]
                        keyShortcuts.push([getShortcut(act), act, button?.dropdownText?.[i], icon])
                    }
                }
                else {
                    let shortcut = getShortcut(button.action)
                    if (shortcut)
                        keyShortcuts.push([shortcut, button.action, button?.title || button?.tooltip || button?.titleSwitchable?.[0], icon])
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

// we need to disable the little help tooltips in firefox bcus key events don't fire when modifier keys only are pressed
export const isFirefox = ref(navigator.userAgent.includes("Firefox"))

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

    // do not check for shortcuts without modifiers when an element is selected
    let comboChecking = document.activeElement == document.body
                        ? true : (comboHeld.value != Key.None || e.key == 'Escape')

	let f: string[] | boolean;
	if (comboChecking && (f = isValidShortcut(currCombo, e.key.toUpperCase(), e.code)))
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