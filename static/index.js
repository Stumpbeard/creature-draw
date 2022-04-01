const canvas = document.getElementById("drawing-canvas")
const buffer = document.createElement('canvas')
buffer.width = canvas.width
buffer.height = canvas.height
const offsetX = canvas.offsetLeft + parseInt(getComputedStyle(canvas).borderWidth.replace("px", ""))
const offsetY = canvas.offsetTop + parseInt(getComputedStyle(canvas).borderWidth.replace("px", ""))

const imageInput = document.getElementById("image-input")
const monsterName = document.getElementById("monster-name")

let mousePos = {
    x: -1000,
    y: -1000,
}

let mousedown = false
let lines = []
let points = []
let actions = []

let ctx = canvas.getContext("2d")
ctx.imageSmoothingEnabled = false
ctx.filter = 'url(#remove-alpha)';

function sameColor(c1, c2) {
    return (c1.r === c2.r && c1.g === c2.g && c1.b === c2.b)
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

const fillStack = []
const fill = (data, x, y, oldColor, newColor) => {
    fillStack.push([x, y, oldColor, newColor])

    while (fillStack.length > 0) {
        let [x, y, oldColor, newColor] = fillStack.pop()
        const loc = (x + y * canvas.width) * 4
        let color = { r: data[loc], g: data[loc + 1], b: data[loc + 2] }
        if (sameColor(color, newColor)) {
            continue
        }
        if (sameColor(color, oldColor)) {
            data[loc] = newColor.r
            data[loc + 1] = newColor.g
            data[loc + 2] = newColor.b
            data[loc + 3] = 255

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
    ctx = canvas.getContext("2d")
    ctx.imageSmoothingEnabled = false
    ctx.filter = 'url(#remove-alpha)';

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(buffer, 0, 0)
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
            ctx.lineWidth = parseInt(line.size);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
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
            let color = { r: data[loc], g: data[loc + 1], b: data[loc + 2] }
            fill(data, action.x, action.y, color, action.color)
            ctx.putImageData(imageData, 0, 0);
        }
    });
    actions = []

    ctx.strokeStyle = document.querySelector('input[name="color"]:checked').value;
    ctx.lineWidth = parseInt(document.querySelector('input[name="size"]').value);
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round';
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

    ctx = buffer.getContext('2d')
    ctx.imageSmoothingEnabled = false
    ctx.filter = 'url(#remove-alpha)';
    ctx.drawImage(canvas, 0, 0)

    ctx = canvas.getContext("2d")
    ctx.imageSmoothingEnabled = false
    ctx.filter = 'url(#remove-alpha)';
    ctx.beginPath()
    ctx.fillStyle = document.querySelector('input[name="color"]:checked').value;
    ctx.arc(mousePos.x, mousePos.y, parseInt(document.querySelector('input[name="size"]').value) / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.closePath()
}

setInterval(draw, 16.6666)


canvas.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
        // const tool = document.querySelector('input[name="tool"]:checked').value | 'stroke'
        // if (tool === 'stroke') {
        mousedown = true
        points.push({ x: e.pageX - offsetX, y: e.pageY - offsetY })
        points.push({ x: e.pageX - offsetX + 1, y: e.pageY - offsetY + 1 })
        // } else if (tool === 'fill') {
        // actions.push({ "action": "fill", "x": e.pageX - offsetX, "y": e.pageY - offsetY, "color": hexToRgb(document.querySelector('input[name="color"]:checked').value) })
        // }
    }
}, false)

document.addEventListener("mouseup", (e) => {
    if (e.button === 0) {
        // const tool = document.querySelector('input[name="tool"]:checked').value | 'stroke'
        // mousedown = false
        // if (tool === 'stroke') {
        mousedown = false
        actions.push({ "action": "stroke", "color": document.querySelector('input[name="color"]:checked').value, "points": points, "size": document.querySelector('input[name="size"]').value })
        points = []
        // }
    }
}, false)

document.addEventListener("mousemove", (e) => {
    if (mousedown) {
        points.push({ x: e.pageX - offsetX, y: e.pageY - offsetY })
    }
    mousePos = { x: e.pageX - offsetX, y: e.pageY - offsetY }
}, false)