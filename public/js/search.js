
function handleAPILoaded() {
    $('#search-button').attr('disabled', false);
}

var first = true;
var divs = []

function search() {
    var q = $('#query').val();
    var request = gapi.client.youtube.search.list({
        q: q,
        part: 'snippet'
    });
    request.execute(function(response) {
        var container = document.getElementById('search-container');
        var img;
        if(first){

            for(i = 0; i<5; i++){
                container.appendChild(document.createElement('div'));
                container.childNodes[i].id = "image"+i;
                console.log(container.childNodes[i]);
                img = new Image();
                var div = document.getElementById('image'+1);
                img.onload = function() {
                    div.appendChild(img);
                    //divs[i].appendChild(img);
                }
                img.src = response.result['items'][i].snippet.thumbnails['default'].url;
            }
            first = false;
        }
        else{
            for(i=0;i<5;i++){
                var img = new Image();
                img.onload = function() {
                    divs[i].childNodes[0] = img;
                    //divs[i].removeChild(divs[i].childNodes[0]);
                    //divs[i].appendChild(img);

                }
                img.src = response.result['items'][i].snippet.thumbnails['default'].url;

            }
        }

     });
}