window = {}; // fake our top level window object
$ = {};  // fake top level jquery as it is a pain to test jquery headlessly just for two functions that don't use the browser anyway

require('../src/localDataAPI.js');


describe("localDataAPI", function(){

  var connection;

  var fixture = {
    baseUrl: "http://mybase",
    myUrl: "my/url",

    campaignId: Math.round(Math.random()*100),
    tacticId: Math.round(Math.random()*100),

    clientId: "myClientId",
    clientApiKey: "myClientApiKey",

    customHeaders: function() {
      return {
        "X-ClientId": fixture.clientId,
        "X-ClientApiKey": fixture.clientApiKey
      }
    },

    expectedDefaults: function() {
      return {
        clientId: this.clientId,
        clientApiKey: this.clientApiKey,
        baseUrl: "https://bac.balihoo-cloud.com"
      }
    },

    newDefaults: {
      clientId: "newClientId",
      clientApiKey: "newClientApiKey",
      baseUrl: "new base url"
    },

    profileObject: {
      anyData: "anyStuff here"
    },

    profileData: function() {
      return {
        document: this.profileObject,  // so we can see what object we get back
        lastEventId: this.lastEventId
      }
    },

    lastEventId: "any event",

    buildUrl: function(url) {  // utility function to save typing
      return "https://bac.balihoo-cloud.com/localdata/v1.0/" + url;
    },

    emptyPromise: {}
  };

  beforeEach(function() {
    $.extend = jasmine.createSpy('extend').and.callFake(function(sourceA, sourceB) { return sourceA});  // we simply mock jQUery's extend to return the original for now
    $.ajax = jasmine.createSpy('ajax').and.returnValue(fixture.emptyPromise);
    fixture.emptyPromise.then = jasmine.createSpy("then").and.callFake(function(func) {return func(fixture.profileData())});   // fake our promise response

    connection = new window.balihoo.LocalConnection(fixture.clientId, fixture.clientApiKey)
  });


  describe("initialization", function(){
    it("should throw error if no params provided", function(){
      expect(function() {   // jasmine has a weird way of catching exceptions, you need the anonymous function for it to work
        new window.balihoo.LocalConnection()
      }).toThrowError("localConnection requires a client id")
    });

    it("should throw error if clientApiKey not provided", function(){
      expect(function() {
        new window.balihoo.LocalConnection(fixture.clientId)
      }).toThrowError("localConnection requires a client api key")
    });

    it("should return object with expected defaults", function(){
      expect(connection.config).toEqual(fixture.expectedDefaults())
    });

    it("should expect lastEventId to be null", function(){
      expect(connection.lastEventId).toBeNull()
    });

    it("should call jquery's extend as expected if config options presented", function(){
      $.extend.calls.reset(); // reset our spy so we don't include the 'connection' call in the beforeEach
      var myConnection = new window.balihoo.LocalConnection(fixture.clientId, fixture.clientApiKey, fixture.newDefaults);

      expect($.extend).toHaveBeenCalledWith(fixture.expectedDefaults(), fixture.newDefaults)
    });

    it("should call jquery's extend with empty object if config options not presented", function(){
      $.extend.calls.reset(); // reset our spy so we don't include the 'connection' call in the beforeEach
      var myConnection = new window.balihoo.LocalConnection(fixture.clientId, fixture.clientApiKey);

      expect($.extend).toHaveBeenCalledWith(fixture.expectedDefaults(), {})
    });
  });

  describe("getAllCampaigns method should", function(){
    it("should call jquery ajax method with get expected parameters", function(){
      connection.getAllCampaigns();

      expect($.ajax).toHaveBeenCalledWith({
        method: "GET",
        dataType: "json",
        headers: fixture.customHeaders(),
        url: fixture.buildUrl("campaigns")
      })
    });
  });

  describe("getAllTactics method should", function(){
    it("should call jquery ajax method with get expected parameters", function(){
      connection.getAllTactics(fixture.campaignId);

      expect($.ajax).toHaveBeenCalledWith({
        method: "GET",
        dataType: "json",
        headers: fixture.customHeaders(),
        url: fixture.buildUrl("campaign/"+fixture.campaignId+"/tactics")
      })
    });

    it("should throw error if campaignId not provided", function(){
      expect(function() {
        connection.getAllTactics()
      }).toThrowError("getAllTactics requires a campaign id")
    });
  });

  describe("getAllCampaignsAndTactics", function(){
    it("should call jquery ajax method with get expected parameters", function(){
      connection.getAllCampaignsAndTactics();

      expect($.ajax).toHaveBeenCalledWith({
        method: "GET",
        dataType: "json",
        headers: fixture.customHeaders(),
        url: fixture.buildUrl("campaignswithtactics")
      })
    });
  });

  describe("getMetricsForTactic", function(){
    it("should call jquery ajax method with get expected parameters", function(){
      connection.getMetricsForTactic(fixture.tacticId);

      expect($.ajax).toHaveBeenCalledWith({
        method: "GET",
        dataType: "json",
        headers: fixture.customHeaders(),
        url: fixture.buildUrl("tactic/"+fixture.tacticId+"/metrics")
      })
    });

    it("should throw error if tacticId not provided", function(){
      expect(function() {
        connection.getMetricsForTactic()
      }).toThrowError("getMetricsForTactic requires a tactic id")
    });
  });

  describe("getWebsiteMetrics", function(){
    it("should call jquery ajax method with get expected parameters", function(){
      connection.getWebsiteMetrics();

      expect($.ajax).toHaveBeenCalledWith({
        method: "GET",
        dataType: "json",
        headers: fixture.customHeaders(),
        url: fixture.buildUrl("websitemetrics")
      })
    });
  });

  /**************************************************
   * Profile tab tests
   *
   **************************************************/
  describe("getProfileForm", function(){
    it("should call jquery ajax method with get expected parameters", function(){
      connection.getProfileForm();

      expect($.ajax).toHaveBeenCalledWith({
        method: "GET",
        dataType: "json",
        headers: fixture.customHeaders(),
        url: fixture.buildUrl("profile/form")
      })
    });
  });

  describe("getProfileData", function(){
    it("should call jquery ajax method with get expected parameters", function(){
      connection.getProfileData();

      expect($.ajax).toHaveBeenCalledWith({
        method: "GET",
        dataType: "json",
        headers: fixture.customHeaders(),
        url: fixture.buildUrl("profile/data")
      })
    });

    it("should set the lastEventId when resolved", function(){
      connection.getProfileData();
      expect(connection.lastEventId).toEqual(fixture.lastEventId)
    });

    it("should extract the document object from the returned data", function(){
      var result = connection.getProfileData();
      expect(result).toEqual(fixture.profileObject)
    });
  });

  describe("updateProfileData", function(){
    it("should call jquery ajax method with get expected parameters", function(){
      connection.lastEventId = fixture.lastEventId;
      connection.updateProfileData(fixture.profileData());

      expect($.ajax).toHaveBeenCalledWith({
        method: "PUT",
        dataType: "json",
        headers: fixture.customHeaders(),
        url: fixture.buildUrl("profile/data"),
        contentType: "text/json",
        data: JSON.stringify({profileData: fixture.profileData(), lastEventId: fixture.lastEventId})
      })
    });

    it("should throw error if profile Data not provided", function(){
      expect(function() {
        connection.updateProfileData()
      }).toThrowError("updateProfileData requires a profile data object")
    });

    it("should throw error if lastEventId not defined", function(){
      expect(function() {
        connection.updateProfileData(fixture.profileData)
      }).toThrowError("getProfileData must be run before this call to obtain and lastEventId")
    });
  });

});