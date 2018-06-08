chrome.runtime.onMessage.addListener(hideResteems);

function hideResteems() {
    chrome.tabs.executeScript( {
        file: "/content_script/content.js"
    })
}