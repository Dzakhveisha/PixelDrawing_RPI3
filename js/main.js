const canvas = document.getElementById("board");  // поиск нужного канваса
const ctx = canvas.getContext("2d");  // присваиваем контекст

let size = 4;
let pixelsize = (canvas.width / size);

let curPixel = null;
let isDrawing = false;
let curPenColor = "#000000"
let curFillColor = "#ffffff"
let curInstrument = "draw";
document.getElementById("draw").classList.add("cur");
document.getElementById("size").classList.add("cur");

let boardCheme;
initBoardCheme();
startDraw()

function initBoardCheme() {
    boardCheme = Array();
    for (let i = 0; i < size; i++) {
        boardCheme.push(Array());
        for (let j = 0; j < size; j++) {
            boardCheme[i].push(curFillColor);
        }
    }
}

function startDraw() {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (i === j) {
                boardCheme[i][j] = "#373770";
            } else if (i + j === 3) {
                boardCheme[i][j] = "#81b5d9";
            } else {
                boardCheme[i][j] = "#f7ff8a";
            }
        }
    }
}


canvas.addEventListener("mousemove", ev => {
    let x = Math.ceil((ev.pageX - canvas.offsetLeft) / pixelsize - 1);
    let y = Math.ceil((ev.pageY - canvas.offsetTop) / pixelsize - 1);
    curPixel = [x, y];
    if (isDrawing) {
        boardCheme[x][y] = curPenColor;
    }
})
canvas.addEventListener("mouseleave", ev => {
    curPixel = null;
})
canvas.addEventListener("mousedown", ev => {
    if (curInstrument === "draw") {
        boardCheme[curPixel[0]][curPixel[1]] = curPenColor;
        isDrawing = true;
    }
})
canvas.addEventListener("mouseup", ev => {
    isDrawing = false;
})

function fillPixel(x, y, color) {
    boardCheme[x][y] = curFillColor;
    if ((x - 1) >= 0) {
        if (boardCheme[x - 1][y] === color) {
            fillPixel(x - 1, y, color)
        }
    }
    if ((x + 1) < size) {
        if (boardCheme[x + 1][y] === color) {
            fillPixel(x + 1, y, color)
        }
    }
    if ((y + 1) < size) {
        if (boardCheme[x][y + 1] === color) {
            fillPixel(x, y + 1, color)
        }
    }
    if ((y - 1) >= 0) {
        if (boardCheme[x][y - 1] === color) {
            fillPixel(x, y - 1, color)
        }
    }
}

canvas.addEventListener("click", ev => {
    if (curInstrument === "fill") {
        if (curFillColor !== boardCheme[curPixel[0]][curPixel[1]]) {
            fillPixel(curPixel[0], curPixel[1], boardCheme[curPixel[0]][curPixel[1]]);
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

//hot keys
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

window.addEventListener("keydown", ev => {
    switch (ev.code) {
        case "KeyB":
            document.getElementById("fill").click();
            break;
        case "KeyP":
            document.getElementById("draw").click();
            break;
        case "KeyC":
            if (curInstrument === "fill") {
                document.getElementById("colorFillPick").click();
            } else
                document.getElementById("colorPenPick").click();
            break;
    }
})


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
            ctx.fillRect(curPixel[0] * pixelsize, curPixel[1] * pixelsize, pixelsize, pixelsize)
        }
    }

    requestAnimationFrame(repaintBoard);
}

window.requestAnimationFrame(repaintBoard);