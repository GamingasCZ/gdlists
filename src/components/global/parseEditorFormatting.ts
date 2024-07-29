import { marked } from "marked";
import striptags from "striptags";

export default function parseText(textToParse: string, limited?: boolean, no?: boolean): string {
  if (!textToParse) return ""
  if (no) return textToParse // NOooOOooOoo


  let keepTags
  if (limited) // Removes heading and image tags
    keepTags = ["ul", "li", "br", "strong","del", "table", "th", "td", "thead", "hr", "strike", "em", "ol", "a", "blockquote", "code", "input"]
  else
    keepTags = ["h1", "h2", "h3", "ul", "li", "br", "strong","del", "table", "th", "td", "thead", "hr", "strike", "em", "ol", "a", "blockquote", "img", "code", "input", "p"]

  return striptags(marked.parse(textToParse, {gfm: true}).toString(), keepTags)
}

export function addFormatting(type: number, textbox: HTMLTextAreaElement) {
  let chars = ["**", "_", "~~"][type];
  let selStart = textbox.selectionStart;
  switch (type) {
    case 0:
    case 1:
    case 2:
      if (selStart == textbox.selectionEnd) {
        // No text selected
        textbox.value =
          textbox.value.slice(0, selStart) +
          `${chars} ${chars}` +
          textbox.value.slice(selStart);
        textbox.focus();
        textbox.selectionStart = selStart + chars.length;
        textbox.selectionEnd = selStart + chars.length + 1;
      } else {
        let selectedText = textbox.value.slice(selStart, textbox.selectionEnd);
        textbox.value =
          textbox.value.slice(0, selStart) +
          `${chars}${selectedText}${chars}` +
          textbox.value.slice(textbox.selectionEnd);
        textbox.focus();
        textbox.selectionStart = textbox.selectionEnd + 2;
        textbox.selectionEnd = textbox.selectionEnd + 2;
      }

      break;
    case 4:
    case 5:
    case 7:
    case 8:
    case 9:
      let format = ["* ", "> ", null, "# ", "## ", "### "][type-4];
      let startLF = [undefined, "\n"].includes(textbox.value[selStart - 1])
        ? ""
        : "\n";
      textbox.value =
        textbox.value.slice(0, selStart) +
        `${startLF}${format}` +
        textbox.value.slice(selStart);
      textbox.focus();
      textbox.selectionStart = selStart + format?.length+1;
      textbox.selectionEnd = selStart + format?.length+1;
      break;
    case 11:
    case 12:
      let helpText = type == 12 ? 'alt' : 'text'
      let selectedText = textbox.value.slice(selStart, textbox.selectionEnd) || helpText
      let isImage = type == 12 ? '!' : ''
      if (textbox.value.slice(textbox.selectionStart, textbox.selectionStart + 4).startsWith("http")) {
        textbox.value =
          textbox.value.slice(0, selStart) +
          `${isImage}[${helpText}](${selectedText})` +
          textbox.value.slice(textbox.selectionEnd);
          
          textbox.focus();
          textbox.selectionStart = selStart + isImage.length + 1;
          textbox.selectionEnd = selStart + helpText.length + isImage.length + 1;
        }
      else {  
        textbox.value =
          textbox.value.slice(0, selStart) +
          `${isImage}[${selectedText || 'text'}](link)` +
          textbox.value.slice(textbox.selectionEnd);
          
          textbox.focus();
          textbox.selectionStart = selStart + selectedText.length + isImage.length + 3;
          textbox.selectionEnd = selStart + selectedText.length + isImage.length + 7;
      }
      break;

    default:
      break;
  }
  return textbox.value
}

export function addCEFormatting(type: number, textbox: HTMLTextAreaElement) {
  let chars = ["**", "_", "~~"][type];
  let selection = window.getSelection()
  let range = selection?.getRangeAt(0)
  let selStart = range?.startOffset;
  let selEnd = range?.endOffset;
  let node = selection?.focusNode
  let selectedTex = selection?.toString();
  const selRange = (start: number, end: number) => {
    let range = new Range()
    console.log(node)
    range.setStart(node, Math.min(start, textbox?.textContent?.length))
    range.setEnd(node, Math.min(end, textbox?.textContent?.length))
    selection?.removeAllRanges()
    selection?.addRange(range)
  }

  const modifySelection = (newText: string, keepContent = false) => {
    const style = document.createTextNode(newText)
    if (!keepContent) range?.deleteContents()
    range?.insertNode(style)

    range?.setStartAfter(style)
    range?.setEndAfter(style)
    selection?.removeAllRanges()
    selection?.addRange(range)
  }

  switch (type) {
    case 0:
    case 1:
    case 2:
      if (selStart == selEnd)
        modifySelection(`${chars} ${chars}`) // No text selected
      else
        modifySelection(`${chars}${selectedTex}${chars}`)
      break;
    case 4:
    case 5:
    case 7:
    case 8:
    case 9:
      let format = ["* ", "> ", null, "# ", "## ", "### "][type-4];
      let startLF = [undefined, "\n"].includes(textbox.innerText[selStart - 1])
        ? ""
        : "\n";

      modifySelection(`${startLF}${format}`, true)
      break;
    case 11:
    case 12:
      let helpText = type == 12 ? 'alt' : 'text'
      let selectedText = selectedTex || helpText
      let isImage = type == 12 ? '!' : ''
      if (selectedTex.startsWith("http"))
        modifySelection(`${isImage}[${helpText}](${selectedText})`)
      else
        modifySelection(`${isImage}[${selectedText || 'text'}](link)`)
      break;

    default:
      break;
  }
  return textbox.innerText
}

export const autoLink = (e: Event) => {
  let text = e.clipboardData.getData('Text')
  if (text.startsWith("http")) {
    if (text.match(/^.*(.jpg|.png|.gif|.webp|.jpeg)/)) return 12
    else return 11
  }
}