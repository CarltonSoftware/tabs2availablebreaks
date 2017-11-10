var platoJsClient = require('plato-js-client');

function getPropertyIdFromUrl(url) {
  var parts = url.split('/property/');
  if (parts.length === 2) {
    var moreparts = parts.pop().split('/');
    return new platoJsClient.common.Property(
      parseInt(moreparts[0])
    );
  }
}

function getApiRootFromResponse(message) {
  return ['https://', message.url.split('/')[2]].join('');
}

exports.handler = function (event, context, callback) {
  var message = JSON.parse(event.Records[0].Sns.Message);
  var ValidEntities = [
    'PropertyAvailability',
    'PriceFixed',
    'PriceOverride',
    'PartySizePrice'
  ];

  if (ValidEntities.indexOf(message.entity) >= 0) {
    var p = getPropertyIdFromUrl(message.url);

    if (p) {

      platoJsClient.client.getInstance().setInstance({
        apiRoot: getApiRootFromResponse(message),
        apiPrefix: '/v2',
        token: process.env.TABS2_TOKEN
      });

      var req = {
        path: '/property/' + p.id + '/availablebreaks',
        method: 'put'
      };

      return platoJsClient.client.getInstance().put(req).then(function(response) {
        console.log(response);
      }.bind(this));
    } else {
      return;
    }
  }
};