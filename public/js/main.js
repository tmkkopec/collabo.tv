	
	
	function Initiate() {
   id = document.getElementById("wideoUrl");
   console.log(id.value);
    dataChannel.send(id.value);
   player.loadVideoById(id.value, 0, "large");
   }
   
   function PlayForAll(){
	  console.log("odpalone");
	  dataChannel.send("play");
	  player.playVideo();
   }
   
   function PauseForAll(){
	   console.log("zatrzymane");
	   dataChannel.send("stop");
	   player.pauseVideo();
   }
   
      // 2. This code loads the IFrame Player API code asynchronously.
      var tag = document.createElement('script');

      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // 3. This function creates an <iframe> (and YouTube player)
      //    after the API code downloads.
      var player;
      function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
          height: '540',
          width: '960',
          videoId: '',
          events: {
            'onReady': onReady,
            'onStateChange': onPlayerStateChange
          }
        });
      }
	function onPlayerStateChange(event) {
		
        if (event.data == YT.PlayerState.PAUSED) {
          player.loadVideoById("JRJYzEZ7OD4", 5, "large")
		  
		  
        }
      }
      // 4. The API will call this function when the video player is ready.
    function onReady() {
		
    player.pauseVideo();
}


   

    var ws = null;
    var user = "";
    var user2 = "";

    
        ws = new WebSocket("ws://127.0.0.1:8088");

        ws.onopen = function(e){    
            console.log("Websocket opened");
            $("#dcform").show();
        }
        ws.onclose = function(e){   
            console.log("Websocket closed");
        }
        ws.onmessage = function(e){ 
            console.log("Websocket message received: " + e.data);

            var json = JSON.parse(e.data);
			if(json.id == "name"){
				user=json.username;
				console.log(user);
			}
            if(json.action == "candidate"){
                if(json.to == user){
                  processIce(json.data);
                }
            } else if(json.action == "offer"){
                
                if(json.to == user){
                    user2 = json.from;
                    processOffer(json.data)
                }
            } else if(json.action == "answer"){
                
                if(json.to == user){
                    processAnswer(json.data);
                }
            } 
           

        }
        ws.onerror = function(e){   
            console.log("Websocket error");
        }
    

    

    var config = {
		"iceServers":[
	
	//{url: "stun:23.21.150.121"},
        {url: "stun:stun.l.google.com:19302"}
        //{url: "turn:numb.viagenie.ca", credential: "webrtcdemo", username: "louis%40mozilla.com"}
	
	]};
    var connection = {};

    var peerConnection;
    var dataChannel;



    function connectTo(){
        if(user=="1"){
		user2="0";
		}
		if(user=="0"){
		user2="1";
		user2="1";
		}
        openDataChannel();

        var sdpConstraints = {  }
        peerConnection.createOffer(sdpConstraints).then(function (sdp) {
            peerConnection.setLocalDescription(sdp);
            sendNegotiation("offer", sdp);
            console.log("------ SEND OFFER ------");
        }, function (err) {
            console.log(err)
        });

    }

    function sendDirect(e){
        e.preventDefault();
        dataChannel.send($("#message").val());
        $('body').append('Me: <div class="message">'+$("#message").val()+'</div>');
        console.log("Sending over datachannel: " + $("#message").val());
        $("#message").val('');
    }

   


    function openDataChannel (){
        peerConnection = new RTCPeerConnection(config, connection);
        peerConnection.onicecandidate = function(e){
            if (!peerConnection || !e || !e.candidate) return;
            var candidate = event.candidate;
            sendNegotiation("candidate", candidate);
        }

        dataChannel = peerConnection.createDataChannel("datachannel", {reliable: false});

        dataChannel.onopen = function(){
            console.log("------ DATACHANNEL OPENED ------")
            $("#sendform").show();
        };
        dataChannel.onclose = function(){console.log("------ DC closed! ------")};
        dataChannel.onerror = function(){console.log("DC ERROR!!!")};

        peerConnection.ondatachannel = function (ev) {
            console.log('peerConnection.ondatachannel event fired.');
            ev.channel.onopen = function() {
                console.log('Data channel is open and ready to be used.');
            };
            ev.channel.onmessage = function(e){
                console.log("DC from ["+user2+"]:" +e.data);
                if(e.data=="stop"){
					console.log(e.data);
					 player.pauseVideo();
				}
				else if(e.data=="play"){
				player.playVideo();
				}
				else{
				player.loadVideoById(e.data, 0, "large")
				}
				
            }
        };

        return peerConnection
    }

    function sendNegotiation(type, sdp){
        var json = { from: user, to: user2, action: type, data: sdp};
        ws.send(JSON.stringify(json));
        console.log("Sending ["+user+"] to ["+user2+"]: " + JSON.stringify(sdp));
    }

    function processOffer(offer){
        var peerConnection = openDataChannel();
        peerConnection.setRemoteDescription(new RTCSessionDescription(offer)).catch(e => {
            console.log(e)
        });

        var sdpConstraints = {'mandatory':
            {
                'OfferToReceiveAudio': false,
                'OfferToReceiveVideo': false
            }
        };

        peerConnection.createAnswer(sdpConstraints).then(function (sdp) {
            return peerConnection.setLocalDescription(sdp).then(function() {            
                sendNegotiation("answer", sdp);
                console.log("------ SEND ANSWER ------");
            })
        }, function(err) {
            console.log(err)
        });
        console.log("------ PROCESSED OFFER ------");

    };

    function processAnswer(answer){

        peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("------ PROCESSED ANSWER ------");
        return true;
    };

    function processIce(iceCandidate){
        peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate))
    }

     