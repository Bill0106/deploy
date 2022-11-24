const https = require('follow-redirects').https;

module.exports = method => {
  const { VERSION_ID, PAT, GITHUB_RUN_ID } = process.env
  const options = {
    'method': 'POST',
    'hostname': 'api.zhuhaolin.com',
    'path': `/v1/github/workflow/_${method}`,
    'headers': {
      'pat': PAT,
      'Content-Type': 'application/json'
    },
    'maxRedirects': 20
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {    
      res.on('end', () => {
        resolve()
      });
    
      res.on('error', error => {
        reject(error)
      });
    });
    
    req.write(JSON.stringify({ id: VERSION_ID, runId: GITHUB_RUN_ID }));
    
    req.end();
  })
}