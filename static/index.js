const canvas = document.getElementById("drawing-canvas")
const offsetX = canvas.offsetLeft
const offsetY = canvas.offsetTop

const imageInput = document.getElementById("image-input")
const monsterName = document.getElementById("monster-name")

let mousedown = false
let lines = []
let points = []
let actions = []

const ctx = canvas.getContext("2d")
ctx.imageSmoothingEnabled = false
ctx.filter = 'url(#remove-alpha)';

const fillStack = []
const fill = (data, x, y, oldColor, newColor) => {
    fillStack.push([x, y, oldColor, newColor])

    while (fillStack.length > 0) {
        let [x, y, oldColor, newColor] = fillStack.pop()
        const loc = (x + y * canvas.width) * 4
        let color = ''
        if (data[loc] === 255) {
            color = 'red'
        } else if (data[loc + 1] === 128) {
            color = 'green'
        } else if (data[loc + 2] === 255) {
            color = 'blue'
        }
        if (color === newColor) {
            continue
        }
        if (color === oldColor) {
            if (newColor === 'red') {
                data[loc] = 255
                data[loc + 1] = 0
                data[loc + 2] = 0
                data[loc + 3] = 255
            }
            else if (newColor === 'green') {
                data[loc] = 0
                data[loc + 1] = 128
                data[loc + 2] = 0
                data[loc + 3] = 255
            }
            else if (newColor === 'blue') {
                data[loc] = 0
                data[loc + 1] = 0
                data[loc + 2] = 255
                data[loc + 3] = 255
            }

            if (y - 1 >= 0) {
                fillStack.push([x, y - 1, oldColor, newColor])
            }
            if (y + 1 < canvas.height) {
                fillStack.push([x, y + 1, oldColor, newColor])
            }
            if (x - 1 >= 0) {
                fillStack.push([x - 1, y, oldColor, newColor])
            }
            if (x + 1 < canvas.width) {
                fillStack.push([x + 1, y, oldColor, newColor])
            }
        }
    }
}

function draw() {
    if (canvas.innerHTML) {
        const imageData = JSON.parse(canvas.innerHTML.replaceAll('"', ''))
        canvas.innerHTML = ''
        const arr = new Uint8ClampedArray(600000)
        for (let i = 0; i < arr.length; ++i) {
            arr[i] = imageData[i]
        }
        const newImageData = new ImageData(arr, canvas.width)
        ctx.putImageData(newImageData, 0, 0 - canvas.height + 50)
    }
    actions.forEach(action => {
        if (action.action === 'stroke') {
            const line = action
            ctx.strokeStyle = line.color;
            ctx.lineWidth = 5;
            if (line.points.length !== 0) {
                ctx.beginPath();
                ctx.setLineDash([]);
                ctx.moveTo(line.points[0].x, line.points[0].y);
                line.points.forEach(point => {
                    ctx.lineTo(point.x, point.y);
                });
                ctx.stroke();
                ctx.closePath();
            }
        }
        else if (action.action === 'fill') {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imageData.data
            const loc = (action.x + action.y * canvas.width) * 4
            let color = ''
            if (data[loc] === 255) {
                color = 'red'
            } else if (data[loc + 1] === 128) {
                color = 'green'
            } else if (data[loc + 2] === 255) {
                color = 'blue'
            }
            fill(data, action.x, action.y, color, action.color)
            ctx.putImageData(imageData, 0, 0);
        }
    });
    actions = []

    ctx.strokeStyle = document.querySelector('input[name="color"]:checked').value;
    ctx.lineWidth = 5;
    if (points.length !== 0) {
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        ctx.closePath();
    }

    const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const imageData = Array.prototype.slice.call(image.data)
    const imageDataJson = JSON.stringify(imageData)
    imageInput.value = imageDataJson;
}

setInterval(draw, 16.6666)


canvas.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
        const tool = document.querySelector('input[name="tool"]:checked').value
        if (tool === 'stroke') {
            console.log(e)
            mousedown = true
            points.push({ x: e.pageX - offsetX, y: e.pageY - offsetY })
            points.push({ x: e.pageX - offsetX + 1, y: e.pageY - offsetY + 1 })
        } else if (tool === 'fill') {
            actions.push({ "action": "fill", "x": e.pageX - offsetX, "y": e.pageY - offsetY, "color": document.querySelector('input[name="color"]:checked').value })
        }
    }
}, false)

document.addEventListener("mouseup", (e) => {
    if (e.button === 0) {
        const tool = document.querySelector('input[name="tool"]:checked').value
        mousedown = false
        if (tool === 'stroke') {
            mousedown = false
            actions.push({ "action": "stroke", "color": document.querySelector('input[name="color"]:checked').value, "points": points })
            points = []
        }
    }
}, false)

document.addEventListener("mousemove", (e) => {
    if (mousedown) {
        points.push({ x: e.pageX - offsetX, y: e.pageY - offsetY })
    }
}, false)