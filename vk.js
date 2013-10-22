(function() {

    /**
     * @param apiId
     * @constructor
     */
    VkApi = function(apiId) {
        this.apiUrl = 'https://api.vk.com/method/';
        this.apiId = apiId;
        this.accessToken = null;
    };
    var self = VkApi;

    self.REQUEST_TYPE_POST = 'POST';
    self.REQUEST_TYPE_GET = 'GET';

    var prot = self.prototype;

    /**
     * Calls a VK API method
     *
     * @param methodName
     * @param parameters
     * @param requestType [optional]
     */
    prot.apiMethod = function(methodName, parameters, requestType) {
        (typeof requestType === 'undefined') && (requestType = self.REQUEST_TYPE_GET)

        parameters.access_token = this.getAccessToken();
        var url = this.apiUrl + encodeURIComponent(methodName) + '?' + $.param(parameters);
        var deferred = Q.defer();
        $.ajax({
            type: requestType,
            url: url,
            dataType: 'json',
            success: function(data) {
                deferred.resolve(data.response);
            },
            error: function() {
                deferred.reject("VK API answered with error");
            }
        });
        return deferred.promise;
    };

    /**
     *
     * @returns {null|*}
     */
    prot.getAccessToken = function() {
        if (this.accessToken) {
            return this.accessToken;
        }
        throw "No access token!";
    };

    /**
     *
     * @param accessToken
     */
    prot.setAccessToken = function(accessToken) {
        this.accessToken = accessToken;
    };

    /**
     * @param server
     * @param key
     * @param ts
     * @param listener Callback, which receives a response from long-poll request
     */
    prot.longPoll = function(server, key, ts, listener, isSsl) {
        (typeof isSsl === 'undefined') && (isSsl = false);

        var makeRequest = function(requestTs) {
            var url = (isSsl ? 'https://' : 'http://') + server + '?' + $.param({
                act: 'a_check',
                key: key,
                ts: requestTs,
                wait: 25,
                mode: 0
            });
            $.ajax({
                type: self.REQUEST_TYPE_GET,
                url: url,
                dataType: 'json',
                success: function(data) {
                    var response = data.response;
                    if (response) {
                        var messageUpdates = [];
                        $.each(response.updates, function(index, update) {
                            if (update[0] === 4) {
                                messageUpdates.push({
                                    from: update[3],
                                    text: update[6]
                                });
                            }
                        });
                        if (messageUpdates.length) {
                            listener(messageUpdates);
                        }
                        makeRequest(response.ts);
                    }
                    makeRequest(requestTs);
                }
            });
        };

        makeRequest(ts);
    };
}());