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
  var path = message.url.split('/').filter(function(ele) { return ele.indexOf('tabs-software') >= 0; });

  if (path.length === 1) {
    return ['https://', path.pop()].join('');
  }
}

exports.handler = function (event, context, callback) {
  var message = JSON.parse(event.Records[0].Sns.Message);
  var ValidEntities = [
    'PropertyAvailability',
    'PriceFixed',
    'PriceOverride',
    'PriceMinimum',
    'PropertyBrandingYearPriceBand',
    'PartySizePrice'
  ];

  if (ValidEntities.indexOf(message.entity) >= 0) {
    var p = getPropertyIdFromUrl(message.url);

    if (p) {
      console.log(p.id);

      var r = getApiRootFromResponse(message);
      console.log(r);

      if (!r) {
        return;
      }

      platoJsClient.client.getInstance().setInstance({
        apiRoot: r,
        apiPrefix: '/v2',
        token: process.env.TABS2_TOKEN
      });

      var req = {
        path: '/property/' + p.id + '/availablebreaks',
        method: 'put'
      };
      console.log(req);

      return platoJsClient.client.getInstance().put(req).then(function(response) {
        console.log(response);
      }.bind(this), function(err) {
        console.log(err);
      });
    } else {
      return;
    }
  }
};