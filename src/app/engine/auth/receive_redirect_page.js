// Login
/* global _p */
// eslint-disable-next-line no-unused-vars
function init(request) {
  try {
    personium.validateRequestMethod(['GET'], request);

    var query = personium.parseQuery(request);

    // verify query information
    personium.setAllowedKeys([
      'cellUrl',
      'code',
      'state',
      'last_authenticated',
      'failed_count',
      'box_not_installed',
    ]);
    personium.setRequiredKeys(['cellUrl', 'code', 'state']);
    personium.validateKeys(query);

    // cross-check cookie & state
    verifyState(request);

    const state = personium.parseQuery(request).state;
    const code = personium.parseQuery(request).code;

    return returnPage(state, code);
  } catch (e) {
    return personium.createErrorResponse(e);
  }
}

function returnPage(state, code) {
  const tempHeaders = { 'Content-Type': 'text/html' };

  return {
    status: 200,
    headers: tempHeaders,
    body: [
      [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '<head>',
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500">',
        '</link>',
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">',
        '<title>Personium App</title>',
        '</head>',
        '<body style="margin: 0px" >',
        '<noscript>You need to enable JavaScript to run this app.</noscript>',
        '<div id="root">',
        '<h1>Authentication is done</h1>',
        '<div>dummy text dummy text dummy text</div>',
        '</div>',
        '<script type="text/javascript">',
        '  window.onload = function(){',
        '    var targetWindow = window.opener || window.parent || null;',
        '    if (targetWindow !== null) {',
        '      targetWindow.postMessage("", window.origin);',
        '    }',
        '  }',
        '  window.getCodeAndState = function (){',
        '    return {',
        '        state: "' + state + '",',
        '        code: "' + code + '",',
        '    }',
        '  }',
        '</script>',
        '</body>',
        '</html>',
      ].join('\n'),
    ],
  };
}

function verifyState(request) {
  var cookie = getStateFromCookie(request);
  var state = personium.parseQuery(request).state;
  var shaObj = new jsSHA(state, 'ASCII');
  var hash = shaObj.getHash('SHA-512', 'HEX');

  if (cookie != hash) {
    // raise exception
    // Personium exception
    var err = [
      'io.personium.client.DaoException: 401,',
      JSON.stringify({
        code: 'PR401-AU-0010',
        message: {
          lang: 'en',
          value: 'Authentication failed.',
        },
      }),
    ].join('');
    throw new _p.PersoniumException(err);
  }
}

function getStateFromCookie(request) {
  var cookie = request.headers['cookie'];
  var state;
  if (cookie) {
    var list = cookie.split(';');
    state = _.find(list, function(item) {
      var tempStr = item.trim();
      return tempStr.startsWith('personium=');
    });
  }
  if (state) {
    return state.split('=')[1];
  } else {
    return '';
  }
}

var personium = require('personium').personium;
var jsSHA = require('sha_dev2').jsSHA;
var moment = require('moment').moment;
var _ = require('underscore')._;
