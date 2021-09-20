import {URLShortener} from "./func";


let testCases = [
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
]

describe.each(testCases)("split correctly on urls", ({description: string, message, urlCount}) => {
    test("Correct count number", () => {

        let parseResult = URLShortener.splitMessageToUrlsByRegex(message);
        console.log(parseResult)
        expect(parseResult.length).toBe(urlCount * 2 + 1);
    });
})


let testCasesForUrlExtract = [
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
]


describe.each(testCasesForUrlExtract)("Testing the url selector", ({description, message, urls}) => {
    console.log(description);
    console.log(urls)
    let splits = URLShortener.splitMessageToUrls(message);
    let selectedUrls = URLShortener.extractUrls(splits);
    expect(selectedUrls).toStrictEqual(urls);
});

describe.each([
    {
        description: "simple comma test",
        list: ["", "url,", "other values"],
        expected: ["", "url", ",other values"]
    }
])("Tests the move comma situation", ({description, list, expected}) => {
    console.log(description);
    let movedCommasList = URLShortener.moveCommasFromUrls(list);
    let listCopy = list.slice();
    // Ensure the right answer while not changing the initial array.
    expect(movedCommasList).toStrictEqual(expected);
    expect(list).toStrictEqual(listCopy);
})