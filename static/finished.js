const canvas = document.getElementById("drawing-canvas")
const headData = document.getElementById('head')
const bodyData = document.getElementById('body')
const legsData = document.getElementById('legs')
const headHistory = document.getElementById('head-history').innerHTML.replaceAll('\\"', "'").replaceAll('"', '').replaceAll("'", '"')
const bodyHistory = document.getElementById('body-history').innerHTML.replaceAll('\\"', "'").replaceAll('"', '').replaceAll("'", '"')
const legsHistory = document.getElementById('legs-history').innerHTML.replaceAll('\\"', "'").replaceAll('"', '').replaceAll("'", '"')
const replayButton = document.getElementById("replay-button")

const buffer = document.createElement('canvas')
buffer.width = canvas.width
buffer.height = canvas.height
let ctx = buffer.getContext("2d")
ctx.imageSmoothingEnabled = false
ctx.filter = 'url(#remove-alpha)';

ctx = canvas.getContext("2d")
ctx.imageSmoothingEnabled = false
ctx.filter = 'url(#remove-alpha)';

let headHistoryParsed = headHistory != 'None' ? JSON.parse(headHistory) : []
let bodyHistoryParsed = bodyHistory != 'None' ? JSON.parse(bodyHistory) : []
let legsHistoryParsed = legsHistory != 'None' ? JSON.parse(legsHistory) : []

headHistoryParsed.forEach(action => {
    action.part = 'head'
});
bodyHistoryParsed.forEach(action => {
    action.part = 'body'
    action.points.forEach(point => {
        point.y += 250
    });
});
legsHistoryParsed.forEach(action => {
    action.part = 'legs'
    action.points.forEach(point => {
        point.y += 500
    });
});
let actions = headHistoryParsed
actions = actions.concat(bodyHistoryParsed)
actions = actions.concat(legsHistoryParsed)

let mostRecentAction = 'head'
function draw() {
    ctx = buffer.getContext("2d")
    ctx.imageSmoothingEnabled = false
    ctx.filter = 'url(#remove-alpha)';

    if (actions.length >= 1) {
        const line = actions[0]
        ctx.strokeStyle = line.color;
        ctx.lineWidth = parseInt(line.size);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (line.points.length > 0) {
            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.moveTo(line.points[0].x, line.points[0].y);
            if (line.points.length > 1) {
                ctx.lineTo(line.points[1].x, line.points[1].y);
            }
            ctx.stroke();
            ctx.closePath();
            line.points.shift()
        }
        if (line.points.length === 0) {
            mostRecentAction = actions.shift().part
        }
    }
    if (actions.length === 0) {
        clearInterval(drawIntervalId)
    }
    if (mostRecentAction === 'head') {
        ctx.clearRect(0, 300, canvas.width, canvas.height)
        ctx = canvas.getContext('2d')
        ctx.drawImage(buffer, 0, 0)
    } else if (mostRecentAction === 'body') {
        ctx.clearRect(0, 550, canvas.width, canvas.height)
        ctx.clearRect(0, 0, canvas.width, 250)
        ctx = canvas.getContext('2d')
        ctx.drawImage(buffer, 0, 0)
    } else if (mostRecentAction === 'legs') {
        ctx.clearRect(0, 0, canvas.width, 500)
        ctx = canvas.getContext('2d')
        ctx.drawImage(buffer, 0, 0)
    }
}

var drawIntervalId = setInterval(draw, 16.6666)

replayButton.addEventListener('click', () => {
    clearInterval(drawIntervalId)

    ctx = buffer.getContext('2d')
    ctx.clearRect(0, 0, buffer.width, buffer.height);
    ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    actions = JSON.parse(headHistory)
    headHistoryParsed = headHistory != 'None' ? JSON.parse(headHistory) : []
    bodyHistoryParsed = bodyHistory != 'None' ? JSON.parse(bodyHistory) : []
    legsHistoryParsed = legsHistory != 'None' ? JSON.parse(legsHistory) : []
    actions = headHistoryParsed
    headHistoryParsed.forEach(action => {
        action.part = 'head'
    });
    bodyHistoryParsed.forEach(action => {
        action.part = 'body'
        action.points.forEach(point => {
            point.y += 250
        });
    });
    legsHistoryParsed.forEach(action => {
        action.part = 'legs'
        action.points.forEach(point => {
            point.y += 500
        });
    });
    actions = actions.concat(bodyHistoryParsed)
    actions = actions.concat(legsHistoryParsed)
    drawIntervalId = setInterval(draw, 16.6666)
    if (headHistory == 'None') {
        let imageData = JSON.parse(headData.innerHTML.replaceAll('"', ''))
        let arr = new Uint8ClampedArray(600000)
        for (let i = 0; i < arr.length; ++i) {
            arr[i] = imageData[i]
        }
        let newImageData = new ImageData(arr, canvas.width)
        ctx.putImageData(newImageData, 0, 0)
    }

    if (bodyHistory == 'None') {
        let imageData = JSON.parse(bodyData.innerHTML.replaceAll('"', ''))
        let arr = new Uint8ClampedArray(600000)
        for (let i = 0; i < arr.length; ++i) {
            arr[i] = imageData[i]
        }
        let newImageData = new ImageData(arr, canvas.width)
        ctx.putImageData(newImageData, 0, 250)
    }

    if (legsHistory == 'None') {
        let imageData = JSON.parse(legsData.innerHTML.replaceAll('"', ''))
        let arr = new Uint8ClampedArray(600000)
        for (let i = 0; i < arr.length; ++i) {
            arr[i] = imageData[i]
        }
        let newImageData = new ImageData(arr, canvas.width)
        ctx.putImageData(newImageData, 0, 500)
    }
})

if (headHistory == 'None') {
    let imageData = JSON.parse(headData.innerHTML.replaceAll('"', ''))
    let arr = new Uint8ClampedArray(600000)
    for (let i = 0; i < arr.length; ++i) {
        arr[i] = imageData[i]
    }
    let newImageData = new ImageData(arr, canvas.width)
    ctx.putImageData(newImageData, 0, 0)
}

if (bodyHistory == 'None') {
    let imageData = JSON.parse(bodyData.innerHTML.replaceAll('"', ''))
    let arr = new Uint8ClampedArray(600000)
    for (let i = 0; i < arr.length; ++i) {
        arr[i] = imageData[i]
    }
    let newImageData = new ImageData(arr, canvas.width)
    ctx.putImageData(newImageData, 0, 250)
}

if (legsHistory == 'None') {
    let imageData = JSON.parse(legsData.innerHTML.replaceAll('"', ''))
    let arr = new Uint8ClampedArray(600000)
    for (let i = 0; i < arr.length; ++i) {
        arr[i] = imageData[i]
    }
    let newImageData = new ImageData(arr, canvas.width)
    ctx.putImageData(newImageData, 0, 500)
}