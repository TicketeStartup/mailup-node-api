# mailup-node-api
 

 [![Dependency Status](https://david-dm.org/TicketeStartup/mailup-node-api.svg)](https://david-dm.org/TicketeStartup/mailup-node-api)[![npm version](https://badge.fury.io/js/mailup.svg)](https://badge.fury.io/js/mailup)
[![NPM](https://nodei.co/npm/mailup.png)](https://nodei.co/npm/



``Official documentation:`` [http://help.mailup.com/display/mailupapi/REST+API](http://help.mailup.com/display/mailupapi/REST+API)


## Installation ##

`npm install mailup`

## Usage ##

### Step 1: Initialization ###


	const mailup = require('mailup');
	
	let client = new mailup({
		 clientId: "your_client_id",
    	 clientSecret: "your_client_secret",
    	 callbackUri : "http://localhost/mailUp/code",
    	 autoRefreshToken: true
    });

For get your developer keys (see: http://help.mailup.com/display/mailupapi/Authenticating+with+OAuth+v2).


### Step 2.1: Getting a request token from Username & Password ###



	client.logOnWithUsernamePassword({
    	username: "USERNAME",
    	password: "PASSWORD"}, (err, tokens) => {
    	console.log("_mailUp OBJ", client);
	});


### Step 2.2: Getting a request token from code ###

	
Get your code after external login.

 Show your login `page url`
 
 	console.log("getLogOnUri", client.getLogOnUri())
 		
Request(exmp):
 		
	 https://services.mailup.com/Authorization/OAuth/LogOn?client_id=XXX&client_secret=XXX&response_type=code&redirect_uri=http://localhost/mailUp/code

Responce(exmp):

		http://localhost/mailUp/code?code=YYYYYYYYY&token_type=bearer&expires_in=3600


``Login with code``:	
	
	client.logOnWithCode({
    	code: "YYYYYYYYY"
    	}, (err, tokens) => {
    	console.log("_mailUp OBJ", client);
	});
	
### Refresh accessToken or Auto ###

if during the initialization phase you passed the parameter: 
	
	autoRefreshToken: true

Then the module will make the refrash token when needed automatically.

`Otherwise`

Use the following method to do it manually	

	client.refreshAccessToken((err, tokens) => {//do something})
	
	
	
### Step 3: Generic method ###


You can use this method to call the MailUp API present in the official documentation : [http://help.mailup.com/display/mailupapi/Resources](http://help.mailup.com/display/mailupapi/Resources)


	 client.callApi({
            url: "https://services.mailup.com/API/v1.1/Rest/ConsoleService.svc/Console/Authentication/Info",
            verb: "GET",
          	body: undefined,
            contentType: undefined
        }, (err, r) => {
            if(err) console.log("callApi error", err);
            else console.log("callApi r", r);
        })

