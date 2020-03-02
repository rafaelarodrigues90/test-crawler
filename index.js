import Main from './src/index'

Main()
  .then((filepath) => console.info('done saved in [%s]', filepath))
  .catch(console.error)
