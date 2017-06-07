
googleApiClientReady = function() {
    gapi.client.init({
        'apiKey': 'AIzaSyCA40NiZq5ebMNgTlK2LNnMskac5rvwtRI',
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/translate/v2/rest'],
    }).then(function() {
        return loadAPIClientInterfaces()});

}

function loadAPIClientInterfaces() {
    gapi.client.load('youtube', 'v3', function() {
        handleAPILoaded();
    });
}