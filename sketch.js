let danzaAudio;
let sarabandaAudio;
let currentTrack = null;
let currentName = "";
let fft;
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
  const canvas = createCanvas(800, 200);
  canvas.parent("canvas-container");

  fft = new p5.FFT();
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
  if (!ready || !currentTrack || !currentTrack.isPlaying()) {
    return;
  }

  background(245);

  const spectrum = fft.analyze();
  noStroke();

  // barre verticali tipo musicogramma
  const step = width / spectrum.length;
  for (let i = 0; i < spectrum.length; i += 8) {
    const amp = spectrum[i];
    const h = map(amp, 0, 255, 0, height);
    const x = i * step;

    // colore diverso per i due brani
    if (currentName === "Danza delle ore") {
      fill(0, 120, 255, 180);
    } else {
      fill(150, 50, 200, 180);
    }

    rect(x, height - h, step * 7, h, 4);
  }

  fill(0);
  textSize(16);
  text(currentName, width / 2, 20);
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

  // Alcuni browser richiedono l'azione dell’utente, ma qui siamo dentro al click → ok
  if (!currentTrack.isPlaying()) {
    currentTrack.play();
    fft.setInput(currentTrack);
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
  background(245);
}

function setStatus(msg) {
  const el = document.getElementById("status");
  if (el) el.textContent = msg;
}

