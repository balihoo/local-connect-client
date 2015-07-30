(function (exports) {
  exports.balihoo = exports.balihoo || {};

  var version = "v1.0";
  var defaultUrl = "https://{{baseUrl}}";   // this is replaced at build time

  /**
   * constructor for a LocationApi object
   * @param clientId  the client id received from the genClientAPIKey call
   * @param clientApiKey the client apiKey received from the genClientAPIKey call
   * @param config optional configuration options to provide overrides to the defaults (typically the defaultUrl)
   */
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

    this.lastEventId = null;  // we track the last access to blip. Used with the update functionality
  };

  /**
   * convenience wrapper for makeCall (private)
   * (private, hidden in anonymous function scope)
   * @param url
   */
  function get(config, url) {
    return makeCall("GET", config, url)
  }

  /**
   * convenience wrapper for makeCall
   * (private, hidden in anonymous function scope)
   * @param url
   * @param data
   */
  function post(config, url, data) {
    return makeCall("POST", config, url, data)
  }

  /**
   * convenience wrapper for makeCall
   * (private, hidden in anonymous function scope)
   * @param url
   * @param data
   */
  function put(config, url, data) {
    return makeCall("PUT", config, url, data)
  }


  /**
   * return a jquery promise to a Local Partner connect endpoint
   * with the correct method and url
   * (private, hidden in anonymous function scope)
   * @param config
   * @param method
   * @param url
   * @param data
   * @returns {*}
   */
  function makeCall(method, config, url, data) {

    url = config.baseUrl + "/localdata/" + version + '/' + url;

    var ajaxOptions = {
      method: method,
      dataType: "json",
      headers: {
        "X-ClientId": config.clientId,
        "X-ClientApiKey": config.clientApiKey
      },
      url: url
    };

    if (data) {
      ajaxOptions.contentType = "text/json";
      ajaxOptions.data = JSON.stringify(data);
    }


    return $.ajax(ajaxOptions);
  }


  /**
   * Gets all the campaigns for your location
   */
  LocationApi.prototype.getAllCampaigns = function () {
    return get(this.config, "campaigns");
  };

  /**
   * Gets all tactics for the given campaign for your location
   */
  LocationApi.prototype.getAllTactics = function (campaignId) {
    if (typeof campaignId == 'undefined') {
      throw new Error("getAllTactics requires a campaign id");
    }

    return get(this.config, "campaign/"+campaignId+"/tactics");
  };

  /**
   * Gets all campaigns with expanded tactics for your location
   */
  LocationApi.prototype.getAllCampaignsAndTactics = function () {
    return get(this.config, "campaignswithtactics");
  };

  /**
   * Gets all metrics for a specific tactic
   */
  LocationApi.prototype.getMetricsForTactic = function (tacticId) {
    if (typeof tacticId == 'undefined') {
      throw new Error("getMetricsForTactic requires a tactic id");
    }

    return get(this.config, "tactic/"+tacticId+"/metrics");
  };

  /**
   * Gets the local website information for the your location
   */
  LocationApi.prototype.getWebsiteMetrics = function () {
    return get(this.config, "websitemetrics");
  };


  /***************************************
   *
   * Profile Tab Endpoints
   *
   ***************************************/

  /**
   * returns a json object that contains the code
   * for the current brands profile tabs form
   * The current brand is determined from the
   * clientId sent in the request header
   */
  LocationApi.prototype.getProfileForm = function() {
    return get(this.config, "profile/form");
  };

  /**
   * returns the current profile information from
   * blip for the current location. Location is
   * extracted from the clientId sent in the
   * request header
   */
  LocationApi.prototype.getProfileData = function() {
    var self = this;  // for the closure below
    return get(this.config, "profile/data")
      .then(function(profile) {
        self.lastEventId = profile.lastEventId;  // extract the eventId from the json data
        return profile.document;  // return the actual document object
      });
  };

  /**
   * updates the profile information for the given
   * brand with the given profile data for the
   * current location. The location is
   * extracted from the clientId sent in the
   * request header
   */
  LocationApi.prototype.updateProfileData = function(profileData) {
    if (typeof profileData == 'undefined') {
      throw new Error("updateProfileData requires a profile data object");
    }

    if (this.lastEventId == null) {
      throw new Error("getProfileData must be run before this call to obtain and lastEventId");
    }

    return put(this.config, "profile/data", {profileData: profileData, lastEventId: this.lastEventId});
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
