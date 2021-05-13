const canvas = document.getElementById("board");  // поиск нужного канваса
const ctx = canvas.getContext("2d");  // присваиваем контекст

let size = 4;
let pixelsize = (canvas.width / size);

let curPixel = null;
let isDrawing = false;
let curPenColor = "#000000"
let curFillColor = "#ffffff"
let curInstrument = "draw";

let boardCheme;
initBoardCheme();

function initBoardCheme() {
    boardCheme = Array();
    for (let i = 0; i < size; i++) {
        boardCheme.push(Array());
        for (let j = 0; j < size; j++) {
            boardCheme[i].push(curFillColor);
        }
    }
}


canvas.addEventListener("mousemove", ev => {
    let x = Math.ceil((ev.pageX - canvas.offsetLeft) / pixelsize - 1) * pixelsize;
    let y = Math.ceil((ev.pageY - canvas.offsetTop) / pixelsize - 1) * pixelsize;
    curPixel = [x, y];
    if (isDrawing) {
        boardCheme[x / pixelsize][y / pixelsize] = curPenColor;
    }
})
canvas.addEventListener("mouseleave", ev => {
    curPixel = null;
})
canvas.addEventListener("mousedown", ev => {
    let x = Math.ceil((ev.pageX - canvas.offsetLeft) / pixelsize - 1);
    let y = Math.ceil((ev.pageY - canvas.offsetTop) / pixelsize - 1);
    if (curInstrument === "draw") {
        boardCheme[x][y] = curPenColor;
        isDrawing = true;
    }
})
canvas.addEventListener("mouseup", ev => {
    isDrawing = false;
})
canvas.addEventListener("click", ev => {
    if (curInstrument === "fill"){
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                boardCheme[i][j] = curFillColor;
            }
        }
    }
})


// instruments
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById("changeSize").addEventListener("click", ev => {
    let res = confirm("При изменении размерности поля, холст будет очищен");
    if (res) {
        let rad = document.getElementsByName('size');
        for (let i = 0; i < rad.length; i++) {
            if (rad[i].checked) {
                switch (i) {
                    case 0:
                        size = 4;
                        break;
                    case 1:
                        size = 8;
                        break;
                    case 2:
                        size = 16;
                        break;
                    case 3:
                        size = 32;
                        break;
                }
            }
        }
        pixelsize = (canvas.width / size);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        initBoardCheme();
    }
})

document.getElementById("colorPenPick").addEventListener("input", ev => {
    curPenColor = ev.target.value;
}, false);
document.getElementById("colorFillPick").addEventListener("input", ev => {
    curFillColor = ev.target.value;
}, false);


document.getElementById("fill").addEventListener("click", ev => {
    curInstrument = "fill";
    document.getElementById("fill").classList.add("cur");
    document.getElementById("draw").classList.remove("cur");
});
document.getElementById("draw").addEventListener("click", ev => {
    curInstrument = "draw";
    document.getElementById("draw").classList.add("cur");
    document.getElementById("fill").classList.remove("cur");
});


// repaint
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame;

function repaintBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            ctx.fillStyle = boardCheme[i][j];
            ctx.fillRect(i * pixelsize, j * pixelsize, pixelsize, pixelsize);

        }
    }
    if (!isDrawing) {
        ctx.fillStyle = "#a1a1a1";
        if (curPixel != null) {
            ctx.fillRect(curPixel[0], curPixel[1], pixelsize, pixelsize)
        }
    }

    requestAnimationFrame(repaintBoard);
}

window.requestAnimationFrame(repaintBoard);