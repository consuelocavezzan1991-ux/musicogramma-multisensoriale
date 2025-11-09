let danzaAudio, sarabandaAudio;
let currentTrack = null;
let currentName = "";
let ready = false;
let ampAnalyzer;
let animOffset = 0;

// Timeline per DANZA DELLE ORE
let danzaTimeline = [
  { time: 2, type: "zigzag", x: 100, y: 150, col: "red" },
  { time: 4, type: "zigzag", x: 250, y: 150, col: "red" },
  { time: 6, type: "zigzag", x: 400, y: 150, col: "red" },
  { time: 8, type: "smile", x: 200, y: 250, col: "orange" },
  { time: 10, type: "smile", x: 350, y: 250, col: "orange" },
  { time: 12, type: "swirl", x: 500, y: 250, col: "green" },
  { time: 14, type: "wave", x: 100, y: 350, col: "blue" },
  { time: 16, type: "wave", x: 100, y: 410, col: "blue" },
  { time: 18, type: "zigzag", x: 160, y: 520, col: "red" },
  { time: 20, type: "wave", x: 160, y: 560, col: "blue" },
];

// Timeline per SARABANDA
let sarabandaTimeline = [
  { time: 2, type: "pill", x: 160, y: 130, col: "red" },
  { time: 4, type: "dot", x: 450, y: 130, col: "red" },
  { time: 6, type: "pill", x: 740, y: 130, col: "red" },
  { time: 8, type: "pill", x: 160, y: 185, col: "orange" },
  { time: 10, type: "dot", x: 450, y: 185, col: "orange" },
  { time: 12, type: "pill", x: 740, y: 185, col: "orange" },
  { time: 14, type: "pill", x: 160, y: 240, col: "yellow" },
  { time: 16, type: "dot", x: 450, y: 240, col: "yellow" },
  { time: 18, type: "pill", x: 740, y: 240, col: "yellow" },
  { time: 20, type: "pill", x: 160, y: 295, col: "green" },
  { time: 22, type: "dot", x: 450, y: 295, col: "green" },
  { time: 24, type: "pill", x: 740, y: 295, col: "green" },
  { time: 26, type: "pill", x: 160, y: 350, col: "cyan" },
  { time: 28, type: "dot", x: 450, y: 350, col: "cyan" },
  { time: 30, type: "pill", x: 740, y: 350, col: "cyan" },
  { time: 32, type: "pill", x: 160, y: 405, col: "blue" },
  { time: 34, type: "dot", x: 450, y: 405, col: "blue" },
  { time: 36, type: "pill", x: 740, y: 405, col: "blue" },
  { time: 38, type: "pill", x: 160, y: 460, col: "pink" },
  { time: 40, type: "dot", x: 450, y: 460, col: "pink" },
  { time: 42, type: "pill", x: 740, y: 460, col: "violet" },
];

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

  if (!currentTrack) {
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(22);
    text("Seleziona un brano e premi Play", width / 2, height / 2);
    return;
  }

  animOffset = currentTrack.isPlaying() ? map(ampAnalyzer.getLevel(), 0, 0.3, 0, 25) : 0;

  let t = currentTrack.currentTime();
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
  text(currentTrack.isPlaying() ? "In riproduzione (forme sincronizzate)" : "Brano in pausa", width / 2, 58);
}

function drawEvent(ev) {
  let col = color(ev.col);
  if (ev.type === "zigzag") drawZigZag(ev.x, ev.y, 25, 15, 4, col);
  else if (ev.type === "smile") drawSmile(ev.x, ev.y, 40, col);
  else if (ev.type === "swirl") drawSwirl(ev.x, ev.y, 35, col);
  else if (ev.type === "wave") {
    stroke(col);
    strokeWeight(5);
    noFill();
    beginShape();
    for (let x = ev.x; x < ev.x + 200; x += 12) {
      const y = ev.y + sin(x * 0.15) * (15 + animOffset * 0.5);
      vertex(x, y);
    }
    endShape();
  } else if (ev.type === "pill") drawPill(ev.x, ev.y + animOffset * 0.3, 150, 18, col);
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

function drawPill(x, y, w, h, col) {
  noStroke();
  fill(col);
  rectMode(CENTER);
  rect(x, y, w, h, h / 2);
}

function drawDot(x,
