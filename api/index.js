const app = require('../server/server');

module.exports = (req, res) => {
  // Restore real URL if Vercel rewrote it to api/index.js
  const matchedPath = req.headers['x-matched-path'] || req.headers['x-forwarded-url'];
  const queryUrl = req.query && (req.query.__url || req.query.match);

  if (matchedPath && !matchedPath.includes('index.js')) {
    req.url = matchedPath;
  } else if (queryUrl) {
    req.url = queryUrl.startsWith('/') ? queryUrl : '/' + queryUrl;
  } else if (req.url && req.url.startsWith('/api/index.js')) {
    req.url = req.url.replace('/api/index.js', '') || '/';
  }

  return app(req, res);
};
