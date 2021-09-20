"use strict";
exports.__esModule = true;
var func_1 = require("./func");
var testCases = [
    {
        description: "base case",
        message: "Hi Jacob, we look forward to seeing you at your appoint. Here are the details: https://www.appointment.com?sdfds=234 " +
            "If you can't make it, click https://www.appointment.com/cancel?sdfdsf=234234 Have a great day. - the team at onelab.com",
        urlCount: 2
    },
    {
        description: "test for detecting separate schemas: www/http/https",
        message: "www.google.com is the search engine to go to, not http://bing.com, even if it has a secure version: https://bing.com",
        urlCount: 3
    },
    {
        description: "testing the empty array",
        message: "",
        urlCount: 0
    },
    {
        description: "Two glued urls",
        message: "https://google.comhttps://bing.com",
        urlCount: 1
    }
];
describe.each(testCases)("split correctly on urls", function (_a) {
    var string = _a.description, message = _a.message, urlCount = _a.urlCount;
    test("Correct count number", function () {
        var parseResult = func_1.URLShortener.splitMessageToUrlsByRegex(message);
        console.log(parseResult);
        expect(parseResult.length).toBe(urlCount * 2 + 1);
    });
});
var testCasesForUrlExtract = [
    {
        description: "base case",
        message: "Hi Jacob, we look forward to seeing you at your appoint. Here are the details: https://www.appointment.com?sdfds=234 " +
            "If you can't make it, click https://www.appointment.com/cancel?sdfdsf=234234 Have a great day. - the team at onelab.com",
        urls: [
            "https://www.appointment.com?sdfds=234",
            "https://www.appointment.com/cancel?sdfdsf=234234"
        ]
    },
    {
        description: "test for detecting separate schemas: www/http/https",
        message: "www.google.com is the search engine to go to, not http://bing.com, even if it has a secure version: https://bing.com",
        urls: [
            "www.google.com",
            "http://bing.com",
            "https://bing.com"
        ]
    },
    {
        description: "testing the empty array",
        message: "",
        urls: []
    },
    {
        description: "Two glued urls",
        message: "https://google.comhttps://bing.com",
        urls: [
            "https://google.comhttps://bing.com"
        ]
    }
];
describe.each(testCasesForUrlExtract)("Testing the url selector", function (_a) {
    var description = _a.description, message = _a.message, urls = _a.urls;
    console.log(description);
    console.log(urls);
    var splits = func_1.URLShortener.splitMessageToUrls(message);
    var selectedUrls = func_1.URLShortener.extractUrls(splits);
    expect(selectedUrls).toStrictEqual(urls);
});
describe.each([
    {
        description: "simple comma test",
        list: ["", "url,", "other values"],
        expected: ["", "url", ",other values"]
    }
])("Tests the move comma situation", function (_a) {
    var description = _a.description, list = _a.list, expected = _a.expected;
    console.log(description);
    var movedCommasList = func_1.URLShortener.moveCommasFromUrls(list);
    var listCopy = list.slice();
    // Ensure the right answer while not changing the initial array.
    expect(movedCommasList).toStrictEqual(expected);
    expect(list).toStrictEqual(listCopy);
});
