function setRoom(room){
    search_params.set('room', room)
    history.replaceState('data to be passed', 'Title of the page', '?' + search_params.toString())
}

wsPath = new URL(location.origin)
wsPath.protocol = 'ws'
wsPath.port = '2111'

var url = new URL(document.URL);
var query_string = url.search;
var search_params = new URLSearchParams(query_string)
var room = null

if (search_params.has('room'))
    room = search_params.get('room')
else{
    room = Math.floor(Math.random() * 10000)
    setRoom(room)
}

var player = null
var x = null
var y = null

window.ws = new WebSocket(wsPath.toString())

ws.onerror = function (error) {
    console.error('WebSocket Error ' + error);
};

ws.onmessage = function(msg) {
    data = JSON.parse(msg.data)
    
    if(data.config != undefined){
        if(data.config.player != undefined){
            player = data.config.player
            console.log(player)
        }
        else{
            neighbor = data.config.neighbor
            console.log(neighbor)
            if(data.config.alive){
                $('body').append("<div class = player id = player" + neighbor + "><div>")
                
            }
            else
                $('#player' + neighbor).remove()
        }
    }
    else{
        data.players.forEach(playerIn => {
            if(playerIn.id != player){
                $('#player' + playerIn.id).css({
                    "left": playerIn.pos.x + 'vw', 
                    "top": playerIn.pos.y + 'vh'
                })           
            }
        })
    }
}

ws.onopen = function(msg){
    ws.send(JSON.stringify({config: {room: room}}))
}    

$('body').mousemove(function(){
    x = event.clientX
    y = event.clientY
    $("#test1").css({"left": x + 'px', "top": y + 'px'})
    ws.send(JSON.stringify({x: 100 * x / window.innerWidth, y: 100 * y / window.innerHeight}))
})

$('#test').css('background-color', 'red')