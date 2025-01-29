const { readFile, copyFile, unlink, writeFile } = require("fs");
const { parse } = require("node-html-parser")

readFile('dist/index.html', (e, res) => {
    let dom = parse(res.toString())
    let style = dom.querySelector("link[rel='stylesheet']").toString()
    let script = dom.querySelector("script").toString()

    copyFile('serverConfig/index.php', 'dist/index.php', (res) => null)
    readFile('dist/index.php', (e, data) => {
        let text = data.toString()
        writeFile("dist/index.php",
            text.replace("<!-- SCRIPT -->", script)
                .replace("<!-- STYLE -->", style), {encoding: 'utf-8'}, (res) => null)
    })
})

unlink('dist/index.html', (res) => null)