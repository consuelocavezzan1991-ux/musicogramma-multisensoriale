let danzaAudio, sarabandaAudio;
let currentTrack = null;
let currentName = "";
let fft;
let amplitude;
let ready = false;

// qui memorizziamo i punti del "sentiero" da seguire con il dito
let pathPoints = [];

function preload() {
  // I nomi dei file devono essere esattamente questi nel repo
  danzaAudio = loadSound("danza.mp3");
  sarabandaAudio = loadSound("sarabanda.mp3");
}

function setup() {
  const canvas = createCanvas(800, 400);
  canvas.parent("canvas-container");

  fft = new p5.FFT();
  amplitude = new p5.Amplitude();

  // Collego i pulsanti HTML
  document.getElementById("btn-danza").addEventListener("click", () => selectTrack("danza"));
  document.getElementById("btn-sarabanda").addEventListener("click", () => selectTrack("sarabanda"));
  document.getElementById("btn-play").addEventListener("click", playTrack);
  document.getElementById("btn-stop").addEventListener("click", stopTrack);

  ready = true;
  setStatus("Pronto. Seleziona un brano.");
}

function draw() {
  if (!ready) return;
  background(245);

  // cornice leggera
  noFill();
  stroke(200);
  rect(30, 80, width - 60, height - 140, 20);

  // se non è selezionato nulla
  if (!currentTrack) {
    fill(100);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Seleziona un brano e premi Play", width / 2, height / 2);
    return;
  }

  // titolo del brano
  fill(0);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(22);
  text(currentName, width / 2, 20);

  // stato riproduzione
  textSize(14);
  if (currentTrack.isPlaying()) {
    fill(40, 160, 90);
    text("In riproduzione – segui la linea con il dito", width / 2, 50);
  } else {
    fill(120);
    text("Brano in pausa (premi Play per ascoltare)", width / 2, 50);
  }

  // se il brano non suona, disegno comunque il percorso già creato
  if (!currentTrack.isPlaying()) {
    drawPath();
    return;
  }

  // --- ANALISI DEL SUONO ---
  let level = amplitude.getLevel();
  let spectrum = fft.analyze();

  // energia nelle bande di frequenza
  let low = fft.getEnergy("bass");
  let mid = fft.getEnergy("mid");
  let high = fft.getEnergy("treble");

  // mappo il tempo corrente del brano su x (da sinistra a destra)
  let t = currentTrack.currentTime();
  let d = currentTrack.duration();
  let x;
  if (d > 0) {
    x = map(t, 0, d, 40, width - 40);
  } else {
    // fallback se la durata non è disponibile
    x = map(frameCount % 600, 0, 600, 40, width - 40);
  }

  // y in base all'intensità (livello volume)
  let y = map(level, 0, 0.4, height - 90, 110);
  y = constrain(y, 110, height - 90);

  // colore del segmento in base alle frequenze dominanti
  let col;
  if (low >= mid && low >= high) {
    // prevalgono le basse → colore caldo
    col = currentName === "Danza delle ore"
      ? color(255, 120, 80)   // arancio / rosso
      : color(210, 90, 90);   // rosso più scuro
  } else if (mid >= low && mid >= high) {
    // prevalgono le medie → verde / giallo
    col = currentName === "Danza delle ore"
      ? color(120, 200, 120)
      : color(180, 190, 80);
  } else {
    // prevalgono le alte → blu / viola
    col = currentName === "Danza delle ore"
      ? color(80, 160, 255)
      : color(150, 120, 220);
  }

  // tipo di "forma" associata (per varietà visiva)
  let shapeType;
  if (low >= mid && low >= high) shapeType = "onda";      // basse
  else if (mid >= low && mid >= high) shapeType = "pill"; // medie
  else shapeType = "dot";                                 // alte

  // salvo il punto nel percorso
  pathPoints.push({ x, y, col, shapeType });

  // tengo la memoria entro un numero fisso di punti
  if (pathPoints.length > 400) {
    pathPoints.shift();
  }

  // disegno il percorso completo
  drawPath();
}

// ---------------------------------------------------------------------------
//                DISEGNO DEL "SENTIERO" DA SEGUIRE COL DITO
// ---------------------------------------------------------------------------

function drawPath() {
  if (pathPoints.length < 2) return;

  // linee colorate
  for (let i = 1; i < pathPoints.length; i++) {
    let p0 = pathPoints[i - 1];
    let p1 = pathPoints[i];

    stroke(p1.col);
    strokeWeight(6);
    line(p0.x, p0.y, p1.x, p1.y);
  }

  // forme sopra la linea per renderla più "musicogramma"
  for (let i = 0; i < pathPoints.length; i += 15) {
    let p = pathPoints[i];
    noStroke();
    fill(p.col);

    if (p.shapeType === "onda") {
      // piccolo zig-zag
      push();
      translate(p.x, p.y);
      beginShape();
      vertex(-10, 5);
      vertex(-5, -5);
      vertex(0, 5);
      vertex(5, -5);
      vertex(10, 5);
      endShape();
      pop();
    } else if (p.shapeType === "pill") {
      // "pillola" orizzontale
      rectMode(CENTER);
      rect(p.x, p.y, 35, 12, 6);
    } else if (p.shapeType === "dot") {
      // pallino
      ellipse(p.x, p.y, 16);
    }
  }
}

// ---------------------------------------------------------------------------
//                    SELEZIONE E CONTROLLO DEI BRANI
// ---------------------------------------------------------------------------

function selectTrack(name) {
  stopTrack();
  pathPoints = []; // reset del disegno quando cambio brano

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

  // sblocco audio da evento utente
  userStartAudio().then(() => {
    if (!currentTrack.isPlaying()) {
      currentTrack.play();
      fft.setInput(currentTrack);
      amplitude.setInput(currentTrack);
      setStatus(`Riproduzione di: ${currentName}`);
    }
  });
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









