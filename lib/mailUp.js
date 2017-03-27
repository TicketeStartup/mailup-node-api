"use strict";
const request = require('request'),
    mailup_base64_encode = require('./base64_encode.js');

class MailUp {
    constructor(params) {
        this.logonEndpoint = "https://services.mailup.com/Authorization/OAuth/LogOn";
        this.authorizationEndpoint = "https://services.mailup.com/Authorization/OAuth/Authorization";
        this.tokenEndpoint = "https://services.mailup.com/Authorization/OAuth/Token";
        this.consoleEndpoint = "https://services.mailup.com/API/v1.1/Rest/ConsoleService.svc";
        this.mailstatisticsEndpoint = "https://services.mailup.com/API/v1.1/Rest/MailStatisticsService.svc";
        this.clientId = params.clientId;
        this.clientSecret = params.clientSecret;
        this.callbackUri = params.callbackUri || "http://localhost/mailUp/code";
        this.accessToken = "";
        this.refreshToken = "";
        this.autoRefreshToken = params.autoRefreshToken !== undefined ? params.autoRefreshToken : true;
    }
    setTokens(params) {
        this.accessToken = params.access_token;
        this.refreshToken = params.refresh_token;
    }
    getLogonEndpoint() {
        return this.logonEndpoint;
    }
    setLogonEndpoint(value) {
        return this.logonEndpoint = value;
    }
    getAuthorizationEndpoint() {
        return this.authorizationEndpoint;
    }
    setAuthorizationEndpoint(value) {
        return this.authorizationEndpoint = value;
    }
    getTokenEndpoint() {
        return this.tokenEndpoint;
    }
    setTokenEndpoint(value) {
        return this.tokenEndpoint = value;
    }
    getConsoleEndpoint() {
        return this.consoleEndpoint;
    }
    setConsoleEndpoint(value) {
        return this.consoleEndpoint = value;
    }
    getMailstatisticsEndpoint() {
        return this.mailstatisticsEndpoint;
    }
    setMailstatisticsEndpoint(value) {
        return this.mailstatisticsEndpoint = value;
    }
    getLogOnUri() {
        var url = this.getLogonEndpoint() + "?client_id=" + this.clientId + "&client_secret=" + this.clientSecret + "&response_type=code&redirect_uri=" + this.callbackUri;
        return url;
    }
    logOnWithUsernamePassword(params, callback) {
        this.retreiveAccessToken(params.username, params.password, callback);
    }
    logOnWithCode(params, callback) {
        this.retreiveAccessTokenWithCode(params.code, callback);
    }
    retreiveAccessTokenWithCode(code, callback) {
        var self = this;
        let baseUrl = self.getTokenEndpoint(),
            uriParams = "?code=" + code + "&grant_type=authorization_code";
        request({
                uri: baseUrl + uriParams,
                method: 'GET'
            },
            function (error, response, body) {
                if (error) return callback(error, null);
                if (body && response.statusCode === 200) {
                    self.setTokens(JSON.parse(body));
                    return callback(null, body);
                } else {
                    return callback({
                        error: true,
                        noBody: true
                    }, null);
                }
            });
    }
    retreiveAccessToken(username, password, callback) {
        var self = this;
        let baseUrl = self.getTokenEndpoint();
        let uriParams = "?grant_type=password&client_id=" + self.clientId + "&client_secret=" + self.clientSecret + "&username=" + username + "&password=" + password;
        //console.log("baseUrl + uriParams", baseUrl + uriParams);
        request({
                uri: baseUrl + uriParams,
                method: 'POST',
                headers: {
                    "Authorization": "Basic " + mailup_base64_encode(self.clientId + ":" + self.clientSecret),
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            },
            function (error, response, body) {
                if (error) return callback(error, null);
                if (body && response.statusCode === 200) {
                    self.setTokens(JSON.parse(body));
                    return callback(null, body);
                } else {
                    return callback({
                        error: true,
                        noBody: true
                    }, null);
                }
            });
    }
    refreshAccessToken(callback) {
            var self = this;
            let baseUrl = self.getTokenEndpoint();
            let uriParams = "?client_id=" + self.clientId + "&client_secret=" + self.clientSecret +
                "&refresh_token=" + self.refreshToken + "&grant_type=refresh_token";
            request({
                    uri: baseUrl + uriParams,
                    method: 'POST',
                    headers: {
                        "Content-Length": uriParams.length,
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                },
                function (error, response, body) {
                    if (error) return callback(error, null);
                    if (body && response.statusCode === 200) {
                        self.setTokens(JSON.parse(body));
                        return callback(null, body);
                    } else {
                        return callback({
                            error: true,
                            noBody: true
                        }, null);
                    }
                });
        }
        /*
            CALL OTHER APIs
        */
    callApi(params, callback) {
            this.callMethodInternal(params, callback);
        }
        /*
            PARAMS: url, verb, body, contentType
        */
    callMethodInternal(params, callback) {
        var self = this;
        if (!params || !params.url) return callback({
            error: true
        }, null);
        request({
                uri: params.url,
                method: params.verb,
                headers: {
                    "Authorization": "Bearer " + self.accessToken,
                    "Content-Type": params.contentType == "XML" ? "application/xml" : "application/json",
                    "Accept": "application/x-www-form-urlencoded",
                    "Content-Length": params.body ? params.body.length : 0
                },
                body: params.body,
                json: params.contentType == "JSON" ? true : false
            },
            function (error, response, body) {
                if (error) return callback(error, null);
                if (body && response.statusCode === 200) {
                    return callback(null, body);
                }
                if (response.statusCode === 200) {
                    return callback(null, {"success" :true});
                } else if (response.statusCode == 401 && self.autoRefreshToken == true) {
                    self.refreshAccessToken((err) => {
                        if (err) return callback(err);
                        self.callMethodInternal(params, callback);
                    })
                }
                return callback({
                    error: true,
                    msg : error
                }, null);
            });
    }
}


module.exports = MailUp;
