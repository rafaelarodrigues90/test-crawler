import groupBy from 'lodash/groupBy'
import mapValues from 'lodash/mapValues'
import isPlainObject from 'lodash/isPlainObject'
import isArray from 'lodash/isArray'

const parseResultAsList = (mapResult) => {
  return mapResult.reduce((result, valuesByPage) => {
    const players = valuesByPage.stats.content.map(player => ({
      rank: player.rank,
      name: player.owner.name.display,
      nationality: player.owner.nationalTeam.country,
      goals: player.value
    }))

    return [
      ...result,
      ...players
    ]
  }, [])
}

const parseResultAsNationalityList = (mapResult) => {
  const resultParsed = parseResultAsList(mapResult)
  return mapValues(groupBy(resultParsed, 'nationality'), value => value.length)
}

const PARSE_RESULT_OPTIONS = {
  list: parseResultAsList,
  nationality: parseResultAsNationalityList
}

const parseValuesByType = (type) => PARSE_RESULT_OPTIONS[type]

const parseDataAsXLS = (data) => {
  const convertAsStr = (arr) => arr
    .reduce((result, value) => result += value.join(',').concat('\n'), '')

  if (isPlainObject(data)) {
    return convertAsStr([
      Object.keys(data),
      [...Object.values(data)]
    ])
  }

  if (isArray(data)) {
    return convertAsStr([
      [Object.keys(data[0])],
      ...data.map(value => Object.values(value))
    ])
  }
}

const parseDataByExt = (data, ext) => {
  if (ext === 'xls') {
    return parseDataAsXLS(data)
  }
  return JSON.stringify(data, null, 2)
}

export default (type, ext) => (data) => (
  parseDataByExt(
    parseValuesByType(type)(data),
    ext
  )
)
