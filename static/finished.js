const canvas = document.getElementById("drawing-canvas")
const headData = document.getElementById('head')
const bodyData = document.getElementById('body')
const legsData = document.getElementById('legs')

const ctx = canvas.getContext("2d")
ctx.imageSmoothingEnabled = false
ctx.filter = 'url(#remove-alpha)';

let imageData = JSON.parse(headData.innerHTML.replaceAll('"', ''))
headData.innerHTML = ''
let arr = new Uint8ClampedArray(600000)
for (let i = 0; i < arr.length; ++i) {
    arr[i] = imageData[i]
}
let newImageData = new ImageData(arr, canvas.width)
ctx.putImageData(newImageData, 0, 0)

imageData = JSON.parse(bodyData.innerHTML.replaceAll('"', ''))
bodyData.innerHTML = ''
arr = new Uint8ClampedArray(600000)
for (let i = 0; i < arr.length; ++i) {
    arr[i] = imageData[i]
}
newImageData = new ImageData(arr, canvas.width)
ctx.putImageData(newImageData, 0, 250)

imageData = JSON.parse(legsData.innerHTML.replaceAll('"', ''))
legsData.innerHTML = ''
arr = new Uint8ClampedArray(600000)
for (let i = 0; i < arr.length; ++i) {
    arr[i] = imageData[i]
}
newImageData = new ImageData(arr, canvas.width)
ctx.putImageData(newImageData, 0, 500)