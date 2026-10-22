let imgs = [];
let animals = [];
let blobs = [];
let sticks = [];

let song;
let fft;
let played = false;
let locked = false;
let started = false;

// 원본 작품 크기
const DESIGN_W = 1242;
const DESIGN_H = 886;


function preload() {

//  imgs.push(loadImage("home.png"));
  let home = loadImage("home.png");
  home.resize(10, 0);
  imgs.push(home);
  
  imgs.push(loadImage("gross.png"));
  imgs.push(loadImage("rainbow.png"));
  imgs.push(loadImage("cloud.png"));

  song = loadSound("1-2.mp3");

}

function setup() {

  createCanvas(windowWidth, windowHeight);
  imageMode(CORNER);

  
  song = loadSound("1-2.mp3", () => {

    song.play();
    song.stop();

  });

  
  userStartAudio();
  song.setVolume(1);
  fft = new p5.FFT();
  fft.setInput(song);

  generateArtwork();

}

function draw() {


   // 원본 작품 비율을 유지하면서 화면 안에 맞춤
  const scaleValue = min(
    width / DESIGN_W,
    height / DESIGN_H
  );

  const drawW = DESIGN_W * scaleValue;
  const drawH = DESIGN_H * scaleValue;

  const offsetX = (width - drawW) / 2;
  const offsetY = (height - drawH) / 2;

  push();

  translate(offsetX, offsetY);
  scale(scaleValue);

 // drawBackground();
  drawMagicDust();
  drawAnimals();

}

function generateArtwork(){

  animals = [];
  blobs = [];
  sticks = [];

  generateBackground();
  generateLayout();
  generateMagicDust();

}

function generateBackground(){

  let palette = [

    [255,255,255],   // 형광 초록
    [255,255,255],   // 독 연두
    [255,255,255],   // 보라
    [255,255,255],   // 진보라
    [255,255,255]      // 검정

  ];

  for(let i=0;i<45;i++){

    let c = random(palette);

    blobs.push({

      x: random(width),
      y: random(height),

      size: random(150,500),

      color: c

    });

  }

}
function drawBackground(){

  background(10,10,18);

  fft.analyze();

  let bass = fft.getEnergy("bass");
  let mid = fft.getEnergy("mid");

  noStroke();

  for(let b of blobs){

    // 저음에 따라 크기 변화
    let s =
      b.size +
      map(bass,0,255,0,120);

    // 중음에 따라 천천히 떠다님
    let offsetX =
      sin(frameCount*0.01+b.y)*map(mid,0,255,0,25);

    let offsetY =
      cos(frameCount*0.01+b.x)*map(mid,0,255,0,15);

    // 음악에 따라 밝기 변화
    fill(
      b.color[0],
      b.color[1],
      b.color[2],
      map(bass,0,255,20,70)
    );

    ellipse(
      b.x+offsetX,
      b.y+offsetY,
      s
    );

  }

  // 달
  let moonSize =
    220+
    map(bass,0,255,0,35);

  fill(140,80,255,140);

  circle(
    width*0.82,
    height*0.18,
    moonSize
  );

}

function generateMagicDust(){
 // 오브젝트에서 가져온 색
  let objectColors = [
    // 무지개
    [255, 60, 40],    // red
    [255, 130, 20],   // orange
    [255, 210, 20],   // yellow
    [40, 190, 70],    // green

    // 풀
    [30, 200, 60],
    [80, 220, 50],

    // 구름
    [30, 150, 240],
    [80, 190, 255],

    // 집
    [20, 20, 20],     // black
    [255, 130, 20]    // orange
  ];

  for(let i=0;i<250;i++){

    sticks.push({

      x: random(width),
      y: random(height),

      size: random(2,8),

      color: random(objectColors)

    });

  }

}

function drawMagicDust(){

  noStroke();

  for(let s of sticks){

    stroke(s.color);
    strokeWeight(2);
    
    line(
      s.x,
      s.y,
      s.x + random(-5,5),
      s.y + random(-5,5)
    );

  }

}

function generateLayout(){

  let tries = 0;

  while(
    animals.length < 30 &&
    tries < 5000
  ){

    let img = random(imgs);

    let scaleValue =
      random(0.12,0.22);

    let w =
      img.width *
      scaleValue;

    let h =
      img.height *
      scaleValue;

    let x =
      random(w/2,width-w/2);

    let y =
      random(h/2,height-h/2);

    let ok = true;

    for(let other of animals){

      let d = dist(
        x,
        y,
        other.x,
        other.y
      );

      let minDist =
        max(w,h)/2 +
        max(other.w,other.h)/2 +
        50;

      if(d < minDist){

        ok = false;
        break;

      }

    }

    if(ok){

      animals.push({

        img: img,

        x: x,
        y: y,

        w: w,
        h: h,

        angle: random(
          -PI/3,
          PI/3
        )

      });

    }

    tries++;

  }

}

function drawAnimals(){

  imageMode(CENTER);

  fft.analyze();

  let bass = fft.getEnergy("bass");
  let mid = fft.getEnergy("mid");
  let treble = fft.getEnergy("treble");

  for(let a of animals){

    push();

    translate(a.x,a.y);

    rotate(
      a.angle +
      sin(frameCount*0.04+a.x)*map(mid,0,255,0,0.2)
    );

    let s = map(bass,0,255,1,1.25);

    scale(s);

    tint(
      255,
      map(treble,0,255,180,255)
    );

    image(
      a.img,
      0,
      0,
      a.w, 
      a.h
    );

    pop();

  }

  noTint();

}


function triggerSound(){

  //alert(song.isPlaying());
  //alert(locked);
  // 👉 이미 음악이 시작됐으면 아무것도 안 함
  if (song.isPlaying() || locked) {
    //alert('stop');
    song.stop();
    locked = false; 
   // return false;
  }else{
    //alert('play');
    song.play();
    locked = true;   // ⭐ 이후 모든 클릭 잠금
  }

  generateArtwork(); // 처음 1번만 실행

}

function mousePressed() {
  triggerSound();
}



window.addEventListener("message", (event) => {
  if (event.data === "triggerSound") {
    triggerSound();
  }
});


/*
function mouseMoved() {
  // 캔버스 안에 있을 때만
  if (
    mouseX > 0 &&
    mouseX < width &&
    mouseY > 0 &&
    mouseY < height
  ) {
    if (!played) {
      song.play();   // 또는 loop()
      played = true; // ← 핵심: 딱 1번만
    }



    generateArtwork();
  }
}

*/
function keyPressed(){

  if(key === 'r' || key === 'R'){
    saveGif('poison-garden', 8);
  }

  if(key === 's' || key === 'S'){
    saveCanvas('poison-garden', 'png');
  }

}
