const canvas = document.getElementById("drawing-canvas")
const headData = document.getElementById('head')
const bodyData = document.getElementById('body')
const legsData = document.getElementById('legs')
const headHistory = document.getElementById('head-history').innerHTML.replaceAll('\\"', "'").replaceAll('"', '').replaceAll("'", '"')
const bodyHistory = document.getElementById('body-history').innerHTML.replaceAll('\\"', "'").replaceAll('"', '').replaceAll("'", '"')
const legsHistory = document.getElementById('legs-history').innerHTML.replaceAll('\\"', "'").replaceAll('"', '').replaceAll("'", '"')
const replayButton = document.getElementById("replay-button")

let ctx = canvas.getContext("2d")
ctx.imageSmoothingEnabled = false
ctx.filter = 'url(#remove-alpha)';

let headHistoryParsed = JSON.parse(headHistory)
let bodyHistoryParsed = JSON.parse(bodyHistory)
let legsHistoryParsed = JSON.parse(legsHistory)

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
    ctx = canvas.getContext("2d")
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
    } else if (mostRecentAction === 'body') {
        ctx.clearRect(0, 550, canvas.width, canvas.height)
    }
}

var drawIntervalId = setInterval(draw, 16.6666)

replayButton.addEventListener('click', () => {
    clearInterval(drawIntervalId)

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    actions = JSON.parse(headHistory)
    bodyHistoryParsed = JSON.parse(bodyHistory)
    legsHistoryParsed = JSON.parse(legsHistory)
    bodyHistoryParsed.forEach(action => {
        action.points.forEach(point => {
            point.y += 250
        });
    });
    legsHistoryParsed.forEach(action => {
        action.points.forEach(point => {
            point.y += 500
        });
    });
    actions = actions.concat(bodyHistoryParsed)
    actions = actions.concat(legsHistoryParsed)
    drawIntervalId = setInterval(draw, 16.6666)
})