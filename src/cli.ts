import './commander/save'
import './commander/load'
import * as fs from 'fs-extra'
import * as path from 'path'
import program from 'commander'

const { version } = fs.readJSONSync(path.join(__dirname, '../package.json'))
program.version(version, '-v, --version')

let params = process.argv
!params.slice(2).length && program.outputHelp()
program.parse(params)
