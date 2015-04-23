(function (exports) {
  exports.balihoo = exports.balihoo || {};

  var version = "v1.0";
  var defaultUrl = "https://bac.balihoo-cloud.com";

  var LocationApi = function (clientId, clientApiKey, config) {
    config = config || {};

    if (typeof clientId == 'undefined' || clientId == "") {
      throw new Error("localConnection requires a client id");
    }
    if (typeof clientApiKey == 'undefined' || clientApiKey == "") {
      throw new Error("localConnection requires a client api key");
    }

    var baseApiConfig =
    {
      clientId: clientId,
      clientApiKey: clientApiKey,
      baseUrl: defaultUrl
    };

    //baseApiConfig settings can be overridden by given config object
    this.config = ($.extend(baseApiConfig, config));
  };

  /**
   * Convenience method for location api calls
   * takes arbitrary number of parameters after the configuration object and builds the rest url
   * @returns get promise to target url
   */
  function getJSONP(config) {
    var url = config.baseUrl + "/localdata/" + version;

    //REST url builder
    if (arguments && arguments.length > 1) {
      for (var i = 1; i < arguments.length; i++)
        url += "/" + arguments[i]
    }

    return $.ajax({
      dataType: "jsonp",
      url: url,
      data: {
        "clientId": config.clientId,
        "clientApiKey": config.clientApiKey
      }
    });
  }

  /**
   * Gets all the campaigns for your location
   */
  LocationApi.prototype.getAllCampaigns = function () {
    return getJSONP(this.config, "campaigns");
  };

  /**
   * Gets all tactics for the given campaign for your location
   */
  LocationApi.prototype.getAllTactics = function (campaignId) {
    if (typeof campaignId == 'undefined') {
      throw new Error("getAllTactics requires a campaign id");
    }

    return getJSONP(this.config, "campaign", campaignId, "tactics");
  };

  /**
   * Gets all campaigns with expanded tactics for your location
   */
  LocationApi.prototype.getAllCampaignsAndTactics = function () {
    return getJSONP(this.config, "campaignswithtactics");
  };

  /**
   * Gets all metrics for a specific tactic
   */
  LocationApi.prototype.getMetricsForTactic = function (tacticId) {
    if (typeof tacticId == 'undefined') {
      throw new Error("getMetricsForTactic requires a tactic id");
    }

    return getJSONP(this.config, "tactic", tacticId, "metrics");
  };

  /**
   * Gets the local website information for the your location
   */
  LocationApi.prototype.getWebsiteMetrics = function () {
    return getJSONP(this.config, "websitemetrics");
  };

  /**
   * Configuration options
   *
   *   baseUrl
   *     default - "//bac.balihoo-cloud.com"
   *     The scheme,domain and port without a trailing slash that the requests should use
   */

  /**
   *
   * Creates a connection object that can call the following location api endpoints:
   *   getAllCampaigns()
   *   getAllTactics(campaignId)
   *   getAllCampaignsAndTactics()
   *   getMetricsForTactic(tacticId)
   *   getWebsiteMetrics()
   *
   * @param clientId - id created for specific brand
   * @param clientApiKey - associated key for client id
   * @param config - additional configuration options object
   * @constructor
   */
  exports.balihoo.LocalConnection = LocationApi

})(window);

/**
 *
 * Example usage
 *
 * var clientId = "myClientId"
 * var clientApiKey = "myApiKey"
 *
 * var connection = new balihoo.LocalConnection(clientId,clientApiKey)
 *
 * connection.getAllCampaigns().done(function (allCampaigns) {
 *   console.log(JSON.stringify(allCampaigns));
 * });
 *
 *
 */
