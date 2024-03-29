export default function parseText(textToParse: string): string {
  let chars = ["\\*\\*", "\\/\\/", "__", "--"];
  let tags = ["b", "i", "u", "strike"];
  let i = 0;
  chars.forEach((c) => {
    let regex = new RegExp(`${c}(.*?)${c}`, "g");
    textToParse = textToParse.replace(regex, `<${tags[i]}>$1</${tags[i]}>`);
    i++;
  });
  textToParse = textToParse.replace(
    /#(.*?)\n/g,
    `<h1 class="mt-3 text-xl">$1</h1>`
  );
  textToParse = textToParse.replace(
    /\*(.*?)(\n|$)/g,
    `<li class="mx-4">$1</li>`
  );

  let urlRegex =
    /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*))/g;
  textToParse = textToParse.replace(
    urlRegex,
    `<a class='text-blue-300 underline' href="$1">$1</a>`
  );

  return textToParse;
}
