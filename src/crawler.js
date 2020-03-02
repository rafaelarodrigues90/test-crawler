import axios from 'axios'
import series from 'async/series'
import * as Joi from 'joi'

const getUrlByPage = (page) => (
  'https://footballapi.pulselive.com/football/stats/ranked/players/goals?'
    .concat([
      `page=${page}`,
      'pageSize=20',
      'comps=1',
      'compCodeForActivePlayer=EN_PR',
      'altIds=true'
    ].join('&'))
)

const isInvalidResponse = (response) => {
  const schema = Joi.object().keys({
    entity: Joi.string().required(),
    stats: Joi.object().keys({
      pageInfo: Joi.object().keys({
        page: Joi.number().required(),
        numPages: Joi.number().required(),
        pageSize: Joi.number().required(),
        numEntries: Joi.number().required()
      }).required(),
      content: Joi.array().items(Joi.object().keys({
        rank: Joi.number().required(),
        name: Joi.string().required(),
        value: Joi.number().required(),
        description: Joi.string().required(),
        additionalInfo: Joi.object().required(),
        owner: Joi.object().required()
      })).required()
    }).required()
  })
  return Joi.validate(response, schema).error
}

const requestByPage = async (page) => {
  console.debug('request for %s page', page)
  const url = getUrlByPage(page)
  const { data } = await axios.get(url, {
    /* eslint-disable */
    headers: {
      authority: 'footballapi.pulselive.com',
      accept: '*/*',
      origin: 'https://www.premierleague.com',
      referer: 'https://www.premierleague.com/stats/top/players/goals?se=-1&cl=-1&iso=-1&po=-1?se=-1',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'sec-fetch-site': 'cross-site',
      'sec-fetch-mode': 'cors',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6,fr;q=0.5,ru;q=0.4'
    }
    /* eslint-enable */
  })
  return data
}

const getResultMapByTasks = (Tasks) => new Promise((resolve, reject) => {
  series(Tasks, (err, result) => {
    if (err) {
      return reject(err)
    }
    return resolve(result)
  })
})

export default async () => {
  let page = 0
  const response = await requestByPage(page)
  const isInvalid = isInvalidResponse(response)
  
  if (isInvalid) {
    throw isInvalid
  }

  const Tasks = []
  page++
   
  for (;page <= response.stats.pageInfo.numPages; page++) {
    const request = requestByPage.bind(this, page)
    Tasks.push(async () => {
      const response = await request()
      const isInvalid = isInvalidResponse(response)
      
      if (isInvalid) {
        throw isInvalid
      }

      return response
    })
  }

  const mapResult = await getResultMapByTasks(Tasks)
  return [
    response,
    ...mapResult
  ]
}
