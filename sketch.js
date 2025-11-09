let danzaAudio, sarabandaAudio;
let currentTrack = null;
let currentName = "";
let ampAnalyzer;
let animOffset = 0;
let ready = false;
let audioOffset = 0.8; // compensazione per il silenzio iniziale

function preload() {
  danzaAudio = loadSound("danza.mp3");
  sarabandaAudio = loadSound("sarabanda.mp3");
}

function setup() {
  createCanvas(900, 750).parent("canvas-container");
  ampAnalyzer = new p5.Amplitude();
  ampAnalyzer.smooth(0.6);

  document.getElementById("btn-danza").addEventListener("click", () => selectTrack("danza"));
  document.getElementById("btn-sarabanda").addEventListener("click", () => selectTrack("sarabanda"));
  document.getElementById("btn-play").addEventListener("click", () => playTrack());
  document.getElementById("btn-stop").addEventListener("click", () => stopTrack());

  ready = true;
  setStatus("Pronto. Seleziona un brano.");
}

function draw() {
  if (!ready) return;
  background(245);

  if (!currentTrack) return;

  animOffset = currentTrack.isPlaying() ? map(ampAnalyzer.getLevel(), 0, 0.3, 0, 25) : 0;
  let t = currentTrack.currentTime() - audioOffset;

  let timeline = currentName === "Danza delle ore" ? danzaTimeline : sarabandaTimeline;
  for (let ev of timeline) {
    if (t >= ev.time) drawEvent(ev);
  }

  fill(0);
  textAlign(CENTER, TOP);
  textSize(32);
  text(currentName, width / 2, 20);
  textSize(16);
  fill(currentTrack.isPlaying() ? color(40, 160, 90) : 120);
  text(currentTrack.isPlaying() ? "In riproduzione" : "Brano in pausa", width / 2, 58);
}

function selectTrack(name) {
  stopTrack();
  if (name === "danza") {
    currentTrack = danzaAudio;
    currentName = "Danza delle ore";
  } else if (name === "sarabanda") {
    currentTrack = sarabandaAudio;
    currentName = "Sarabanda";
  }
  setStatus(`Brano selezionato: ${currentName}. Premi "Play".`);
}

function playTrack() {
  if (!currentTrack) {
    setStatus("Seleziona prima un brano.");
    return;
  }
  userStartAudio();
  if (!currentTrack.isPlaying()) {
    currentTrack.play();
    ampAnalyzer.setInput(currentTrack);
    setStatus(`Riproduzione di: ${currentName}`);
  }
}

function stopTrack() {
  if (danzaAudio && danzaAudio.isPlaying()) danzaAudio.stop();
  if (sarabandaAudio && sarabandaAudio.isPlaying()) sarabandaAudio.stop();
  setStatus("Riproduzione interrotta.");
}

function setStatus(msg) {
  const el = document.getElementById("status");
  if (el) el.textContent = msg;
}

// ---------------------------------------------------------------------------
// 🎨 Disegno forme
// ---------------------------------------------------------------------------

function drawEvent(ev) {
  let col = color(ev.col);
  if (ev.type === "zigzag") drawZigZag(ev.x, ev.y, 25, 15, 4, col);
  else if (ev.type === "smile") drawSmile(ev.x, ev.y, 40, col);
  else if (ev.type === "swirl") drawSwirl(ev.x, ev.y, 35, col);
  else if (ev.type === "wave") drawWave(ev.x, ev.y, col);
  else if (ev.type === "pill") drawPill(ev.x, ev.y + animOffset * 0.3, 150, 18, col);
  else if (ev.type === "dot") drawDot(ev.x, ev.y + animOffset * 0.4, 26, col);
}

function drawZigZag(x, y, segW, amp, nSeg, col) {
  stroke(col);
  strokeWeight(4);
  noFill();
  beginShape();
  let dir = -1;
  for (let i = 0; i <= nSeg; i++) {
    const xx = x + i * segW;
    const yy = y + dir * (amp + animOffset * 0.4);
    vertex(xx, yy);
    dir *= -1;
  }
  endShape();
}

function drawSmile(x, y, r, col) {
  noFill();
  stroke(col);
  strokeWeight(4);
  arc(x, y + animOffset * 0.3, r, r, PI, 0);
}

function drawSwirl(x, y, scale, col) {
  noFill();
  stroke(col);
  strokeWeight(4);
  beginShape();
  for (let a = PI; a > -0.1; a -= 0.2) {
    const r = scale * (1.2 - a / PI);
    const xx = x + cos(a) * r;
    const yy = y + sin(a) * r + animOffset * 0.3;
    vertex(xx, yy);
  }
  endShape();
}

function drawWave(x, y, col) {
  stroke(col);
  strokeWeight(5);
  noFill();
  beginShape();
  for (let i = 0; i < 200; i += 12) {
    const xx = x + i;
    const yy = y + sin(i * 0.15) * (15 + animOffset * 0.5);
    vertex(xx, yy);
  }
  endShape();
}

function drawPill(x, y, w, h, col) {
  noStroke();
  fill(col);
  rectMode(CENTER);
  rect(x, y, w, h, h / 2);
}

function drawDot(x, y, d, col) {
  noStroke();
  fill(col);
  ellipse(x, y, d, d);
}

// ---------------------------------------------------------------------------
// 🕒 Timeline "Danza delle ore"
// ---------------------------------------------------------------------------

let danzaTimeline = [
  { time: 2.0, type: "zigzag", x: 80, y: 120, col: "red" },
  { time: 3.0, type: "zigzag", x: 230, y: 120, col: "red" },
  { time: 4.0, type: "zigzag", x: 380, y: 120, col: "red" },
  { time: 5.0, type: "zigzag", x: 530, y: 120, col: "red" },

  { time: 6.5, type: "smile", x: 155, y: 230, col: "orange" },
  { time: 7.5, type: "smile", x: 305, y: 230, col: "orange" },
  { time: 8.5, type: "smile", x: 455, y: 230, col: "orange" },

  { time: 9.5, type: "swirl", x: 770, y: 220, col: "green" },

  { time: 10.5, type: "wave", x: 80, y: 370, col: "blue" },
  { time: 12.0, type: "wave", x: 80, y: 430, col: "blue" },

  { time: 14.0, type: "zigzag", x: 140, y: 530, col: "red" },
  { time: 15.0, type: "wave", x: 140, y: 570, col: "blue" }
];

// ---------------------------------------------------------------------------
// 🕒 Timeline "Sarabanda"
// ---------------------------------------------------------------------------

let sarabandaTimeline = [
  { time: 2, type: "pill", x: 160, y: 130, col: "red" },
  { time: 3, type: "pill", x: 740, y: 130, col: "red" },
  { time: 4, type: "dot", x: 450, y: 130, col: "red" },

  { time: 6, type: "pill", x: 160, y: 185, col: "orange" },
  { time: 7, type: "pill", x: 740, y: 185, col: "orange" },
  { time: 8, type: "dot", x: 450, y: 185, col: "orange" },

  { time: 10, type: "pill", x: 160, y: 240, col: "yellow" },
  { time: 11, type: "pill", x: 740, y: 240, col: "yellow" },
  { time: 12, type: "dot", x: 450, y: 240, col: "yellow" },

  { time: 14, type: "pill", x: 160, y: 295, col: "green" },
  { time: 15, type: "pill", x: 740, y: 295, col: "green" },
  { time: 16, type: "dot", x: 450, y: 295, col: "green" },

  { time: 18, type: "pill", x: 160, y: 350, col: "cyan" },
  { time: 19, type: "pill", x: 740, y: 350, col: "cyan" },
  { time: 20, type: "dot", x: 450, y: 350, col: "cyan" },

  { time: 22, type: "pill", x: 160, y: 405, col: "blue" },
  { time: 23, type: "pill", x: 740, y: 405, col: "blue" },
  { time: 24, type: "dot", x: 450, y: 405, col: "blue" },

  { time: 26, type: "pill", x: 160, y: 460, col: "pink" },
  { time: 27, type: "pill", x: 740, y: 460, col: "violet" },

  { time: 28, type: "zigzag", x: 80, y: 530, col: "red" },
  { time: 29, type: "zigzag", x: 140, y: 500, col: "orange" },
  { time: 30, type: "zigzag", x: 200, y: 530, col: "green" },
  { time: 31, type: "zigzag", x: 260, y: 500, col: "green" },

  { time: 32, type: "pill", x: 600, y: 520, col: "cyan" },
  { time: 33, type: "dot", x: 540, y: 580, col: "blue" },
  { time: 34, type: "dot", x: 590, y: 580, col: "blue" },
  { time: 35, type: "dot", x: 640, y: 580, col: "blue" },

  { time: 36, type: "pill", x: 160, y: 630, col: "pink" },
  { time: 37, type: "pill", x: 740, y: 630, col: "violet" }
];




