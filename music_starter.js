// global parameters
let bgImage;  // Background image
let starPositions = [];  // Star positions
let numberOfStarts = 20; // Numnber of stars
let starGlowIntensity = 5; // Star glowing intensity
let particles = []; // Array to store dust particles
let spiralAngle = 0; // Spiral angle
let numSpirals = 130; // Number of spiral arms
let spiralAngleStep = 10;   // Angle between each point on the spiral
let spiralRadiusStep = 1;   // Radius increment for each point, start value

// Set backgound image, this is get called by system_runner
function setBackgroundImage() {
  bgImage = loadImage('background.jpg');
}

// Set fix number of random positions for the starts at the beginning of each run, this is get called by system_runner
function setStarPositions() {
  for (let i = 0; i < numberOfStarts; i++) {
    let x = random(width); // Random x position across the canvas width
    let y = random(10, 10 + 50); // Random y position near the top
    starPositions.push({x: x, y: y}); // Store the position in a global array
  }
}

// vocal, drum, bass, and other are volumes ranging from 0 to 100
function draw_one_frame(words, vocal, drum, bass, other, counter) {
  background(0)
  textFont('Verdana'); // please use CSS safe fonts
  rectMode(CENTER)
  textSize(24);
  angleMode(RADIANS); // set default angle mode to Radians

  // Set background image
  imageMode(CORNER);
  image(bgImage, 0, 0);
  
  // Get projected values of the music parts into a variable
  vocalValue = map(vocal, 0, 100, 1, 100);
  drumValue = map(drum, 0, 80, 1, 5);
  bassValue = map(bass, 0, 100, 0.5, 1);
  otherValue = map(other, 0, 100, 0.5, 18);

  // Draw starts at the top which get sized changed based on the otherValue of the music
  drawRandomStars(starGlowIntensity, otherValue);

  // Draw a heart syncing with vocal value of the music
  drawGlowingHeart(400, 280, vocalValue, vocalValue + 1, 5);
  drawGlowingHeart(700, 360, vocalValue, vocalValue + 1, 5);

  // Draw dust effect from the sides
  drawDust(drumValue);

  // Draw spiral effect
  drawSpiral(1050, 250, bassValue);
}

// Draw random number of glowing stars
function drawRandomStars(glowIntensity, radius) {
  for (let position of starPositions) {
    drawGlowingStar(position.x, position.y, radius, glowIntensity);
  }
}

// Draw a single glowing star
function drawGlowingStar(x, y, radius, intensity) {
  let starColor = color(255, 255, 224); // Bright yellow
  let glowColor = color(173, 216, 230); // Bright yellowish-white
  let numberOfPointers = 5; // number of pointers for the star
  
  // Access the 2D canvas context
  let ctx = drawingContext;

  // Draw the glowing effect with shadow properties
  ctx.shadowColor = glowColor.toString();
  ctx.shadowBlur = intensity;
  ctx.fillStyle = starColor.toString();

  // Draw the star with glow effect
  noStroke();
  fill(starColor);
  drawStar(x, y, radius, radius / 2, numberOfPointers);
  
  // Draw the glowing effect
  for (let i = radius; i < radius + intensity; i += 2) {
    let alpha = map(i, radius, radius + intensity, 0, 255);
    let interColor = lerpColor(starColor, glowColor, 0.5);
    interColor.setAlpha(alpha);
    ctx.shadowColor = interColor.toString();
    ctx.shadowBlur = intensity;
    drawStar(x, y, i, i / 2, numberOfPointers);
  }
  
  // Reset shadow properties
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

// Draw a single star
function drawStar(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius1;
    let sy = y + sin(a) * radius1;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius2;
    sy = y + sin(a + halfAngle) * radius2;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

// Draw glowing hearts
function drawGlowingHeart(x, y, heartSize, glowSize, blurValue) {
  drawHeart(x, y, heartSize);
  drawHeartGlow(x,y, glowSize, blurValue);
}

// Draw the heart shape
function drawHeart(x, y, size) {
  fill(255, 0, 0); // Red color for the heart
  stroke(255, 0, 0); // Red border for the heart shape
  strokeWeight(3);
  
  beginShape();
  vertex(x, y);  
  // Right side of the heart
  bezierVertex(x + size / 2, y - size / 2, x + size, y + size / 4, x, y + size);  
  // Left side of the heart
  bezierVertex(x - size, y + size / 4, x - size / 2, y - size / 2, x, y);  
  endShape(CLOSE);
}

// Draw the glowing effect to the heart
function drawHeartGlow(x, y, size, blur) {
  noStroke();
  for (let i = size; i > 0; i -= blur) {
    let alpha = map(i, size, 0, 0, 150); // Adjust alpha to create a glowing effect
    fill(255, 0, 0, alpha); // Red color with decreasing alpha
    ellipse(x, y, i * 2, i * 2);
  }
}


// Draw dust from the sides

function drawDust(size) {
  // Generate particles from the left side (gold) and right side (silver)
  generateParticles(size);

  // Update and display all particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].isDead()) {
      particles.splice(i, 1); // Remove dead particles
    }
  }
}

// Particle class definition for dust generation
class Particle {
  constructor(x, y, col, size) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-1, 1), random(-2, -4));
    this.acc = createVector(0, 0);
    this.size = size;
    this.lifespan = 255;
    this.color = col;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.size *= 0.97; // Shrink the particles over time
    this.lifespan -= 4; // Particle fading effect
  }

  show() {
    noStroke();
    fill(red(this.color), green(this.color), blue(this.color), this.lifespan);
    ellipse(this.pos.x, this.pos.y, this.size);
  }

  isDead() {
    return this.lifespan < 0 || this.size < 1;
  }
}

// Generate dust from the sides
function generateParticles(size) {
  // Generate golden particles from the left side
  for (let i = 0; i < 2; i++) {
    let x = random(0, 50); // Start near the left edge
    let y = random(height);
    let gold = color(255, 223, 0, 150); // Gold color
    particles.push(new Particle(x, y, gold, size));
  }

  // Generate silver particles from the right side
  for (let i = 0; i < 2; i++) {
    let x = random(width - 50, width); // Start near the right edge
    let y = random(height);
    let silver = color(192, 192, 192, 150); // Silver color
    particles.push(new Particle(x, y, silver, size));
  }
}

// Draw a spiral effect
function drawSpiral(xPosition, yPosition, spiralRadiusStep) {

  // Move the origin to the center of the canvas
  translate(xPosition, yPosition);
    
  // Rotate the entire spiral slowly
  rotate(spiralAngle);
  spiralAngle += 0.05;  // Rotation speed

  // Draw the spiral
  for (let i = 0; i < numSpirals; i++) {
    let currentAngle = i * spiralAngleStep;
    let radius = i * spiralRadiusStep;

    let x = cos(radians(currentAngle)) * radius;
    let y = sin(radians(currentAngle)) * radius;

    // Color combinations for each arm of the spiral
    let r = map(sin(i * 0.1 + frameCount * 0.05), -1, 1, 100, 255);
    let g = map(sin(i * 0.1 + frameCount * 0.03), -1, 1, 100, 255);
    let b = map(sin(i * 0.1 + frameCount * 0.07), -1, 1, 100, 255);

    stroke(r, g, b);
    strokeWeight(2);

    // Draw the points of the spiral
    ellipse(x, y, 10, 10);
  }
}