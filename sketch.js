let danzaAudio, sarabandaAudio;
let danzaImg, sarabandaImg;

let currentTrack = null;   // brano selezionato
let currentImg = null;     // immagine del musicogramma
let currentName = "";      // nome brano
let currentPath = null;    // percorso attivo per il pallino

// ---------------------------------------------------------------------
//  PERCORSI DEL PALLINO
//  p = progressione (0 inizio brano, 1 fine brano)
//  u = orizzontale (0 sinistra, 1 destra)
//  v = verticale   (0 alto,    1 basso)
// ---------------------------------------------------------------------

// Danza delle ore – esempio iniziale
let pathDanza = [
  { p: 0.00, u: 0.50, v: 0.05 },
  { p: 0.12, u: 0.30, v: 0.18 },
  { p: 0.25, u: 0.15, v: 0.35 },
  { p: 0.38, u: 0.28, v: 0.50 },
  { p: 0.50, u: 0.50, v: 0.60 },
  { p: 0.62, u: 0.72, v: 0.50 },
  { p: 0.75, u: 0.85, v: 0.35 },
  { p: 0.88, u: 0.70, v: 0.70 },
  { p: 1.00, u: 0.50, v: 0.90 }
];

// Sarabanda – esempio iniziale
let pathSarabanda = [
  { p: 0.00, u: 0.10, v: 0.08 },
  { p: 0.15, u: 0.20, v: 0.25 },
  { p: 0.30, u: 0.30, v: 0.45 },
  { p: 0.45, u: 0.45, v: 0.60 },
  { p: 0.60, u: 0.60, v: 0.50 },
  { p: 0.75, u: 0.75, v: 0.65 },
  { p: 0.90, u: 0.88, v: 0.80 },
  { p: 1.00, u: 0.92, v: 0.92 }
];

// ---------------------------------------------------------------------
//  PRELOAD: carico audio + immagini
// ---------------------------------------------------------------------
function preload() {
  danzaAudio = loadSound("danza.mp3");
  sarabandaAudio = loadSound("sarabanda.mp3");

  danzaImg = loadImage("danza_musicogramma.png");
  sarabandaImg = loadImage("sarabanda_musicogramma.png");
}

// ---------------------------------------------------------------------
//  SETUP
// ---------------------------------------------------------------------
function setup() {
  const canvas = createCanvas(900, 600);
  canvas.parent("canvas-container");

  textAlign(CENTER, CENTER);
  textSize(18);

  // Collego i bottoni HTML
  document.getElementById("btn-danza")
    .addEventListener("click", () => selectTrack("danza"));

  document.getElementById("btn-sarabanda")
    .addEventListener("click", () => selectTrack("sarabanda"));

  document.getElementById("btn-play")
    .addEventListener("click", togglePlayPause);

  document.getElementById("btn-stop")
    .addEventListener("click", stopTrack);

  setStatus("Pronto. Seleziona un brano e poi premi Play.");
}

// ---------------------------------------------------------------------
//  DRAW
// ---------------------------------------------------------------------
function draw() {
  background(244);

  if (!currentTrack || !currentImg) {
    fill(80);
    textSize(22);
    text("Seleziona un brano per vedere il musicogramma", width / 2, height / 2);
    return;
  }

  // Dimensioni del riquadro del musicogramma
  imageMode(CENTER);
  const imgW = width * 0.8;
  const imgH = height * 0.8;

  // Bordo bianco con angoli arrotondati
  fill(255);
  noStroke();
  rectMode(CENTER);
  rect(width / 2, height / 2, imgW + 8, imgH + 8, 18);

  // Disegno il musicogramma
  image(currentImg, width / 2, height / 2, imgW, imgH);

  // Titolo
  fill(20);
  noStroke();
  textSize(26);
  text(currentName, width / 2, 30);

  textSize(14);
  if (currentTrack.isPlaying()) {
    fill(40, 160, 90);
    text("In riproduzione – segui il pallino con il dito", width / 2, 60);
  } else {
    fill(120);
    text("Brano in pausa – premi Play per ascoltare", width / 2, 60);
  }

  if (currentTrack.isPlaying() && currentPath) {
    drawPointer(imgW, imgH);
  }
}

// ---------------------------------------------------------------------
//  DISEGNA IL PALLINO
// ---------------------------------------------------------------------
function drawPointer(imgW, imgH) {
  const t = currentTrack.currentTime();
  const d = currentTrack.duration();
  if (!d || d <= 0) return;

  const progress = constrain(t / d, 0, 1);
  const pos = getPositionAtProgress(progress, currentPath);
  if (!pos) return;

  const imgX = width / 2 - imgW / 2;
  const imgY = height / 2 - imgH / 2;
  const x = imgX + pos.u * imgW;
  const y = imgY + pos.v * imgH;

  const baseSize = 22;
  const pulse = 4 * sin(frameCount * 0.25);
  const r = baseSize + pulse;

  noStroke();
  let col = (currentTrack === danzaAudio) ? color(0, 140, 255, 220) : color(255, 80, 150, 220);
  fill(col);
  ellipse(x, y, r * 2);

  fill(red(col), green(col), blue(col), 70);
  ellipse(x, y, r * 3.2);
}

// ---------------------------------------------------------------------
//  POSIZIONE (u,v) IN BASE AL TEMPO
// ---------------------------------------------------------------------
function getPositionAtProgress(p, path) {
  if (!path || path.length === 0) return null;
  if (p <= path[0].p) return { u: path[0].u, v: path[0].v };

  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    if (p >= p1.p && p <= p2.p) {
      const f = (p - p1.p) / (p2.p - p1.p);
      return { u: lerp(p1.u, p2.u, f), v: lerp(p1.v, p2.v, f) };
    }
  }
  const last = path[path.length - 1];
  return { u: last.u, v: last.v };
}

// ---------------------------------------------------------------------
//  GESTIONE BRANI
// ---------------------------------------------------------------------
function selectTrack(name) {
  stopTrack();

  if (name === "danza") {
    currentTrack = danzaAudio;
    currentImg = danzaImg;
    currentName = "Danza delle ore";
    currentPath = pathDanza;
  } else if (name === "sarabanda") {
    currentTrack = sarabandaAudio;
    currentImg = sarabandaImg;
    currentName = "Sarabanda";
    currentPath = pathSarabanda;
  }

  setStatus(`Brano selezionato: ${currentName}. Premi "Play" per avviare.`);
}

function togglePlayPause() {
  if (!currentTrack) {
    setStatus("Seleziona prima un brano.");
    return;
  }

  userStartAudio().then(() => {
    if (!currentTrack.isPlaying()) {
      currentTrack.play();
      setStatus(`Riproduzione di: ${currentName}`);
    } else {
      currentTrack.pause();
      setStatus(`Brano in pausa: ${currentName}`);
    }
  });
}

function stopTrack() {
  if (danzaAudio && danzaAudio.isPlaying()) danzaAudio.stop();
  if (sarabandaAudio && sarabandaAudio.isPlaying()) sarabandaAudio.stop();
  setStatus("Riproduzione interrotta.");
}

// ---------------------------------------------------------------------
//  UTILITÀ
// ---------------------------------------------------------------------
function setStatus(msg) {
  const el = document.getElementById("status");
  if (el) el.textContent = msg;
}

// ---------------------------------------------------------------------
//  REGISTRAZIONE PERCORSO (console “Aggiungi punto”)
// ---------------------------------------------------------------------
function mousePressed() {
  if (!currentTrack || !currentImg) return;

  const imgW = width * 0.8;
  const imgH = height * 0.8;
  const imgX = width / 2 - imgW / 2;
  const imgY = height / 2 - imgH / 2;

  if (mouseX < imgX || mouseX > imgX + imgW || mouseY < imgY || mouseY > imgY + imgH) return;

  const t = currentTrack.currentTime();
  const d = currentTrack.duration();
  if (!d || d <= 0) return;

  const p = t / d;
  const u = (mouseX - imgX) / imgW;
  const v = (mouseY - imgY) / imgH;

  console.log("Aggiungi punto:", `{ p: ${p.toFixed(2)}, u: ${u.toFixed(2)}, v: ${v.toFixed(2)} },`);
}

// ---------------------------------------------------------------------
//  CONTROLLO DA TASTIERA
//  Barra spaziatrice = Play/Pausa
//  S = Stop
// ---------------------------------------------------------------------
function keyPressed() {
  // Barra spaziatrice → Play/Pausa
  if (key === " ") {
    togglePlayPause();
    return false; // evita scrolling pagina
  }

  // Tasto S → Stop
  if (key === "s" || key === "S") {
    stopTrack();
    return false;
  }
}





