const fs = require('fs')
const readline = require('readline');
const { Parser } = require('json2csv');

const filePath = 'Starred.mbox'

let lastLine;
let numLine = 0

const emails = []
let currentEmail = {}
let content = {}
let metaData = {}

let isContent = false
let isNewEmail = false

const newEmailRegex = /From (.+)/

const checkIsNewEmail = (line) => {
    // console.log(line)
    if ('' == lastLine && newEmailRegex.test(line)) {
        // console.log('='.repeat(100))
        isNewEmail = true
    }
}

const checkIsContent = (line) => {
    if (lastLine == '' && line != "")
        isContent = true
}

const checkStuff = (line) => {
    checkIsNewEmail(line)
    checkIsContent(line)
}

const boot = () => {
    const readInterface = readline.createInterface({
        input: fs.createReadStream(filePath)
    });

    readInterface.on('line', function (line) {
        // if (numLine > 30) return

        checkStuff(line)

        if (isNewEmail) {
            // metaData.header = line
            currentEmail.metaData = metaData
            // currentEmail.content = content
            currentEmail = content
            emails.push(currentEmail)

            currentEmail = {}
            content = {}
            metaData = {}

            isContent = false
            isNewEmail = false
        }

        if (!isNewEmail) {
            const keyRegex = /(^\S.+?):/
            const key = line.match(keyRegex)
            const valueRegex = /:(.+)/
            const value = line.match(valueRegex)

            if (key != null && value != null) {
                if (isContent) {
                    if(key[1] == 'Telefone'){
                        let temp = value[1].trim()
                        temp = `${temp[0]}${temp[1]} ` 
                        content[key[1]] = temp
                    }
                    content[key[1]] = value[1].trim()
                } else {
                    // metaData[key[1]] = value[1].trim()
                }
            }
        }

        lastLine = line
        numLine++
    });

    readInterface.on('close', function (line) {
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(emails);
        fs.writeFileSync('build.csv', csv);
        
        fs.writeFileSync('build.json', JSON.stringify(emails));
        // console.log(emails)
    })

}

boot()
