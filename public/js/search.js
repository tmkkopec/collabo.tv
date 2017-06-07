
function handleAPILoaded() {
    $('#search-button').attr('disabled', false);
}

var first = true;

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

            for(i = 1; i<=5; i++){

                var url = response.result['items'][i-1].snippet.thumbnails['default'].url;
                var imghtml = '<img src="'+url+'">';
                container.appendChild(document.createElement('div'));
                container.childNodes[i].id = "image"+i;
                console.log(container.childNodes[i]);

                document.getElementById('image'+i).innerHTML = imghtml;
            }
            first = false;
        }
        else{
            for(i=1;i<=5;i++){
                var url = response.result['items'][i-1].snippet.thumbnails['default'].url;
                var imghtml = '<img src="'+url+'">';
                document.getElementById('image'+i).innerHTML = imghtml;

            }
        }

     });
}