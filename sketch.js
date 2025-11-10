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

// Danza delle ore – parte dall'alto, scende e fa una S
let pathDanza = [
  { p: 0.00, u: 0.50, v: 0.05 }, // in alto al centro
  { p: 0.12, u: 0.30, v: 0.18 },
  { p: 0.25, u: 0.15, v: 0.35 },
  { p: 0.38, u: 0.28, v: 0.50 },
  { p: 0.50, u: 0.50, v: 0.60 },
  { p: 0.62, u: 0.72, v: 0.50 },
  { p: 0.75, u: 0.85, v: 0.35 },
  { p: 0.88, u: 0.70, v: 0.70 },
  { p: 1.00, u: 0.50, v: 0.90 }  // in basso al centro
];

// Sarabanda – parte in alto a sinistra, va verso destra a onda
let pathSarabanda = [
  { p: 0.00, u: 0.10, v: 0.08 }, // in alto a sinistra
  { p: 0.15, u: 0.20, v: 0.25 },
  { p: 0.30, u: 0.30, v: 0.45 },
  { p: 0.45, u: 0.45, v: 0.60 },
  { p: 0.60, u: 0.60, v: 0.50 },
  { p: 0.75, u: 0.75, v: 0.65 },
  { p: 0.90, u: 0.88, v: 0.80 },
  { p: 1.00, u: 0.92, v: 0.92 }  // in basso a destra
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

  // Se non è stato scelto nessun brano
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















