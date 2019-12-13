const express = require('express')
const WebSocket = require('ws')
 

const server = express()
const PORT = process.env.PORT = 3989

server.use(express.static('public'))

clientId = 0 

server.listen(PORT, () => {
    console.log('Server is running at:', PORT)
})

const wss = new WebSocket.Server({ port: 2111 })

clientSet = new Set()
clientMap = new Map()

wss.on('connection', ws => {
    console.log('client connected ' + clientId)

    ws.pos = null
    ws.ID = clientId
    ws.player = null
    clientId++
    clientSet.add(ws)
    
    ws.on('close', () => {
        console.log('client ' + ws.ID + ' disconnected')
        sendToNeighbors({config:{neighbor: ws.player, alive: false}}, ws.ID, ws.room)
        arr = clientMap.get(ws.room).arr.filter(d => d !== ws)
        clientMap.get(ws.room).arr = arr

        if (arr.length < 1){
            clientMap.set(ws.room, undefined)
            console.log("room " + ws.room + " removed")
        }
    })
    
    ws.on('message', d => {
        data = JSON.parse(d)
        if(data.config != undefined){
            ws.room = data.config.room
            room = clientMap.get(ws.room)
            if (room == undefined){
                room = {arr:[], count:1}
                clientMap.set(ws.room,room)
            }
            else{
                room.arr.forEach(neighbor => {
                    ws.send(JSON.stringify({config:{neighbor: neighbor.player, alive: true}}))
                })
            }
            
            ws.player = room.count
            room.arr.push(ws)
            room.count += 1
            ws.send(JSON.stringify({config:{player: ws.player}}))
            sendToNeighbors({config:{neighbor: ws.player, alive: true}}, ws.ID, ws.room)
        }
        else{
            ws.pos = {
                x: data.x,
                y: data.y,
                angle: data.angle
            }
        }
    })
})

function sendToAllClients(msg, id){
    clientSet.forEach(d => {
        if (d.ID != id)                  
            d.send(JSON.stringify(msg))
    })
}

function sendToNeighbors(msg, id, room){
    clientMap.get(room).arr.forEach(ws => {
        if (ws.ID != id)                  
            ws.send(JSON.stringify(msg))
    })
}

setInterval(function(){
    clientMap.forEach(d => {
        data = {
            players: []
        }
        if(d != undefined){
            d.arr.forEach(ws => {
                data.players.push({id: ws.player, pos:ws.pos})
            })
            d.arr.forEach(ws => {
                ws.send(JSON.stringify(data))
            })

        }
    })
}, 1000 / 60)


//142.93.74.157