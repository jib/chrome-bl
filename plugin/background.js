// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Create a rule that will show the page action when the conditions are met.
const kMatchRule = {
    // Declare the rule conditions.
    conditions: [
        new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {hostEquals: 'store.bricklink.com'},
        }),
        new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {hostEquals: 'www.bricklink.com'},
        }),
        new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {hostEquals: 'bricklink.com'},
        })
    ],
    // Shows the page action when the condition is met.
    actions: [new chrome.declarativeContent.ShowPageAction()]
}

// Register the runtime.onInstalled event listener.
chrome.runtime.onInstalled.addListener(function() {
    // Overrride the rules to replace them with kMatchRule.
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([kMatchRule]);
    });
    console.log("[BL] rules loaded");
});


// https://developer.chrome.com/extensions/messaging#simple
chrome.pageAction.onClicked.addListener(function (tab) {
    console.log("[BL] onClick handler " + tab.id);

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        console.log("[BL] onClick sending message " + tab.id);
        chrome.tabs.sendMessage(
            tabs[0].id,
            { runBLAugment: true },
            function( response ) { console.log( "[BL] onClick message handler finished");}
        );
    });
})
