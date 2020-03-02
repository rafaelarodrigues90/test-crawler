import * as Joi from 'joi'
import program from 'commander'
import Crawler from './crawler'
import Parser from './parser'
import SaveFile from './save-file'

export default  async () => {
  program
    .option('-o, --output <output>', 'the output format [txt, xls]', 'txt')
    .option('-t, --type <type>', 'type of result [list, nationality]', 'list')
    .option('-d, --debug [debug]', 'debug app', false)

  program.parse(process.argv)
  const { type, output, debug } = program

  const schema = Joi.object().keys({
    type: Joi.string()
      .valid(['list', 'nationality'])
      .required(),

    output: Joi.string()
      .valid(['txt', 'xls'])
      .required()
  })

  const isValid = Joi.validate({ type, output }, schema)

  if (isValid.error) {
    throw isValid.error
  }

  const parse = await Parser(type, output)

  if (!debug) {
    console.debug = () => {}
  }

  const result = await Crawler()
  const resultParsed = parse(result)
  return await SaveFile(resultParsed, type, output)
}
