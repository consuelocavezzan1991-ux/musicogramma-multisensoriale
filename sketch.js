let danzaAudio, sarabandaAudio;
let danzaImg, sarabandaImg;

let currentTrack = null;   // puntatore al brano selezionato
let currentImg = null;     // immagine del musicogramma
let currentName = "";      // nome brano per il testo
let isPlaying = false;

// ---------------------------------------------------------------------
//  PRELOAD: carico audio + immagini
// ---------------------------------------------------------------------
function preload() {
  // rinomina i file audio come li hai nel repository, se diverso
  danzaAudio = loadSound("danza.mp3");
  sarabandaAudio = loadSound("sarabanda.mp3");

  // immagini dei musicogrammi
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
  background(255);

  // Se non è stato scelto nessun brano
  if (!currentTrack || !currentImg) {
    fill(80);
    textSize(22);
    text("Seleziona un brano per vedere il musicogramma", width / 2, height / 2);
    return;
  }

  // Disegno il musicogramma al centro
  imageMode(CENTER);
  const imgW = width * 0.8;
  const imgH = height * 0.8;
  image(currentImg, width / 2, height / 2, imgW, imgH);

  // Testo in alto con il nome del brano
  fill(0);
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

  // Se il brano è in riproduzione, disegno il “puntatore” che scorre
  if (currentTrack.isPlaying()) {
    drawPointer();
  }
}

// ---------------------------------------------------------------------
//  FUNZIONE CHE DISEGNA IL PALLINO CHE SCORRE SUL MUSICOGRAMMA
// ---------------------------------------------------------------------
function drawPointer() {
  const t = currentTrack.currentTime();   // tempo corrente
  const d = currentTrack.duration();      // durata totale
  if (d === 0) return;

  const progress = constrain(t / d, 0, 1);  // tra 0 e 1

  // Percorso orizzontale in basso all’immagine
  const marginX = width * 0.1;
  const y = height * 0.88; // leggermente sopra il bordo

  const x = map(progress, 0, 1, marginX, width - marginX);

  // pallino che pulsa
  const baseSize = 22;
  const pulse = 4 * sin(frameCount * 0.2);
  const r = baseSize + pulse;

  noStroke();
  let col;
  if (currentTrack === danzaAudio) {
    col = color(0, 140, 255, 200);     // blu per Danza delle ore
  } else {
    col = color(255, 80, 150, 200);    // rosa per Sarabanda
  }
  fill(col);
  ellipse(x, y, r * 2);
}

// ---------------------------------------------------------------------
//  GESTIONE BRANI
// ---------------------------------------------------------------------
function selectTrack(name) {
  // fermo eventuali brani in esecuzione
  stopTrack();

  if (name === "danza") {
    currentTrack = danzaAudio;
    currentImg = danzaImg;
    currentName = "Danza delle ore";
  } else if (name === "sarabanda") {
    currentTrack = sarabandaAudio;
    currentImg = sarabandaImg;
    currentName = "Sarabanda";
  }

  isPlaying = false;
  setStatus(`Brano selezionato: ${currentName}. Premi "Play" per avviare.`);
}

// Play/Pausa
function togglePlayPause() {
  if (!currentTrack) {
    setStatus("Seleziona prima un brano.");
    return;
  }

  // Sblocco audio (richiesto da alcuni browser)
  userStartAudio().then(() => {
    if (!currentTrack.isPlaying()) {
      currentTrack.play();
      isPlaying = true;
      setStatus(`Riproduzione di: ${currentName}`);
    } else {
      currentTrack.pause();
      isPlaying = false;
      setStatus(`Brano in pausa: ${currentName}`);
    }
  });
}

// Stop totale
function stopTrack() {
  if (danzaAudio && danzaAudio.isPlaying()) {
    danzaAudio.stop();
  }
  if (sarabandaAudio && sarabandaAudio.isPlaying()) {
    sarabandaAudio.stop();
  }
  isPlaying = false;
  setStatus("Riproduzione interrotta.");
}

// ---------------------------------------------------------------------
//  UTILITÀ
// ---------------------------------------------------------------------
function setStatus(msg) {
  const el = document.getElementById("status");
  if (el) el.textContent = msg;
}












