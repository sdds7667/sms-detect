type RequestRecord = {
    "original_url": string,
    "sms_record_id": number
};

type ParsedResponseRecord = RequestRecord & {
    "shortened_url": string
};

type ProcessMessageArguments = {
    message: string;
    sms_record_id: string;
}

class URLShortenerAPIClient {
    serverName: string;
    authorizationKey: string;

    constructor(serverName: string, authorizationKey: string) {
        this.serverName = serverName;
        this.authorizationKey = authorizationKey;
    }

    buildRequestParams(urlsToShorten: string[], smsRecordId: number): RequestInit {
        let requestList: RequestRecord[] = [];
        for (let original_url of urlsToShorten) {
            requestList.push({
                "original_url": original_url,
                "sms_record_id": smsRecordId++
            });
        }

        return {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.authorizationKey}`
            },
            "body": JSON.stringify(requestList)
        }
    }

    fetchShorterUrls(urlsToShorten: string[], smsMessageId: number): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            fetch(this.serverName, this.buildRequestParams(urlsToShorten, smsMessageId)
            ).then(response => {
                    response.json().then((parsedResponse: ParsedResponseRecord[]) => {
                            // extract the record from
                            resolve(parsedResponse.map((record) => record.shortened_url));
                        }
                    ).catch((error) => {
                        reject(error)
                    })
                }
            ).catch((error) => {
                reject(error)
            });
        });
    }
}


class URLShortener {
    apiClient: URLShortenerAPIClient

    constructor(serverName: string, authorizationKey: string) {
        this.apiClient = new URLShortenerAPIClient(serverName, authorizationKey);
    }

    /**
     * @return URLShortener an instance that is configured with parameters from the environment
     */
    static envConfigured(): URLShortener {
        return new URLShortener(process.env["URL_SHORTENER_SERVER"], process.env["URL_SHORTENER_TOKEN"]);
    }

    static splitMessageToUrlsByRegex(message: string): string[] {
        let urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g;
        return message.split(urlRegex);
    }

    static moveCommasFromUrls(splitList: string[]): string[] {
        let splitListChanged = splitList.slice();
        for (let i = 1; i < splitListChanged.length; i += 2) {
            if (splitListChanged[i].endsWith(",")) {
                splitListChanged[i + 1] = "," + splitListChanged[i + 1];
                splitListChanged[i] = splitListChanged[i].substring(0, splitListChanged[i].length - 1);
            }
        }
        return splitListChanged;
    }

    static splitMessageToUrls(message: string): string[] {
        return URLShortener.moveCommasFromUrls(URLShortener.splitMessageToUrlsByRegex(message));
    }

    static extractUrls(urlSplitList: string[]) {
        return urlSplitList.filter(((element, index) => (index % 2 === 1)));
    }

    static substituteWithShorterURLs(splitsList: string[], shorterURLs: string[]): string[] {
        return splitsList.map((element, index) => (index % 2 == 1) ? (shorterURLs[(index / 2 | 0)]) : element);
    }

    /**
     * The method that will be used to substitute a message with shortened urls.
     *
     * @param params - the sms_record_id, and the message that has to be changed to a shorter version
     * @return Promise<string> the shortened message as a resolve to the promise
     *
     * Usage:
     * URLShortener.envConfigured().processMessage({sms_record_id: 123, message: "..."}).then(message => { (stuff to do with messages) })
     */
    processMessage(params: ProcessMessageArguments): Promise<string> {
        let smsRecordIdAsInt = parseInt(params.sms_record_id);
        let urlSplits = URLShortener.splitMessageToUrls(params.message);
        let urls = URLShortener.extractUrls(urlSplits);


        return new Promise<string>((resolve, reject) => {
            this.apiClient.fetchShorterUrls(urls, smsRecordIdAsInt)
                .then(shortenedURLList => {
                    // substitute the shorter urls in, then rebuild the message
                    resolve(URLShortener.substituteWithShorterURLs(urlSplits, shortenedURLList).join(""));
                }).catch((error) => {
                reject(error);
            });
        });
    }
}

export {URLShortener};