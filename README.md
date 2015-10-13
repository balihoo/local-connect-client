# Local Connect Client API
This describes the javascript client for interfacing with the local data api, allowing affiliate locations to access data.

## Contents
- [Initial Setup](#initial-setup)
- [API Setup](#api-setup)
- API Methods
  - [getAllCampaigns()](#connectiongetallcampaigns)
  - [getAllTactics(campaignId)](#connectiongetalltacticscampaignid-integer)
  - [getAllCampaignsAndTactics](#connectiongetallcampaignsandtactics)
  - [getMetricsForTactic(tacticId)](#connectiongetmetricsfortactictacticid-integer)
  - [getWebsiteMetrics()](#connectiongetwebsitemetrics)
  - [getProfileForm()](#connectiongetprofileform)
  - [getProfileData()](#connectiongetProfileData)
  - [updateProfileData(profileData)](#connectionupdateprofiledataprofiledata-object)

## Overview

### Actors/Roles
- **Local Partner Web Browser**: End user's web browser. The end user is the local partner (affiliate, franchisee, agent, etc). We assume that the user has already authenticated with the brand's intranet or web portal.
- **Brand Intranet Web Server**: Intranet or web portal that hosts the Local Partner Connect plugin. Manages initial user authentication and authorization.
- **Balihoo Local Connect API**: Balihoo Local Marketing Cloud (LMC) API server. Exposes local partner campaign, tactic, and performance information via RESTful web service.

![Interaction Diagram](https://www.lucidchart.com/publicSegments/view/55396a6a-2e28-47fe-a344-0dfc0a009621/image.png)

### Workflow
1. User requests a web app that exposes LMC campaigns, tactics, and results. Brand server ensures that user is authenticated and authorized to view this data.
2. Brand server initiates a *server-to-server* request to Balihoo LMC API to generate a temporary client API id/key pair.
3. Balihoo returns the key pair that can be used for *client-to-server* requests for partner specific data.
4. Brand server responds with the web app requested in step 1. The app includes the javascript SDK and initializes it using the API key pair granted in step 3.
5. The web app requests campaign, tactic, and peformance data from Balihoo LMC using the client API key pair.
6. Balihoo LMC API responds with requested data. Repeat steps 5 and 6 (do not repeat other steps unless the client key expires).

## Initial Setup
The purpose of the api is to allow locations to be able to access data pertinent to themselves. The library consists of a
javascript object. In order to be able to use the object, the brand must make a call to obtain a client api key and client
id for each location it wants to grant access to. This typically occurs at the brand server level, and the client id and
client id and api key are then injected into a dynamic page (via php or some other mechanism) so that it is accessible
by the javascript object.

To make the call the brand sends the following get request:

https://bac.balihoo-cloud.com/v1.0/genClientAPIKey

It requires the following query parameters (all are required):

- apiKey (String): This is the brand specific api key provided by Balihoo to the brand.
- brandKey (string): This is the brand specific identifier, provided by Balihoo to the brand.
- locationKey (String): This is the brand specific unique location identifier that the client api key and id are being
generated for. This is an optional parameter, if omitted, session will allow request for multiple locations at once.
- groupId (String): This is brand specific group identifier. It is used to provide access to different levels of the api.
Currently this field is not used internally
- userId (String): This is the user id of the requester of the client api key. It is uses for audit purposes. Currently
this field is not used internally.

Returns a javascript object:
```
{clientId: xxxxxxxxx, clientApiKey: xxxxxxxxx}
```

## API Setup
In order to use the API the javascript object was must be included in the code.
```
<script src='bac.balihoo-cloud.com/assets/localDataAPI/localDataAPI.js' type='text/javascript'></script>
```
Once the library has been included, the library is initialized by creating a new local connection object, this is done
by passing in the clientId, and clientApiKey from the above step into the LocalConnection method. The method is referenced
from the 'balihoo' global variable that will be created when the library runs.

```
var connection = new balihoo.LocalConnection(clientId,clientApiKey)
```
Once a local connection object is obtained, the following method calls can be used.
NOTE: All methods return a promise, or more accurately a Jquery deferred object.

## Methods
### connection.getAllCampaigns()
This method returns a promise that when fulfilled will return a json representation of all campaigns that reference the
current location.

The returned json is as follows:

#### opts.locations contains 0 or 1 location:
```
[
  {
    "id": 34,
    "title": "Test Campaign",
    "description": "a campaign that is an example",
    "start" : "2014-05-02",
    "end": "2014-06-05",
    "status": "active"
  },
  {
    "id": 23,
    "title": "Another Campaign",
    "description": "the other example campaign",
    "start" : "2014-01-02",
    "end": "2014-01-28",
    "status": "active"
  }
]
```

#### opts.locations contains more than 1 location:
```
{
  "location1": [
    {
      "id": 34,
      "title": "Test Campaign",
      "description": "a campaign that is an example",
      "start" : "2014-05-02",
      "end": "2014-06-05",
      "status": "active"
    },
    {
      "id": 23,
      "title": "Another Campaign",
      "description": "the other example campaign",
      "start" : "2014-01-02",
      "end": "2014-01-28",
      "status": "active"
    }
  ],
  "location2": [
    {
      "id": 34,
      "title": "Test Campaign",
      "description": "a campaign that is an example",
      "start" : "2014-05-02",
      "end": "2014-06-05",
      "status": "active"
    },
    {
      "id": 23,
      "title": "Another Campaign",
      "description": "the other example campaign",
      "start" : "2014-01-02",
      "end": "2014-01-28",
      "status": "active"
    }
  ]
}
```

### connection.getAllTactics(campaignId: Integer)
This method takes the id of a given campaign, and then will return a promise that when fulfilled will contain a json array
of all the tactics that the current location is referenced in for the given campaign.

A sample json return is as follows:

#### opts.locations contains 0 or 1 location:
```
{
  "campaignId": 12,
  "tactics": [
    {
      "id": 12,
      "title": "Tactic Name",
      "start": "2014-05-02",
      "end": "2014-06-05",
      "channel": "Email",
      "description": "A tactic description would go here if it exists",
      "creative": "http://url.to/creative/image/or/html"
    },
    {
      "id": 24,
      "title": "Another Tactic Name",
      "start": "2014-01-02",
      "end": "2014-01-12",
      "channel": "Display",
      "description": "Another tactic description would go here if it exists",
      "creative": "http://url.to/creative/image/or/html"
    }
  ]
}
```

#### opts.locations contains more than 1 location:
```
{
  "location1": {
    "campaignId": 12,
    "tactics": [
      {
        "id": 12,
        "title": "Tactic Name",
        "start": "2014-05-02",
        "end": "2014-06-05",
        "channel": "Email",
        "description": "A tactic description would go here if it exists",
        "creative": "http://url.to/creative/image/or/html"
      },
      {
        "id": 24,
        "title": "Another Tactic Name",
        "start": "2014-01-02",
        "end": "2014-01-12",
        "channel": "Display",
        "description": "Another tactic description would go here if it exists",
        "creative": "http://url.to/creative/image/or/html"
      }
    ]
  },
  "location2": {
    "campaignId": 12,
    "tactics": [
      {
        "id": 12,
        "title": "Tactic Name",
        "start": "2014-05-02",
        "end": "2014-06-05",
        "channel": "Email",
        "description": "A tactic description would go here if it exists",
        "creative": "http://url.to/creative/image/or/html"
      },
      {
        "id": 24,
        "title": "Another Tactic Name",
        "start": "2014-01-02",
        "end": "2014-01-12",
        "channel": "Display",
        "description": "Another tactic description would go here if it exists",
        "creative": "http://url.to/creative/image/or/html"
      }
    ]
  }
}
```

### connection.getAllCampaignsAndTactics()
This method will return a promise that when it fulfills combines the above two api calls into one. It returns a
json array of all campaigns the current location is used in. In addition each campaign will contain a json array of all the
tactics that the current location was used in for that campaign.

Sample json appears below:

#### opts.locations contains 0 or 1 location:
```
[
  {
    "id": 34,
    "title": "Test Campaign",
    "description": "a campaign that is an example",
    "start" : "2014-01-02",
    "end": "2014-06-05",
    "status": "active",
    "tactics":  [
      {
        "id": 12,
        "title": "Tactic Name",
        "start" : "2014-05-02",
        "end": "2014-06-05",
        "channel": "Email",
        "description": "A tactic description would go here if it exists",
        "creative": "http://url.to/creative/image/or/html"
      },
      {
        "id": 24,
        "title": "Another Tactic Name",
        "start" : "2014-01-02",
        "end": "2014-01-12",
        "channel": "Display",
        "description": "Another tactic description would go here if it exists",
        "creative": "http://url.to/creative/image/or/html"
      }
    ]
  },
  {
    "id": 23,
    "title": "Another Campaign",
    "description": "the other example campaign",
    "start" : "2014-01-02",
    "end": "2014-01-28",
    "status": "active",
    "tactics": []
  }
]
```

#### opts.locations contains more than 1 location:
```
{
  "location1": [
    {
      "id": 34,
      "title": "Test Campaign",
      "description": "a campaign that is an example",
      "start" : "2014-01-02",
      "end": "2014-06-05",
      "status": "active",
      "tactics":  [
        {
          "id": 12,
          "title": "Tactic Name",
          "start" : "2014-05-02",
          "end": "2014-06-05",
          "channel": "Email",
          "description": "A tactic description would go here if it exists",
          "creative": "http://url.to/creative/image/or/html"
        },
        {
          "id": 24,
          "title": "Another Tactic Name",
          "start" : "2014-01-02",
          "end": "2014-01-12",
          "channel": "Display",
          "description": "Another tactic description would go here if it exists",
          "creative": "http://url.to/creative/image/or/html"
        }
      ]
    },
    {
      "id": 23,
      "title": "Another Campaign",
      "description": "the other example campaign",
      "start" : "2014-01-02",
      "end": "2014-01-28",
      "status": "active",
      "tactics": []
    }
  ],
  "location2": [
    {
      "id": 35,
      "title": "Test Campaign #2",
      "description": "a campaign that is an example",
      "start" : "2014-01-02",
      "end": "2014-06-05",
      "status": "active",
      "tactics":  [
        {
          "id": 12,
          "title": "Tactic Name",
          "start" : "2014-05-02",
          "end": "2014-06-05",
          "channel": "Email",
          "description": "A tactic description would go here if it exists",
          "creative": "http://url.to/creative/image/or/html"
        }
      ]
    },
    {
      "id": 25,
      "title": "Another Campaign",
      "description": "the other example campaign",
      "start" : "2014-01-02",
      "end": "2014-01-28",
      "status": "active",
      "tactics": []
    }
  ]
}
```

### connection.getMetricsForTactic(tacticId: Integer)
This method takes the id of a given tactic, and returns a promise that when it fulfills contains a json object with metric
information. The json object returned depends on the channel of the tactic.

Example json responses appear below:
#### Email
```
{
  "campaignId": 34,
  "tacticId": 2,
  "channel": "Email",
  "sends": 45,
  "opens": 12,
  "clicks": 12
}
```
#### Paid Search
```
{
  "campaignId": 34,
  "tacticId": 3,
  "channel": "Paid Search",
  "clicks": 45,
  "spend": 125.12
}
```
#### Display
```
{
  "campaignId": 34,
  "tacticId": 1,
  "channel": "Display",
  "impressions": 95,
  "spend": 125.12
}
```

#### If opts.locations contains more than 1 location:
```
{
  "location1": { "an object": "defined in the section above" },
  "location2": { "an object": "defined in the section above" }
}
```

### connection.getWebsiteMetrics()
This method will return a promise, that once fulfilled will contain a json object with website metrics for the current
location's local website. In order for any data to be returned the current location must have a matching local website,
or empty data will be returned.

Example json appears below:

#### If opts.locations contains 0 or 1 location:

```
{
  "campaignId": 34,
  "localSiteUrl": "http://www.balihoo.com",
  "visits": {
    "total": 125,
    "organic": 45,
    "direct": 12,
    "referral": 34,
    "paid": 12,
    "newVisitsPercent": 0.43
  },
  "leads": {
    "total": 123,
    "totalWeb": 34,
    "totalPhone": 12,
    "organicWeb": 4,
    "paidWeb": 30,
    "organicPhone": 4,
    "paidPhone": 8
  }
}
```

#### If opts.locations contains more than 1 location:

```
{
  "location1": {
    "campaignId": 34,
    "localSiteUrl": "http://www.balihoo.com",
    "visits": {
      "total": 125,
      "organic": 45,
      "direct": 12,
      "referral": 34,
      "paid": 12,
      "newVisitsPercent": 0.43
    },
    "leads": {
      "total": 123,
      "totalWeb": 34,
      "totalPhone": 12,
      "organicWeb": 4,
      "paidWeb": 30,
      "organicPhone": 4,
      "paidPhone": 8
    }
  },
  "location2": {
    "campaignId": 34,
    "localSiteUrl": "http://www.balihoo.com",
    "visits": {
      "total": 125,
      "organic": 45,
      "direct": 12,
      "referral": 34,
      "paid": 12,
      "newVisitsPercent": 0.43
    },
    "leads": {
      "total": 123,
      "totalWeb": 34,
      "totalPhone": 12,
      "organicWeb": 4,
      "paidWeb": 30,
      "organicPhone": 4,
      "paidPhone": 8
    }
  }
}
```

### connection.getProfileForm()
This method returns a promise which will fetch the corresponding profile form json information from formbuilder.
The form builder libraries will need to be installed to use the returned form information. This endpoint simply
proxies to form builder, so see form builder documentation for more information on how to use the returned result

### connection.getProfileData()
This method will return a promise which when fulfilled will contain the latest profile Data from blip. Blip also returns some meta
data which is necessary for the updateProfileData call below, and cached internally. Therefore this call must proceed the
updateProfileData call.

An example of a response appears below, note the information for different brands or locations may vary from the output
below. See the latest blip documentation for more information:

```
{
  "name": "Alexander Balihoo of Kansas",
  "urls": {"home": "demo.balihoo-cloud.com/1816431331"},
  "address": {
    "city": "Kansas",
    "email": "kalexander@demo.balihoo-cloud.com",
    "line1": "133 NE 91 St",
    "line2": null,
    "phone": "(149) 555-8673",
    "state": "MO",
    "country": "US",
    "latitude": null,
    "timeZone": null,
    "longitude": null,
    "postalCode": "64155"
  },
  "balihoo": {
    "legacy": {
      "test": false,
      "closed": null,
      "segments": {
        "Tier 1": {"startDate": "2014-06-11"},
        "Default": {"startDate": "2000-01-01"},
        "Midwest": {"startDate": "2014-06-11"}
      },
      "affiliateId": 440113
    },
    "localSite": {
      "brandUrl": "http://demo.microsites.balihoo-cloud.com.dev.balihoo-cloud.com/alexanderbalihooofkansas1-64155/kansas-mo",
      "vanityUrl": null
    }
  },
  "markets": {
    "zips": [],
    "radius": {
      "unit": "mile",
      "distance": null,
      "latitude": null,
      "longitude": null
    }
  },
  "brandKey": "demo",
  "document": {
    "name": "Alexander Balihoo of Simon",
    "urls": {"home": "demo.balihoo-cloud.com/1816431331"},
    "address": {
      "city": "Kansas",
      "email": "kalexander@demo.balihoo-cloud.com",
      "line1": "133 NE 91 St",
      "line2": null,
      "phone": "(149) 555-8673",
      "state": "MO",
      "country": "US",
      "latitude": null,
      "timeZone": null,
      "longitude": null,
      "postalCode": "64155"
    },
    "balihoo": {
      "legacy": {
        "test": false,
        "closed": null,
        "segments": {
          "Tier 1": {"startDate": "2014-06-11"},
          "Default": {"startDate": "2000-01-01"},
          "Midwest": {"startDate": "2014-06-11"}
        },
        "affiliateId": 440113
      },
      "localSite": {
        "brandUrl": "http://demo.microsites.balihoo-cloud.com.dev.balihoo-cloud.com/alexanderbalihooofkansas1-64155/kansas-mo",
        "vanityUrl": null
      }
    },
    "markets": {
      "zips": [],
      "radius": {
        "unit": "mile",
        "distance": null,
        "latitude": null,
        "longitude": null
      }
    },
    "brandKey": "demo",
    "paidSearch": {
      "url": "demo.balihoo-cloud.com/1816431331",
      "budget": {
        "apr": null,
        "aug": null,
        "dec": null,
        "feb": null,
        "jan": null,
        "jul": null,
        "jun": null,
        "mar": null,
        "may": null,
        "nov": null,
        "oct": null,
        "sep": null
      },
      "phonePrimary": null
    },
    "locationKey": "1816431331-1"
  },
  "paidSearch": {
    "url": "demo.balihoo-cloud.com/1816431331",
    "budget": {
      "apr": null,
      "aug": null,
      "dec": null,
      "feb": null,
      "jan": null,
      "jul": null,
      "jun": null,
      "mar": null,
      "may": null,
      "nov": null,
      "oct": null,
      "sep": null
    },
    "phonePrimary": null
  },
  "locationKey": "1816431331-1"
}
```

### connection.updateProfileData(profileData: Object)
This method returns a promise that will attempt to update the given profileData for the current location
and brand. The getProfileData call above *must* have been called before this call, as some internal blip
data is necessary for this call to be completed successfully.
This promise resolves to an empty object on successful completion. The profileData object can be the object
returned from the getProfileData call above with the required updated fields changed, or simply the fields
that need to be updated only. e.g. from the example above

```
{
  "name": "Changed Alexander Balihoo of Kansas"
}
```

In the above example, only the name field will be updated. This saves having to send the entire profile data
object back.
