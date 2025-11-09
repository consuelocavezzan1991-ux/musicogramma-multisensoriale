// --- Audio e stato generale -------------------------------------------------

let danzaAudio;
let sarabandaAudio;
let currentTrack = null;
let currentName = "";
let ready = false;

function preload() {
  // ATTENZIONE: i nomi devono coincidere con i file nel repo!
  danzaAudio = loadSound("danza.mp3", () => {
    console.log("Danza caricata");
  });
  sarabandaAudio = loadSound("sarabanda.mp3", () => {
    console.log("Sarabanda caricata");
  });
}

function setup() {
  // canvas più alto per avere spazio per il musicogramma
  const canvas = createCanvas(800, 600);
  canvas.parent("canvas-container");

  background(245);
  textAlign(CENTER, CENTER);
  textSize(20);
  fill(0);
  text("Seleziona un brano e premi Play", width / 2, height / 2);

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
  textSize(26);
  text(currentName, width / 2, 20);

  // Stato di riproduzione
  textSize(14);
  if (currentTrack.isPlaying()) {
    fill(40, 160, 90);
    text("In riproduzione", width / 2, 55);
  } else {
    fill(120);
    text("Brano in pausa (premi Play per ascoltare)", width / 2, 55);
  }
}

// --- Selezione e controllo dei brani ----------------------------------------

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
    const yy = y + dir * amp;
    vertex(xx, yy);
    dir *= -1;
  }
  endShape();
}

function drawSmile(x, y, r, col) {
  noFill();
  stroke(col);
  strokeWeight(4);
  arc(x, y, r, r, PI, 0);
}

function drawSwirl(x, y, scale, col) {
  noFill();
  stroke(col);
  strokeWeight(4);
  beginShape();
  for (let a = PI; a > -0.1; a -= 0.2) {
    const r = scale * (1.2 - a / PI);
    const xx = x + cos(a) * r;
    const yy = y + sin(a) * r;
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
  const rowGap = 50;
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
    const y = baseY1 + sin(x * 0.15) * 15;
    vertex(x, y);
  }
  endShape();

  let baseY2 = baseY1 + 60;
  beginShape();
  for (let x = 80; x < width - 80; x += 12) {
    const y = baseY2 + sin(x * 0.15) * 15;
    vertex(x, y);
  }
  endShape();

  // Coda finale in basso: piccolo zig-zag rosso + onda corta azzurra
  let baseY3 = baseY2 + 80;
  drawZigZag(colStart + 60, baseY3, 25, 15, 4, red);

  beginShape();
  for (let x = colStart; x < colStart + 120; x += 10) {
    const y = baseY3 + 40 + sin(x * 0.25) * 8;
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

  const leftX = 140;
  const midX = width / 2;
  const rightX = width - 140;
  const rowStep = 55;
  const startY = 110;
  const pillW = 150;
  const pillH = 18;
  const dotD = 26;

  // Riga 1 – rosso
  let y = startY;
  drawPill(leftX, y, pillW, pillH, red);
  drawPill(rightX, y, pillW, pillH, red);
  drawDot(midX, y, dotD, red);

  // Riga 2 – arancione
  y += rowStep;
  drawPill(leftX, y, pillW, pillH, orange);
  drawPill(rightX, y, pillW, pillH, orange);
  drawDot(midX, y, dotD, orange);

  // Riga 3 – giallo
  y += rowStep;
  drawPill(leftX, y, pillW, pillH, yellow);
  drawPill(rightX, y, pillW, pillH, yellow);
  drawDot(midX, y, dotD, yellow);

  // Riga 4 – verde
  y += rowStep;
  drawPill(leftX, y, pillW, pillH, green);
  drawPill(rightX, y, pillW, pillH, green);
  drawDot(midX, y, dotD, green);

  // Riga 5 – azzurro
  y += rowStep;
  drawPill(leftX, y, pillW, pillH, cyan);
  drawPill(rightX, y, pillW, pillH, cyan);
  drawDot(midX, y, dotD, cyan);

  // Riga 6 – blu
  y += rowStep;
  drawPill(leftX, y, pillW, pillH, blue);
  drawPill(rightX, y, pillW, pillH, blue);
  drawDot(midX, y, dotD, blue);

  // Riga 7 – rosa
  y += rowStep;
  drawPill(leftX, y, pillW, pillH, pink);
  drawPill(rightX, y, pillW, pillH, pink);
  drawDot(midX, y, dotD, pink);

  // Parte bassa: piccola frase finale (zig-zag + pill + tre pallini)
  y += rowStep + 40;

  // zig-zag multicolore in basso a sinistra
  strokeWeight(5);
  noFill();

  stroke(red);
  beginShape();
  vertex(80, y + 40);
  vertex(140, y);
  stroke(orange);
  vertex(200, y + 40);
  stroke(green);
  vertex(260, y);
  endShape();

  // pill azzurra a destra
  drawPill(width / 2 + 140, y + 15, 130, pillH, cyan);

  // tre pallini blu
  drawDot(width / 2 + 40, y + 70, dotD, blue);
  drawDot(width / 2 + 90, y + 70, dotD, blue);
  drawDot(width / 2 + 140, y + 70, dotD, blue);

  // ultima riga in basso (due pill rosa/viola)
  y += rowStep + 40;
  drawPill(leftX, y, pillW, pillH, pink);
  drawPill(rightX, y, pillW, pillH, violet);
}
