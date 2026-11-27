const app = require('../server/server');

module.exports = (req, res) => {
  try {
    const urlObj = new URL(req.url, 'http://localhost');
    const target = urlObj.searchParams.get('__url');
    if (target) {
      urlObj.searchParams.delete('__url');
      const remaining = urlObj.searchParams.toString();
      req.url = '/api/' + target.replace(/^\//, '') + (remaining ? '?' + remaining : '');
    } else if (req.headers['x-matched-path'] && !req.headers['x-matched-path'].includes('index.js')) {
      req.url = req.headers['x-matched-path'];
    }
  } catch (e) {
    console.error('URL parse error in serverless wrapper:', e);
  }

  return app(req, res);
};
