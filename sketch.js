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

  // Disegno il musicogramma al centro
  image(currentImg, width / 2, height / 2, imgW, imgH);

  // Testo in alto con il nome del brano
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

  // Se il brano è in riproduzione, disegno il pallino che segue il percorso
  if (currentTrack.isPlaying() && currentPath) {
    drawPointer(imgW, imgH);
  }
}

// ---------------------------------------------------------------------
//  FUNZIONE CHE DISEGNA IL PALLINO CHE SEGUE IL PERCORSO
// ---------------------------------------------------------------------
function drawPointer(imgW, imgH) {
  const t = currentTrack.currentTime();   // tempo corrente
  const d = currentTrack.duration();      // durata totale
  if (!d || d <= 0) return;

  // progressione 0..1 sul brano
  const progress = constrain(t / d, 0, 1);

  // Calcolo la posizione (u, v) nel percorso al progress
  const pos = getPositionAtProgress(progress, currentPath);
  if (!pos) return;

  // Converto (u, v) in coordinate pixel dentro l'immagine
  const imgX = width / 2 - imgW / 2;
  const imgY = height / 2 - imgH / 2;

  const x = imgX + pos.u * imgW;
  const y = imgY + pos.v * imgH;

  // pallino che pulsa
  const baseSize = 22;
  const pulse = 4 * sin(frameCount * 0.25);
  const r = baseSize + pulse;

  noStroke();
  let col;
  if (currentTrack === danzaAudio) {
    col = color(0, 140, 255, 220);     // blu per Danza delle ore
  } else {
    col = color(255, 80, 150, 220);    // rosa per Sarabanda
  }
  fill(col);
  ellipse(x, y, r * 2);

  // alone leggero attorno
  fill(red(col), green(col), blue(col), 70);
  ellipse(x, y, r * 3.2);
}

// ---------------------------------------------------------------------
//  CALCOLA POSIZIONE (u, v) AL PROGRESS p SUL PERCORSO
// ---------------------------------------------------------------------
function getPositionAtProgress(p, path) {
  if (!path || path.length === 0) return null;

  // Prima del primo punto → resta sul primo
  if (p <= path[0].p) {
    return { u: path[0].u, v: path[0].v };
  }

  // Scorro i segmenti [i, i+1] che contengono p
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];

    if (p >= p1.p && p <= p2.p) {
      const uTime = (p - p1.p) / (p2.p - p1.p); // 0..1
      const u = lerp(p1.u, p2.u, uTime);
      const v = lerp(p1.v, p2.v, uTime);
      return { u, v };
    }
  }

  // Dopo l'ultimo punto → resta sull’ultimo
  const last = path[path.length - 1];
  return { u: last.u, v: last.v };
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
    currentPath = pathDanza;
  } else if (name === "sarabanda") {
    currentTrack = sarabandaAudio;
    currentImg = sarabandaImg;
    currentName = "Sarabanda";
    currentPath = pathSarabanda;
  }

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
      setStatus(`Riproduzione di: ${currentName}`);
    } else {
      currentTrack.pause();
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
//  (OPZIONALE) AIUTO PER FARE UN PERCORSO PIÙ PRECISO
//  Se clicchi dentro il musicogramma mentre suona, vedi in console
//  il punto da copiare dentro pathDanza o pathSarabanda.
// ---------------------------------------------------------------------
function mousePressed() {
  if (!currentTrack || !currentImg) return;

  const imgW = width * 0.8;
  const imgH = height * 0.8;
  const imgX = width / 2 - imgW / 2;
  const imgY = height / 2 - imgH / 2;

  if (
    mouseX < imgX ||
    mouseX > imgX + imgW ||
    mouseY < imgY ||
    mouseY > imgY + imgH
  ) {
    return; // clic fuori dal musicogramma
  }

  const t = currentTrack.currentTime();
  const d = currentTrack.duration();
  if (!d || d <= 0) return;

  const p = t / d;
  const u = (mouseX - imgX) / imgW;
  const v = (mouseY - imgY) / imgH;

  console.log(
    "Aggiungi punto:",
    `{ p: ${p.toFixed(2)}, u: ${u.toFixed(2)}, v: ${v.toFixed(2)} },`
  );
}















