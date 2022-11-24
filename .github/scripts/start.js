const axios = require('axios')

module.exports = method => {
  const { VERSION_ID, PAT, GITHUB_RUN_ID } = process.env
  const config = {
    method: 'post',
    url: `https://api.zhuhaolin.com/v1/github/workflow/_${method}`,
    headers: {
      'pat': PAT,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({ id: VERSION_ID, runId: GITHUB_RUN_ID })
  };

  return axios(config)
}