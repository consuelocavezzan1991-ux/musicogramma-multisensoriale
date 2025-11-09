let danzaAudio;

function preload() {
  danzaAudio = loadSound("assets/danza.mp3");
}

function setup() {
  createCanvas(400, 200).parent("canvas-container");

  let btn = createButton("Play Danza");
  btn.position(20, 20);
  btn.mousePressed(() => {
    userStartAudio(); // attiva l’audio
    danzaAudio.play();
  });

  textAlign(CENTER, CENTER);
  textSize(20);
  text("Test audio", width / 2, height / 2);
}






