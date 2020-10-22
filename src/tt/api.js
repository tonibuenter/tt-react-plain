import { resolveFunction, toList } from './utils';

let serviceUri = 'api/';

export function setServiceUri(uri) {
  serviceUri = uri;
}

let requestMode = 'json';

/**
 *
 * @param mode 'url-encoded', 'json'
 */
export function setRequestMode(mode) {
  requestMode = mode;
}

function processSingleService(action, callbackIn) {
  if (typeof action.preProcessService === 'function') {
    action.preProcessService(action);
  }
  let callback1 = callbackInterceptor(callbackIn);
  let callback = (data) => {
    if (typeof action.postProcessService === 'function') {
      action.postProcessService({ ...action, data });
    }
    callback1(data);
  };
  if (typeof action.service === 'function') {
    let data = action.service(action.parameters);
    callback(data);
    return;
  }

  if (action.serviceId) {
    fetch(
      serviceUri + action.serviceId,
      requestMode === 'url-encoded' ? urlEncodedRequest(action.parameters) : jsonRequest(action.parameters)
    )
      .then(async (response) => {
        if (response.ok === false) {
          callback({
            exception: response.status + ' : ' + response.statusText + ' for serviceId: ' + action.serviceId
          });
        } else {
          try {
            let data = await response.json();
            if (action.output === 'list') {
              callback(toList(data));
            } else if (action.output === 'first') {
              callback(toList(data)[0]);
            } else {
              callback(data);
            }
          } catch (e) {
            callback({ exception: 'Could not parse result for serviceId: ' + action.serviceId });
          }
        }
      })
      .catch((error) => {
        callback({ exception: error.message + ', for serviceId: ' + action.serviceId });
      });
    return;
  }
  callback();
}

export function processService(action, callback) {
  if (Array.isArray(action)) {
    action = { serviceId: 'processRequestList', parameters: { requestArray: JSON.stringify(action) } };
  }
  processSingleService(action, callback);
}

function callbackInterceptor(callback) {
  let fun = resolveFunction('callbackInterceptor');
  if (typeof fun === 'function') {
    return (data) => fun(callback, data);
  }
  return callback;
}

function jsonRequest(parameters) {
  return {
    method: 'POST',
    headers: {
      redirect: 'follow',
      cache: 'no-cache',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(parameters || {})
  };
}

/* URL ENCODED */

function urlEncodedRequest(parameters) {
  var formBody = [];
  for (var property in parameters) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(parameters[property]);
    formBody.push(encodedKey + '=' + encodedValue);
  }
  formBody = formBody.join('&');

  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: formBody
  };
}
