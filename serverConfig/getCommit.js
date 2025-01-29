const { readFile, writeFile } = require("fs")
const commit = require("git-last-commit")

commit.getLastCommit((_e, commit) => {
    readFile(".env.production", {encoding: 'utf-8'}, (_, data) => {
        writeFile(".env.production", data.replace(/VITE_LASTCOMMIT=.*/, `VITE_LASTCOMMIT=${commit.shortHash}`), {encoding: 'utf-8'}, (res) => null)
        }
    )
})