import { marked } from "marked";
import striptags from "striptags";

export default function parseText(textToParse: string): string {
  if (!textToParse) return ""

  return striptags(marked.parse(textToParse).toString(), [
    "h1", "h2", "h3", "ul", "li", "br", "strong","del", "table", "th", "td", "thead", "hr", "strike", "em", "ol", "a", "blockquote", "img", "code"
  ])
}
