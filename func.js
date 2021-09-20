"use strict";
exports.__esModule = true;
exports.URLShortener = void 0;
var URLShortenerAPIClient = /** @class */ (function () {
    function URLShortenerAPIClient(serverName, authorizationKey) {
        this.serverName = serverName;
        this.authorizationKey = authorizationKey;
    }
    URLShortenerAPIClient.prototype.buildRequestParams = function (urlsToShorten, smsRecordId) {
        var requestList = [];
        for (var _i = 0, urlsToShorten_1 = urlsToShorten; _i < urlsToShorten_1.length; _i++) {
            var original_url = urlsToShorten_1[_i];
            requestList.push({
                "original_url": original_url,
                "sms_record_id": smsRecordId++
            });
        }
        return {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.authorizationKey
            },
            "body": JSON.stringify(requestList)
        };
    };
    URLShortenerAPIClient.prototype.fetchShorterUrls = function (urlsToShorten, smsMessageId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(_this.serverName, _this.buildRequestParams(urlsToShorten, smsMessageId)).then(function (response) {
                response.json().then(function (parsedResponse) {
                    // extract the record from
                    resolve(parsedResponse.map(function (record) { return record.shortened_url; }));
                })["catch"](function (error) {
                    reject(error);
                });
            })["catch"](function (error) {
                reject(error);
            });
        });
    };
    return URLShortenerAPIClient;
}());
var URLShortener = /** @class */ (function () {
    function URLShortener(serverName, authorizationKey) {
        this.apiClient = new URLShortenerAPIClient(serverName, authorizationKey);
    }
    /**
     * @return URLShortener an instance that is configured with parameters from the environment
     */
    URLShortener.envConfigured = function () {
        return new URLShortener(process.env["URL_SHORTENER_SERVER"], process.env["URL_SHORTENER_TOKEN"]);
    };
    URLShortener.splitMessageToUrlsByRegex = function (message) {
        var urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g;
        return message.split(urlRegex);
    };
    URLShortener.moveCommasFromUrls = function (splitList) {
        var splitListChanged = splitList.slice();
        for (var i = 1; i < splitListChanged.length; i += 2) {
            if (splitListChanged[i].endsWith(",")) {
                splitListChanged[i + 1] = "," + splitListChanged[i + 1];
                splitListChanged[i] = splitListChanged[i].substring(0, splitListChanged[i].length - 1);
            }
        }
        return splitListChanged;
    };
    URLShortener.splitMessageToUrls = function (message) {
        return URLShortener.moveCommasFromUrls(URLShortener.splitMessageToUrlsByRegex(message));
    };
    URLShortener.extractUrls = function (urlSplitList) {
        return urlSplitList.filter((function (element, index) { return (index % 2 === 1); }));
    };
    URLShortener.substituteWithShorterURLs = function (splitsList, shorterURLs) {
        return splitsList.map(function (element, index) { return (index % 2 == 1) ? (shorterURLs[(index / 2 | 0)]) : element; });
    };
    /**
     * The method that will be used to substitute a message with shortened urls.
     *
     * @param params - the sms_record_id, and the message that has to be changed to a shorter version
     * @return Promise<string> the shortened message as a resolve to the promise
     *
     * Usage:
     * URLShortener.envConfigured().processMessage({sms_record_id: 123, message: "..."}).then(message => { (stuff to do with messages) })
     */
    URLShortener.prototype.processMessage = function (params) {
        var _this = this;
        var smsRecordIdAsInt = parseInt(params.sms_record_id);
        var urlSplits = URLShortener.splitMessageToUrls(params.message);
        var urls = URLShortener.extractUrls(urlSplits);
        return new Promise(function (resolve, reject) {
            _this.apiClient.fetchShorterUrls(urls, smsRecordIdAsInt)
                .then(function (shortenedURLList) {
                // substitute the shorter urls in, then rebuild the message
                resolve(URLShortener.substituteWithShorterURLs(urlSplits, shortenedURLList).join(""));
            })["catch"](function (error) {
                reject(error);
            });
        });
    };
    return URLShortener;
}());
exports.URLShortener = URLShortener;
