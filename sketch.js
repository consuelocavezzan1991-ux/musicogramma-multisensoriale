// ---------------------------------------------------------------------------
//  MUSICOGRAMMA MULTISENSORIALE - sketch.js
// ---------------------------------------------------------------------------

let danzaAudio;
let sarabandaAudio;

let currentTrack = null;
let currentName = "";
let ready = false;

// Offset usato per animare le forme
let animOffset = 0;

// Analizzatore di ampiezza (per muovere le linee a tempo)
let ampAnalyzer;

// ---------------------------------------------------------------------------
//  Caricamento dei suoni
// ---------------------------------------------------------------------------

function preload() {
  // ATTENZIONE: i nomi devono coincidere con i file presenti nel repo
  danzaAudio = loadSound("danza.mp3", () => {
    console.log("Danza caricata");
  });
  sarabandaAudio = loadSound("sarabanda.mp3", () => {
    console.log("Sarabanda caricata");
  });
}

// ---------------------------------------------------------------------------
//  Setup iniziale
// ---------------------------------------------------------------------------

function setup() {
  const canvas = createCanvas(900, 750);
  canvas.parent("canvas-container");

  background(245);
  textAlign(CENTER, CENTER);
  textSize(22);
  fill(0);
  text("Seleziona un brano e premi Play", width / 2, height / 2);

  // Analizzatore di volume
  ampAnalyzer = new p5.Amplitude();
  ampAnalyzer.smooth(0.6); // un po' di smoothing per non avere scatti

  // Collego i pulsanti HTML alle funzioni JS
  document.getElementById("btn-danza").addEventListener("click", () => {
    selectTrack("danza");
  });

  document.getElementById("btn-sarabanda").addEventListener("click", () => {
    selectTrack("sarabanda");
  });

  document.getElementById("btn-play").addEventListener("click", () => {
    playTrack();
  });

  document.getElementById("btn-stop").addEventListener("click", () => {
    stopTrack();
  });

  ready = true;
  setStatus("Pronto. Seleziona un brano.");
}

// ---------------------------------------------------------------------------
//  Loop di disegno
// ---------------------------------------------------------------------------

function draw() {
  if (!ready) return;

  background(245);

  // Se non è stato scelto nessun brano, messaggio neutro
  if (!currentTrack) {
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(22);
    text("Seleziona un brano e premi Play", width / 2, height / 2);
    return;
  }

  // Se il brano è in play, prendo il livello di volume (0–1 circa)
  if (currentTrack.isPlaying()) {
    let level = ampAnalyzer.getLevel();
    // Trasformo il livello (di solito < 0.3) in un offset in pixel
    animOffset = map(level, 0, 0.3, 0, 20);
    animOffset = constrain(animOffset, 0, 25);
  } else {
    animOffset = 0;
  }

  // Disegno il musicogramma stilizzato in base al brano selezionato
  if (currentName === "Danza delle ore") {
    drawDanzaScore();
  } else if (currentName === "Sarabanda") {
    drawSarabandaScore();
  }

  // Titolo del brano
  noStroke();
  fill(0);
  textAlign(CENTER, TOP);
  textSize(32);
  text(currentName, width / 2, 20);

  // Stato di riproduzione
  textSize(16);
  if (currentTrack.isPlaying()) {
    fill(40, 160, 90);
    text("In riproduzione (le forme si muovono a tempo)", width / 2, 58);
  } else {
    fill(120);
    text("Brano in pausa (premi Play per ascoltare)", width / 2, 58);
  }
}

// ---------------------------------------------------------------------------
//  Selezione e controllo dei brani
// ---------------------------------------------------------------------------

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

  if (!currentTrack.isPlaying()) {
    currentTrack.play();
    // Collego l'analizzatore di ampiezza al brano scelto
    ampAnalyzer.setInput(currentTrack);
    setStatus(`Riproduzione di: ${currentName}`);
  }
}

function stopTrack() {
  if (danzaAudio && danzaAudio.isPlaying()) {
    danzaAudio.stop();
  }
  if (sarabandaAudio && sarabandaAudio.isPlaying()) {
    sarabandaAudio.stop();
  }
  setStatus("Riproduzione interrotta.");
}

function setStatus(msg) {
  const el = document.getElementById("status");
  if (el) el.textContent = msg;
}

// ---------------------------------------------------------------------------
//                   MUSICOGRAMMA "DANZA DELLE ORE"
// ---------------------------------------------------------------------------

function drawZigZag(x, y, segW, amp, nSeg, col) {
  stroke(col);
  strokeWeight(4);
  noFill();
  beginShape();
  let dir = -1;
  for (let i = 0; i <= nSeg; i++) {
    const xx = x + i * segW;
    const yy = y + dir * (amp + animOffset * 0.4); // ampiezza varia col volume
    vertex(xx, yy);
    dir *= -1;
  }
  endShape();
}

function drawSmile(x, y, r, col) {
  noFill();
  stroke(col);
  strokeWeight(4);
  // l'arco sale e scende leggermente col volume
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

function drawDanzaScore() {
  const red = color(240, 60, 70);
  const orange = color(255, 170, 70);
  const green = color(60, 190, 110);
  const blue = color(50, 170, 255);

  const colStart = 80;
  const colStep = 150;
  const rowGap = 55;
  const topY = 120;

  // 3 righe di zig-zag rossi (4 colonne)
  for (let r = 0; r < 3; r++) {
    const y = topY + r * rowGap;
    for (let c = 0; c < 4; c++) {
      const x = colStart + c * colStep;
      drawZigZag(x, y, 25, 15, 4, red);
    }
  }

  // Riga di archi arancioni + ricciolo verde a destra
  let ySmile1 = topY + 3 * rowGap;
  for (let c = 0; c < 3; c++) {
    const x = colStart + (c + 0.5) * colStep;
    drawSmile(x, ySmile1, 40, orange);
  }
  drawSwirl(width - 130, ySmile1 - 10, 35, green);

  // Seconda riga di archi + ricciolo verde a sinistra
  let ySmile2 = ySmile1 + rowGap;
  for (let c = 0; c < 3; c++) {
    const x = colStart + (c + 0.5) * colStep;
    drawSmile(x, ySmile2, 40, orange);
  }
  drawSwirl(colStart + 20, ySmile2 + 10, 35, green);

  // Due grandi "onde" azzurre al centro
  stroke(blue);
  strokeWeight(5);
  noFill();

  let baseY1 = ySmile2 + 80;
  beginShape();
  for (let x = 80; x < width - 80; x += 12) {
    const y = baseY1 + sin(x * 0.15) * (15 + animOffset * 0.5);
    vertex(x, y);
  }
  endShape();

  let baseY2 = baseY1 + 60;
  beginShape();
  for (let x = 80; x < width - 80; x += 12) {
    const y = baseY2 + sin(x * 0.15) * (15 + animOffset * 0.5);
    vertex(x, y);
  }
  endShape();

  // Coda finale in basso: piccolo zig-zag rosso + onda corta azzurra
  let baseY3 = baseY2 + 80;
  drawZigZag(colStart + 60, baseY3, 25, 15, 4, red);

  beginShape();
  for (let x = colStart; x < colStart + 120; x += 10) {
    const y = baseY3 + 40 + sin(x * 0.25) * (8 + animOffset * 0.4);
    vertex(x, y);
  }
  endShape();
}

// ---------------------------------------------------------------------------
//                   MUSICOGRAMMA "SARABANDA"
// ---------------------------------------------------------------------------

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

function drawSarabandaScore() {
  // Colori di base (vicini al tuo esempio)
  const red = color(255, 90, 60);
  const orange = color(255, 170, 70);
  const yellow = color(255, 210, 90);
  const green = color(80, 200, 120);
  const cyan = color(0, 190, 230);
  const blue = color(60, 90, 255);
  const violet = color(140, 80, 255);
  const pink = color(240, 90, 210);

  const leftX = 160;
  const midX = width / 2;
  const rightX = width - 160;
  const rowStep = 55;
  const startY = 130;
  const pillW = 150;
  const pillH = 18;
  const dotD = 26;

  let y = startY;

  // Riga 1 – rosso
  drawPill(leftX,  y + animOffset * 0.3, pillW, pillH, red);
  drawPill(rightX, y + animOffset * 0.3, pillW, pillH, red);
  drawDot(midX,  y + animOffset * 0.4, dotD, red);

  // Riga 2 – arancione
  y += rowStep;
  drawPill(leftX,  y - animOffset * 0.3, pillW, pillH, orange);
  drawPill(rightX, y - animOffset * 0.3, pillW, pillH, orange);
  drawDot(midX,  y - animOffset * 0.4, dotD, orange);

  // Riga 3 – giallo
  y += rowStep;
  drawPill(leftX,  y + animOffset * 0.3, pillW, pillH, yellow);
  drawPill(rightX, y + animOffset * 0.3, pillW, pillH, yellow);
  drawDot(midX,  y + animOffset * 0.4, dotD, yellow);

  // Riga 4 – verde
  y += rowStep;
  drawPill(leftX,  y - animOffset * 0.3, pillW, pillH, green);
  drawPill(rightX, y - animOffset * 0.3, pillW, pillH, green);
  drawDot(midX,  y - animOffset * 0.4, dotD, green);

  // Riga 5 – azzurro
  y += rowStep;
  drawPill(leftX,  y + animOffset * 0.3, pillW, pillH, cyan);
  drawPill(rightX, y + animOffset * 0.3, pillW, pillH, cyan);
  drawDot(midX,  y + animOffset * 0.4, dotD, cyan);

  // Riga 6 – blu
  y += rowStep;
  drawPill(leftX,  y - animOffset * 0.3, pillW, pillH, blue);
  drawPill(rightX, y - animOffset * 0.3, pillW, pillH, blue);
  drawDot(midX,  y - animOffset * 0.4, dotD, blue);

  // Riga 7 – rosa
  y += rowStep;
  drawPill(leftX,  y + animOffset * 0.3, pillW, pillH, pink);
  drawPill(rightX, y + animOffset * 0.3, pillW, pillH, pink);
  drawDot(midX,  y + animOffset * 0.4, dotD, pink);

  // Parte bassa: piccola frase finale (zig-zag + pill + tre pallini)
  y += rowStep + 40;

  // zig-zag multicolore in basso a sinistra
  strokeWeight(5);
  noFill();

  stroke(red);
  beginShape();
  vertex(80,  y + 40 + animOffset * 0.3);
  vertex(140, y + animOffset * 0.3);
  stroke(orange);
  vertex(200, y + 40 + animOffset * 0.3);
  stroke(green);
  vertex(260, y + animOffset * 0.3);
  endShape();

  // pill azzurra a destra
  drawPill(width / 2 + 150, y + 15 + animOffset * 0.3, 130, pillH, cyan);

  // tre pallini blu
  drawDot(width / 2 + 40,  y + 70 + animOffset * 0.3, dotD, blue);
  drawDot(width / 2 + 90,  y + 70 + animOffset * 0.4, dotD, blue);
  drawDot(width / 2 + 140, y + 70 + animOffset * 0.3, dotD, blue);

  // ultima riga in basso (due pill rosa/viola)
  y += rowStep + 40;
  drawPill(leftX,  y + animOffset * 0.3, pillW, pillH, pink);
  drawPill(rightX, y + animOffset * 0.3, pillW, pillH, violet);
}



