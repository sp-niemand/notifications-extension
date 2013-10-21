'use strict';

(function($) {

var authUrl = 'https://oauth.vk.com/authorize?'
	+ 'client_id=3947842&'
	+ 'scope=messages,offline&'
	+ 'redirect_uri=' + encodeURIComponent('https://oauth.vk.com/blank.html') + '&'
	+ 'display=popup&'
	+ 'v=5.2&'
	+ 'response_type=token&';

var onAuthTabCreate = function(tab) {
	var authTabId = tab.id;
	chrome.tabs.onUpdated.addListener(function tabUpdateListener(tabId, changeInfo) {
		if (tabId !== authTabId || ! changeInfo.url || changeInfo.status !== "loading") {
			return;
		}
		if (changeInfo.url.indexOf('oauth.vk.com/blank.html') === -1)  {
			return;
		}

		var hashParts = changeInfo.url.replace(/^.*#/, '').split('&'),
			paramParts,
			paramName,
			paramVal,
			accessToken = '',
			userId = '';
		for (var i=0; i<hashParts.length; ++i) {
			paramParts = hashParts[i].split('=');
			switch (paramParts[0]) {
				case 'access_token':
					accessToken = paramParts[1];
					break;
				case 'user_id':
					userId = paramParts[1];
					break;
			}
		}
		onAccessTokenReceived(accessToken, userId, tab);
	});
};

var onAccessTokenReceived = function(accessToken, userId, tab) {
	chrome.tabs.remove(tab.id);
};

$(function() {
	$('#connectVkButton').click(function() {
		chrome.tabs.create({
			url: authUrl, 
			selected: false
		}, onAuthTabCreate);
	});
});

}(Zepto));