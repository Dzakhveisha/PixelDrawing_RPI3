const canvas = document.getElementById('board'); // поиск нужного канваса
const ctx = canvas.getContext('2d'); // присваиваем контекст

let size = 4;
let pixelsize = (canvas.width / size);

let curPixel = null;
let isDrawing = false;
let curPenColor = '#000000';
let curFillColor = '#ffffff';
let curInstrument = 'draw';
document.getElementById('draw').classList.add('cur');
document.getElementById('size').classList.add('cur');

let boardCheme;
initBoardCheme(curFillColor);
startDraw();

// webSockets
let ws;
let id;
initWS();

function initWS() {
  if (ws) {
    ws.onerror = ws.onopen = ws.onclose = null;
    ws.close();
  }
  ws = new WebSocket('ws://localhost:6968');
  ws.onopen = () => {
    console.log('Connection opened!');
  };
  ws.onmessage = ({data}) => {
    const dataAr = JSON.parse(data);
    console.log(dataAr);
    switch (dataAr['type']) {
      case 'draw':
        boardCheme[parseInt(dataAr['x'])][parseInt(dataAr['y'])] =
            dataAr['color'];
        break;
      case 'newId':
        id = dataAr['id'];
        break;
      case 'newSize':
        console.log(dataAr);
        size = dataAr['size'];
        pixelsize = (canvas.width / size);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        initBoardCheme(dataAr['color']);
        break;
      case 'cursor':
        if (id !== dataAr['id']) {
          let div = document.getElementById('cursor' + dataAr['id']);
          if (div == null) {
            div = document.createElement('div');
            div.innerHTML = '<img src="img/cursorBrush.png">';
            div.style.position = 'absolute';
            div.style.top = '0';
            div.style.left = '0';
            div.id = 'cursor' + dataAr['id'];
            document.body.appendChild(div);
          }
          div.style.top = dataAr['y'] + 'px';
          div.style.left = dataAr['x'] + 'px';
          console.log(div);
        }
        break;
      case 'exit':
        document.getElementById('cursor' + dataAr['id']).remove();
        break;
    }
  };
  ws.onclose = function() {
    ws = null;
  };
}

function send(object) {
  if (!ws) {
    alert('No WebSocket connection :(');
  } else {
    const data = JSON.stringify(object);
    ws.send(data);
  }
}

document.addEventListener('mousemove', (ev) => {
  send({type: 'cursor', x: ev.pageX, y: ev.pageY, id: id});
});

window.addEventListener('unload', (ev) => {
  send({type: 'exit', id: id});
});

// Init
function initBoardCheme(color) {
  boardCheme = [];
  for (let i = 0; i < size; i++) {
    boardCheme.push([]);
    for (let j = 0; j < size; j++) {
      boardCheme[i].push(color);
    }
  }
}

function startDraw() {
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (i === j) {
        boardCheme[i][j] = '#373770';
      } else if (i + j === 3) {
        boardCheme[i][j] = '#81b5d9';
      } else {
        boardCheme[i][j] = '#f7ff8a';
      }
    }
  }
}


// event listeners for mouse
canvas.addEventListener('mousemove', (ev) => {
  const x = Math.ceil((ev.pageX - canvas.offsetLeft) / pixelsize - 1);
  const y = Math.ceil((ev.pageY - canvas.offsetTop) / pixelsize - 1);
  curPixel = [x, y];
  if (isDrawing) {
    boardCheme[x][y] = curPenColor;
    send({type: 'draw', x: x, y: y, color: curPenColor});
  }
});
canvas.addEventListener('mouseleave', (ev) => {
  curPixel = null;
});
canvas.addEventListener('mousedown', (ev) => {
  if (curInstrument === 'draw') {
    boardCheme[curPixel[0]][curPixel[1]] = curPenColor;
    send({type: 'draw', x: curPixel[0], y: curPixel[1], color: curPenColor});
    isDrawing = true;
  }
});
canvas.addEventListener('mouseup', (ev) => {
  isDrawing = false;
});

function fillPixel(x, y, color) {
  boardCheme[x][y] = curFillColor;
  send({type: 'draw', x: x, y: y, color: curFillColor});
  if ((x - 1) >= 0) {
    if (boardCheme[x - 1][y] === color) {
      fillPixel(x - 1, y, color);
    }
  }
  if ((x + 1) < size) {
    if (boardCheme[x + 1][y] === color) {
      fillPixel(x + 1, y, color);
    }
  }
  if ((y + 1) < size) {
    if (boardCheme[x][y + 1] === color) {
      fillPixel(x, y + 1, color);
    }
  }
  if ((y - 1) >= 0) {
    if (boardCheme[x][y - 1] === color) {
      fillPixel(x, y - 1, color);
    }
  }
}

canvas.addEventListener('click', (ev) => {
  if (curInstrument === 'fill') {
    if (curFillColor !== boardCheme[curPixel[0]][curPixel[1]]) {
      fillPixel(curPixel[0], curPixel[1], boardCheme[curPixel[0]][curPixel[1]]);
    }
  }
});


// instruments

document.getElementById('changeSize').addEventListener('click', (ev) => {
  const res = confirm('При изменении размерности поля, холст будет очищен');
  if (res) {
    const rad = document.getElementsByName('size');
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
    initBoardCheme(curFillColor);
    send({type: 'newSize', size: size, color: curFillColor});
  }
});

document.getElementById('colorPenPick').addEventListener('input', (ev) => {
  curPenColor = ev.target.value;
}, false);
document.getElementById('colorFillPick').addEventListener('input', (ev) => {
  curFillColor = ev.target.value;
}, false);


document.getElementById('fill').addEventListener('click', (ev) => {
  curInstrument = 'fill';
  document.getElementById('fill').classList.add('cur');
  document.getElementById('draw').classList.remove('cur');
});
document.getElementById('draw').addEventListener('click', (ev) => {
  curInstrument = 'draw';
  document.getElementById('draw').classList.add('cur');
  document.getElementById('fill').classList.remove('cur');
});

// hot keys

window.addEventListener('keydown', (ev) => {
  switch (ev.code) {
    case 'KeyB':
      document.getElementById('fill').click();
      break;
    case 'KeyP':
      document.getElementById('draw').click();
      break;
    case 'KeyC':
      if (curInstrument === 'fill') {
        document.getElementById('colorFillPick').click();
      } else {
        document.getElementById('colorPenPick').click();
      }
      break;
  }
});


// repaint canvas

const requestAnimationFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;
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
    ctx.fillStyle = '#a1a1a1';
    if (curPixel != null) {
      ctx.fillRect(curPixel[0] * pixelsize, curPixel[1] * pixelsize,
          pixelsize, pixelsize);
    }
  }

  requestAnimationFrame(repaintBoard);
}

window.requestAnimationFrame(repaintBoard);
