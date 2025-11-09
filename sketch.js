let danzaAudio, sarabandaAudio;
let currentTrack = null;
let currentName = "";
let ampAnalyzer;
let animOffset = 0;
let ready = false;

function preload() {
  danzaAudio = loadSound("assets/danza.mp3");
  sarabandaAudio = loadSound("assets/sarabanda.mp3");
}

function setup() {
  createCanvas(900, 600).parent("canvas-container");
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
  userStartAudio(); // attiva l'audio se bloccato
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

// Timeline semplificata
let danzaTimeline = [
  { time: 2, type: "zigzag", x: 100, y: 150, col: "red" },
  { time: 4, type: "smile", x: 250, y: 200, col: "orange" },
  { time: 6, type: "swirl", x: 400, y: 250, col: "green" },
  { time: 8, type: "wave", x: 100, y: 350, col: "blue" },
];

let sarabandaTimeline = [
  { time: 2, type: "pill", x: 160, y: 130, col: "red" },
  { time: 4, type: "dot", x: 450, y: 130, col: "red" },
  { time: 6, type: "pill", x: 740, y: 130, col: "red" },
  { time: 8, type: "pill", x: 160, y: 185, col: "orange" },
  { time: 10, type: "dot", x: 450, y: 185, col: "orange" },
];

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





