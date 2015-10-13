(function (exports) {
  exports.balihoo = exports.balihoo || {};

  var version = "v1.0";
  var defaultUrl = "https://bac.balihoo-cloud.com";

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
   * Turns a list of keys into an URL query parameter string.
   * @param keys List of location identifiers (key).
   * @returns {string} A locations query parameter string.
   */
  function locationKeysArgToParam(keys) {
    if (keys) {
      var keysArray = [];
      keysArray.push(keys);
      return 'locations=' + keysArray.join(',');
    }
  }

  /**
   * Format a date into API compatible format.
   * @param aDate The date to format.
   * @returns {string} Formatted date.
   */
  function formatDate(aDate) {
    var y = aDate.getFullYear(),
        m = aDate.getMonth()+1,
        d = aDate.getDate();
    return [
      y,
      m < 10 ? '0' + m : m,
      d < 10 ? '0' + d : d
    ].join('-');
  }

  /**
   * Turns a date into an URL query parameter string.
   * @param param Name of parameter.
   * @param aDate Date to format as parameter value.
   * @returns {string} A date query parameter string.
   */
  function dateToParam(param, aDate) {
    if (aDate && aDate instanceof Date)
      return param + '=' + formatDate(aDate);
  }

  /**
   * Turns options into an URL query string.
   * @param opts Options for API call.
   * @returns {string} URL query string.
   */
  function argsToParamString(opts) {
    opts = opts || {};

    var p1 = locationKeysArgToParam(opts.locations);
    var p2 = dateToParam('from', opts.from);
    var p3 = dateToParam('to', opts.to);

    var params = [];
    if (p1) params.push(p1);
    if (p2) params.push(p2);
    if (p3) params.push(p3);

    if (params.length > 0) {
      return '?' + params.join('&');
    } else {
      return '';
    }
  }

  /**
   * Gets all the campaigns for your location
   */
  LocationApi.prototype.getAllCampaigns = function (opts) {
    return get(this.config, "campaigns" + argsToParamString(opts));
  };

  /**
   * Gets all tactics for the given campaign for your location
   */
  LocationApi.prototype.getAllTactics = function (campaignId, opts) {
    if (typeof campaignId == 'undefined') {
      throw new Error("getAllTactics requires a campaign id");
    }

    return get(this.config, "campaign/"+campaignId+"/tactics" + argsToParamString(opts));
  };

  /**
   * Gets all campaigns with expanded tactics for your location
   */
  LocationApi.prototype.getAllCampaignsAndTactics = function (opts) {
    return get(this.config, "campaignswithtactics" + argsToParamString(opts));
  };

  /**
   * Gets all metrics for a specific tactic
   */
  LocationApi.prototype.getMetricsForTactic = function (tacticId, opts) {
    if (typeof tacticId == 'undefined') {
      throw new Error("getMetricsForTactic requires a tactic id");
    }

    return get(this.config, "tactic/"+tacticId+"/metrics" + argsToParamString(opts));
  };

  /**
   * Gets the local website information for the your location
   */
  LocationApi.prototype.getWebsiteMetrics = function (opts) {
    return get(this.config, "websitemetrics" + argsToParamString(opts));
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
