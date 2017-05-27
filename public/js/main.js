'use strict';
var id
var video
function Initiate() {
    id = document.getElementById("wideoUrl");
    console.log(id.value);

    var videos = document.getElementById("wideoId");

    // create background image
    videos.style.backgroundImage = 'url(http://i.ytimg.com/vi/' + id.value + '/sddefault.jpg)';

    // overlay the Play icon
    var play = document.createElement("div");
    play.setAttribute("class", "play");
    videos.appendChild(play);

    videos.onclick = function () {
        // Create an iFrame with autoplay set to true
        var iframe = document.createElement("iframe");
        var iframe_url = "https://www.youtube.com/embed/" + id.value + "?autoplay=1&autohide=1";
        if (this.getAttribute("data-params")) iframe_url += '&' + this.getAttribute("data-params");
        iframe.setAttribute("src", iframe_url);
        iframe.setAttribute("frameborder", '0');

        // The height and width of the iFrame should be the same as parent
        iframe.style.width = this.style.width;
        iframe.style.height = this.style.height;

        // Replace the YouTube thumbnail with YouTube Player
        this.parentNode.replaceChild(iframe, this);

    }

}

