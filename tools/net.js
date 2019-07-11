const { URL } = require('url');
const { httpsOverHttp } = require('tunnel');
const { globalAgent } = require('https');
const config = require('../config');

function getAgent(proxy_url = process.env.HTTPS_PROXY) {
  if (!proxy_url) {
    return globalAgent;
  }
  try {
    const { hostname, port, username, password } = new URL(proxy_url);
    const auth = username && password && `${username}:${password}`;
    return httpsOverHttp({ proxy: { host: hostname, port, proxyAuth: auth } });
  } catch (e) {
    console.log(e.message);
    return globalAgent;
  }
}

module.exports = {
  agent: getAgent(config.network.https_proxy),
}