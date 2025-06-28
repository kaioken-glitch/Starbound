function getOrCreateAudio() {
  let audio = document.getElementById('backgroundMusic');
  if (!audio) {
    audio = document.createElement('audio');
    audio.id = 'backgroundMusic';
    audio.loop = true;
    document.body.appendChild(audio);
  }
  return audio;
}

const main = document.querySelector('.main');

function loadMotScreen() {
  main.innerHTML = '';

  const mot = document.createElement('div');
  mot.className = 'mot';
  
  // Check if saved game exists
  const hasSave = hasSavedGame();
  const continueText = hasSave ? 'Continue Game' : 'Continue Game (No Save)';
  const continueStyle = hasSave ? '' : 'style="opacity: 0.5; pointer-events: none;"';
  
  mot.innerHTML = `
    <div class="starscape">
      <img src="/assets/images/beautiful-shining-stars-night-sky.jpg" id="starsBackground" alt="Stars Background">
      <canvas id="twinkleCanvas"></canvas>
    </div>
    <div class="brig">
      <h1><img src="/assets/images/communication.png" alt="">Starbound</h1>
      <p>Inspired by Seedship</p>
      <ul>
        <li id="newGame">New Game</li>
        <li id="continueGame" ${continueStyle}>${continueText}</li>
        <li id="leaderboard">Leaderboard</li>
        <li id="history">History</li>
        <li id="optionsBtn">Options</li>
      </ul>                  
      <button class="button" id="playButton"><span>Play</span></button>
    </div>
    <div class="music-credit">
      <p>Music: "Lost Frontier" by Darren Curtis (Creative Commons License)</p>
    </div>
  `;

  main.appendChild(mot);

  // Load saved settings and apply background music
  const savedSettings = loadSettings();
  const bgMusic = getOrCreateAudio();
  
  // Apply saved audio settings
  const musicOptions = [
    "/assets/audio/EnterInTheSkies.mp3",
    "/assets/audio/exploring.mp3",
    "/assets/audio/ObservingTheStar.ogg",
    "/assets/audio/Ove Melaa - Approaching The Green Grass.ogg",
    "/assets/audio/Ove Melaa - BellHill.ogg",
    "/assets/audio/Ove Melaa - Dark Blue.ogg",
    "/assets/audio/Ove Melaa - Dead, Buried and Cold(Ambient Pad).ogg",
    "/assets/audio/Ove Melaa - Deader + bigger.ogg",
    "/assets/audio/Ove Melaa - Flew.mp3",
    "/assets/audio/Ove Melaa - Gloomy.ogg",
    "/assets/audio/Ove Melaa - GOAT.ogg",
    "/assets/audio/Ove Melaa - Hero Within.mp3",
    "/assets/audio/Ove Melaa - High Stakes,Low Chances.mp3",
    "/assets/audio/Ove Melaa - I have just been eaten.ogg",
    "/assets/audio/Ove Melaa - Infection By Chewing.ogg",
    "/assets/audio/Ove Melaa - ItaloCoolDipKkio.ogg",
    "/assets/audio/Ove Melaa - They Came By Boatoogg",
    "/assets/audio/Ove Melaa - ZombieAmbient.ogg",
    "/assets/audio/fluffedPump.mp3",
    "/assets/audio/spacefileNo14.ogg",
    "/assets/audio/starting_of_the_universe.mp3",
    "/assets/audio/the_magnificent_cosmos.mp3",
    "/assets/audio/travel_through_stars.mp3"
  ];

  
  const expectedSrc = musicOptions[savedSettings.musicTrack] || musicOptions[0];
  
  // Normalize URLs for comparison
  const currentSrcPath = bgMusic.src ? new URL(bgMusic.src).pathname : '';
  const expectedSrcPath = expectedSrc.startsWith('/') ? expectedSrc : '/' + expectedSrc;
  
  // Only set source if it's different or if no source is set
  if (!bgMusic.src || currentSrcPath !== expectedSrcPath) {
    bgMusic.src = expectedSrc;
    bgMusic.volume = savedSettings.volume / 100;
    
    if (savedSettings.music) {
      bgMusic.play().catch(err => console.error('Autoplay blocked:', err));
    }
  } else {
    // Just update volume if track is already playing
    bgMusic.volume = savedSettings.volume / 100;
  }

  // ⭐️ Canvas logic AFTER it's inserted
  const canvas = document.getElementById('twinkleCanvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const stars = Array.from({ length: 150 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 1.5 + 0.5,
    opacity: Math.random()
  }));

  function twinkle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
      star.opacity += (Math.random() - 0.5) * 0.05;
      star.opacity = Math.min(Math.max(star.opacity, 0.1), 1);

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.fill();
    });
    requestAnimationFrame(twinkle);
  }
  twinkle();

  // 🎯 Menu button event listeners
  mot.querySelector('#optionsBtn').addEventListener('click', loadSettingsScreen);
  mot.querySelector('#leaderboard').addEventListener('click', loadLeaderboardScreen);
  mot.querySelector('#history').addEventListener('click', loadHistoryScreen);
  mot.querySelector('#newGame').addEventListener('click', newGame);
  
  // Only add continue game listener if save exists
  if (hasSave) {
    mot.querySelector('#continueGame').addEventListener('click', continueGame);
  }
}

function newGame() {
  // Check if save exists and warn user
  if (hasSavedGame()) {
    const confirmNew = confirm('You have a saved game. Starting a new game will overwrite it. Continue?');
    if (!confirmNew) {
      return;
    }
    deleteSaveGame(); // Delete existing save
  }
  
  // Clear main content and start a new game
  main.innerHTML = '';
  const newGameDiv = document.createElement('div');
  newGameDiv.className = 'terminal-window';
  newGameDiv.innerHTML = `
    <div class="terminal-container">
      <div id="terminalOutput" class="terminal-output">
        <!-- Terminal output will appear here -->
      </div>
      <div class="terminal-input-line" id="terminalInputLine" style="display: none;">
        <span class="terminal-prompt">></span>
        <input type="text" id="terminalInput" class="terminal-input" autofocus>
      </div>
    </div>
  `;
  main.appendChild(newGameDiv);
  
  // Start the prologue typing animation
  startPrologue();
}

// Prologue text content
const prologueText = `You are an artificial intelligence aboard the starship Synthesis, humanity's last hope among the stars.

The Earth has become uninhabitable, and your ship carries 1,000 sleeping colonists in cryogenic chambers, along with a cultural database containing the sum of human knowledge and art.

Your mission is critical: find a suitable planet where humanity can begin anew. You must navigate through the vast cosmos, making decisions that will determine the fate of your passengers and the future of human civilization.

The journey will test your logic circuits and decision-making protocols. You will encounter alien civilizations, face cosmic disasters, and make choices that could save or doom your precious cargo.

Space is unforgiving, but you are humanity's guardian among the stars. Every decision matters. Every moment counts.

The fate of our species rests in your electronic consciousness.

Welcome to your mission, Guardian AI.`;

// Typing animation function
function typeText(element, text, speed = 30) {
  return new Promise((resolve) => {
    element.innerHTML = '';
    let i = 0;
    
    function typeChar() {
      if (i < text.length) {
        if (text.charAt(i) === '\n') {
          element.innerHTML += '<br><br>';
        } else {
          element.innerHTML += text.charAt(i);
        }
        i++;
        setTimeout(typeChar, speed);
      } else {
        resolve();
      }
    }
    
    typeChar();
  });
}

// Start prologue sequence
async function startPrologue() {
  const terminalOutput = document.getElementById('terminalOutput');
  const terminalInputLine = document.getElementById('terminalInputLine');
  const terminalInput = document.getElementById('terminalInput');
  
  // Type out the prologue line by line
  await typeTerminalText(prologueText);
  
  // Show input line after prologue
  setTimeout(() => {
    addTerminalLine('');
    addTerminalLine('Are you ready to begin your mission, Guardian AI? [Y/N]');
    terminalInputLine.style.display = 'flex';
    terminalInput.focus();
    
    // Handle choice input
    terminalInput.addEventListener('keypress', handlePrologueChoice);
  }, 1000);
}

// Type text to terminal with animation
async function typeTerminalText(text, speed = 30) {
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.trim() === '') {
      addTerminalLine('');
    } else {
      await typeLineToTerminal(line, speed);
    }
  }
}

// Type a single line to terminal
function typeLineToTerminal(text, speed = 30) {
  return new Promise((resolve) => {
    const terminalOutput = document.getElementById('terminalOutput');
    const lineElement = document.createElement('div');
    lineElement.className = 'terminal-line';
    terminalOutput.appendChild(lineElement);
    
    let i = 0;
    function typeChar() {
      if (i < text.length) {
        lineElement.textContent += text.charAt(i);
        i++;
        setTimeout(typeChar, speed);
      } else {
        resolve();
      }
    }
    
    typeChar();
  });
}

// Handle prologue choice
function handlePrologueChoice(event) {
  if (event.key === 'Enter') {
    const choice = event.target.value.toLowerCase();
    const terminalOutput = document.getElementById('terminalOutput');
    
    // Add user input to terminal
    addTerminalLine('> ' + event.target.value);
    
    if (choice === 'y' || choice === 'yes') {
      // Clear the terminal and start game
      setTimeout(() => {
        clearTerminal();
        hideTerminalInput();
        
        // Show initialization sequence
        setTimeout(() => {
          addTerminalLine('STARBOUND AI SYSTEM v2.1.4');
          addTerminalLine('Initializing mission parameters...');
          addTerminalLine('');
        }, 200);
        
        setTimeout(() => {
          addTerminalLine('> Mission initialization confirmed.');
          addTerminalLine('> Systems coming online...');
          addTerminalLine('> Beginning planetary survey mission...');
          addTerminalLine('');
        }, 1500);
        
        setTimeout(() => {
          // Initialize game state exactly like Seedship
          gameState = {
            colonists: 1000,
            scanners: {
              atmosphere: 100,
              gravity: 100,
              temperature: 100,
              water: 100,
              resources: 100
            },
            surfaceProbes: 10,
            systems: {
              landing: 100,
              construction: 100
            },
            databases: {
              scientific: 100,
              cultural: 100
            },
            currentPlanet: null,
            planetsScanned: 0,
            awaitingEventChoice: false
          };
          
          // Arrive at first star system (like Seedship)
          arriveAtNewSystem();
          
          // Auto-save the initial game state
          saveGame();
          
          // Show input and switch to game handler
          showTerminalInput();
          event.target.removeEventListener('keypress', handlePrologueChoice);
          event.target.addEventListener('keypress', handleGameInput);
          event.target.value = '';
          event.target.focus();
        }, 3000);
      }, 500);
      
    } else if (choice === 'n' || choice === 'no') {
      addTerminalLine('> Running comprehensive system diagnostics...');
      addTerminalLine('> Life support systems: OPTIMAL');
      addTerminalLine('> Navigation array: OPERATIONAL');
      addTerminalLine('> Cryogenic chambers: ALL 1,000 COLONISTS STABLE');
      addTerminalLine('');
      
      setTimeout(() => {
        addTerminalLine('Diagnostics complete. All systems are functioning within normal parameters.');
        addTerminalLine('Guardian AI, the colonists are depending on you. Are you ready to begin? [Y/N]');
        event.target.value = '';
        event.target.focus();
      }, 3000);
    } else {
      addTerminalLine('> Invalid input. Please enter Y for Yes or N for No.');
      event.target.value = '';
    }
  }
}

// Add dialogue to the game
function addDialogue(text, type = 'normal') {
  // This function is kept for compatibility but redirects to terminal
  addTerminalLine(text);
}

// Terminal utility functions
function addTerminalLine(text) {
  const terminalOutput = document.getElementById('terminalOutput');
  const line = document.createElement('div');
  line.className = 'terminal-line';
  line.textContent = text;
  terminalOutput.appendChild(line);
  
  // Auto-scroll to bottom
  const terminalContainer = document.querySelector('.terminal-container');
  if (terminalContainer) {
    terminalContainer.scrollTop = terminalContainer.scrollHeight;
  }
}

function clearTerminal() {
  const terminalOutput = document.getElementById('terminalOutput');
  terminalOutput.innerHTML = '';
}

function showTerminalInput() {
  const terminalInputLine = document.getElementById('terminalInputLine');
  if (terminalInputLine) {
    terminalInputLine.style.display = 'flex';
    const terminalInput = document.getElementById('terminalInput');
    if (terminalInput) {
      terminalInput.focus();
    }
  }
}

function hideTerminalInput() {
  const terminalInputLine = document.getElementById('terminalInputLine');
  if (terminalInputLine) {
    terminalInputLine.style.display = 'none';
  }
}

// Game state variables - exactly like Seedship
let gameState = {
  colonists: 1000,
  scanners: {
    atmosphere: 100,
    gravity: 100,
    temperature: 100,
    water: 100,
    resources: 100
  },
  surfaceProbes: 10,
  systems: {
    landing: 100,
    construction: 100
  },
  databases: {
    scientific: 100,
    cultural: 100
  },
  currentPlanet: null,
  planetsScanned: 0
};

// Handle game input (after prologue)
function handleGameInput(event) {
  if (event.key === 'Enter') {
    const input = event.target.value.toLowerCase().trim();
    const userInput = event.target.value;
    
    // Add user input to terminal
    addTerminalLine('> ' + userInput);
    addTerminalLine('');
    
    // Check if we're waiting for event choice
    if (gameState.awaitingEventChoice) {
      const choice = parseInt(input);
      if (choice >= 1 && choice <= gameState.currentEvent.choices.length && gameState.currentEvent) {
        const selectedChoice = gameState.currentEvent.choices[choice - 1];
        if (selectedChoice) {
          addTerminalLine('You choose: ' + selectedChoice.text);
          addTerminalLine('');
          
          // Apply the effect
          selectedChoice.effect();
          
          addTerminalLine('');
          addTerminalLine('Continuing journey...');
          addTerminalLine('');
          
          // Reset event state
          gameState.awaitingEventChoice = false;
          gameState.currentEvent = null;
          
          // Auto-save after event resolution
          saveGame();
          
          // Arrive at next system
          setTimeout(() => {
            arriveAtNewSystem();
          }, 2000);
        }
      } else {
        addTerminalLine('> Invalid choice. Please enter a number from 1 to ' + gameState.currentEvent.choices.length + '.');
        addTerminalLine('');
      }
      event.target.value = '';
      return;
    }
    
    // Process normal game logic
    if (input === 'scan planet' || input === 'scan') {
      scanPlanet();
      saveGame(); // Auto-save after action
    } else if (input === 'found colony' || input === '1') {
      foundColony();
      deleteSaveGame(); // Delete save after completing game
    } else if (input === 'move on' || input === '2') {
      moveOn();
      saveGame(); // Auto-save after action
    } else if (input === 'launch surface probe' || input === 'probe') {
      launchSurfaceProbe();
      saveGame(); // Auto-save after action
    } else if (input === 'save game' || input === 'save') {
      if (saveGame()) {
        addTerminalLine('> Game saved successfully.');
      } else {
        addTerminalLine('> Error saving game. Please try again.');
      }
      addTerminalLine('');
    } else if (input === 'main menu' || input === 'menu' || input === 'exit') {
      addTerminalLine('Returning to main menu...');
      addTerminalLine('');
      setTimeout(() => {
        loadMotScreen();
      }, 1000);
    } else {
      addTerminalLine('> Command not recognized. Available commands:');
      addTerminalLine('> scan planet, found colony, move on, launch surface probe, save game, main menu');
      addTerminalLine('');
    }
    
    event.target.value = '';
  }
}

// Arrive at a new star system - exactly like Seedship
function arriveAtNewSystem() {
  const starTypes = ['red dwarf', 'orange dwarf', 'yellow dwarf', 'blue giant', 'white dwarf', 'binary system'];
  const currentStar = starTypes[Math.floor(Math.random() * starTypes.length)];
  
  addTerminalLine('The seedship drops out of its faster-than-light travel in orbit of a');
  addTerminalLine(currentStar + '. The AI performs the same operations it has performed');
  addTerminalLine('thousands of times before: it checks that the journey has not damaged');
  addTerminalLine('any of its systems, and it runs its scanners over the planets of this system,');
  addTerminalLine('looking for one that might support human life.');
  addTerminalLine('');
  addTerminalLine('Scan planet');
  addTerminalLine('');
}

// Initial system awakening - exactly like Seedship
function showSystemStatus() {
  addTerminalLine('Any damage or malfunctions during the journey should have woken the AI from its');
  addTerminalLine('hibernation, but it is still anxious as it runs its self-diagnostic programs.');
  addTerminalLine('The sleep chambers are all functioning, the colonists within them alive, or at');
  addTerminalLine('least capable of being revived from their frozen stasis. Sensors functioning;');
  addTerminalLine('surface probes responding. Landing and construction systems ready for the one');
  addTerminalLine('time they will be used. Scientific and cultural databases intact, safely');
  addTerminalLine('storing all that remains of humanity\'s knowledge and art.');
  addTerminalLine('');
  
  // Display status table
  displayStatusTable();
}

// Display the status table exactly like Seedship
function displayStatusTable() {
  addTerminalLine('Colonists:     ' + gameState.colonists);
  addTerminalLine('');
  addTerminalLine('Scanners');
  addTerminalLine('Atmosphere:    ' + gameState.scanners.atmosphere + '%');
  addTerminalLine('Gravity:       ' + gameState.scanners.gravity + '%');
  addTerminalLine('Temperature:   ' + gameState.scanners.temperature + '%');
  addTerminalLine('Water:         ' + gameState.scanners.water + '%');
  addTerminalLine('Resources:     ' + gameState.scanners.resources + '%');
  addTerminalLine('Surface probes: ' + gameState.surfaceProbes);
  addTerminalLine('');
  addTerminalLine('Systems');
  addTerminalLine('Landing:       ' + gameState.systems.landing + '%');
  addTerminalLine('Construction:  ' + gameState.systems.construction + '%');
  addTerminalLine('');
  addTerminalLine('Databases');
  addTerminalLine('Scientific:    ' + gameState.databases.scientific + '%');
  addTerminalLine('Cultural:      ' + gameState.databases.cultural + '%');
  addTerminalLine('');
}

// Scan current planet - exactly like Seedship format
function scanPlanet() {
  gameState.planetsScanned++;
  gameState.currentPlanet = generateRandomPlanet();
  
  const planet = gameState.currentPlanet;
  
  // First show the system status like Seedship does
  showSystemStatus();
  
  // Then show planet scan results
  addTerminalLine('The seedship is in orbit of the ' + getOrdinal(planet.position) + ' planet of a ' + planet.starType + ' star.');
  addTerminalLine('Even a brief scan from orbit reveals far more information than its builders');
  addTerminalLine('could know with their Earth-orbit-based telescopes, but the AI has little use');
  addTerminalLine('for scientific curiosity. It has only one concern: whether this planet would');
  addTerminalLine('make a suitable new home for the human race.');
  addTerminalLine('');
  addTerminalLine('Atmosphere:    ' + planet.atmosphere);
  addTerminalLine('Gravity:       ' + planet.gravity);
  addTerminalLine('Temperature:   ' + planet.temperature);
  addTerminalLine('Water:         ' + planet.water);
  addTerminalLine('Resources:     ' + planet.resources);
  
  if (planet.anomalies.length > 0) {
    addTerminalLine('');
    addTerminalLine('Anomalies:');
    planet.anomalies.forEach(anomaly => {
      addTerminalLine(anomaly);
    });
  }
  
  addTerminalLine('');
  if (gameState.surfaceProbes > 0) {
    addTerminalLine('Launch surface probe');
    addTerminalLine('');
  }
  
  addTerminalLine('Found colony | Move on');
  addTerminalLine('');
}

// Generate a random planet with Seedship-style attributes
function generateRandomPlanet() {
  const atmosphereTypes = ['None', 'Trace', 'Toxic', 'Corrosive', 'Methane', 'Marginal', 'Thin', 'Breathable', 'Dense', 'Ideal'];
  const gravityTypes = ['None', 'Micro', 'Very low', 'Low', 'Light', 'Earth-like', 'Heavy', 'High', 'Very high', 'Crushing'];
  const temperatureTypes = ['Absolute zero', 'Frozen', 'Very cold', 'Cold', 'Cool', 'Temperate', 'Warm', 'Hot', 'Very hot', 'Scorching', 'Molten'];
  const waterTypes = ['None', 'Trace', 'Little', 'Seasonal', 'Moderate', 'Abundant', 'Vast oceans', 'Global ocean', 'Ice-covered'];
  const resourceTypes = ['None', 'Depleted', 'Poor', 'Limited', 'Moderate', 'Rich', 'Abundant', 'Vast deposits'];
  
  // More diverse star types
  const starTypes = [
    'red dwarf', 'orange dwarf', 'yellow dwarf', 'white dwarf', 'brown dwarf',
    'blue giant', 'red giant', 'white giant', 'neutron star', 'pulsar',
    'binary system', 'triple star system', 'blue supergiant', 'red supergiant'
  ];
  
  // Much more diverse anomalies
  const possibleAnomalies = [
    'Vegetation', 'Dense forests', 'Fungal networks', 'Crystalline structures',
    'Ruins', 'Ancient cities', 'Buried temples', 'Orbital artifacts',
    'Megafauna', 'Hostile life', 'Intelligent life', 'Primitive civilization',
    'Rare minerals', 'Radioactive deposits', 'Exotic matter', 'Zero-point energy',
    'Geothermal activity', 'Volcanic chains', 'Tectonic instability', 'Seismic anomalies',
    'Magnetic field anomaly', 'Electromagnetic storms', 'Gravitational anomalies', 'Time dilation fields',
    'Ancient artifacts', 'Alien technology', 'Derelict spacecraft', 'Quantum resonance',
    'Unstable geology', 'Floating islands', 'Underground caverns', 'Crystal caves',
    'Bioluminescent organisms', 'Silicon-based life', 'Energy beings', 'Hive minds',
    'Toxic spores', 'Aggressive flora', 'Carnivorous plants', 'Sentient forests',
    'Mineral wealth', 'Precious metals', 'Rare earth elements', 'Antimatter traces',
    'Weather anomalies', 'Perpetual storms', 'Aurora phenomena', 'Plasma rivers',
    'Dimensional rifts', 'Temporal echoes', 'Psychic resonance', 'Memory crystals'
  ];
  
  // Select random anomalies (0-3 for more variety)
  const numAnomalies = Math.floor(Math.random() * 4);
  const anomalies = [];
  const shuffledAnomalies = [...possibleAnomalies].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < numAnomalies && i < shuffledAnomalies.length; i++) {
    anomalies.push(shuffledAnomalies[i]);
  }
  
  return {
    position: Math.floor(Math.random() * 15) + 1, // 1st to 15th planet for more variety
    starType: starTypes[Math.floor(Math.random() * starTypes.length)],
    atmosphere: atmosphereTypes[Math.floor(Math.random() * atmosphereTypes.length)],
    gravity: gravityTypes[Math.floor(Math.random() * gravityTypes.length)],
    temperature: temperatureTypes[Math.floor(Math.random() * temperatureTypes.length)],
    water: waterTypes[Math.floor(Math.random() * waterTypes.length)],
    resources: resourceTypes[Math.floor(Math.random() * resourceTypes.length)],
    anomalies: anomalies
  };
}

// Launch surface probe for more detailed scan
function launchSurfaceProbe() {
  if (gameState.surfaceProbes <= 0) {
    addTerminalLine('> No surface probes remaining.');
    addTerminalLine('');
    return;
  }
  
  gameState.surfaceProbes--;
  
  addTerminalLine('Launching surface probe...');
  addTerminalLine('');
  
  setTimeout(() => {
    addTerminalLine('Surface probe has landed and begun detailed analysis.');
    addTerminalLine('');
    
    // Provide more detailed information about the planet
    const planet = gameState.currentPlanet;
    
    // Enhanced probe descriptions for various anomalies
    if (planet.anomalies.includes('Vegetation') || planet.anomalies.includes('Dense forests')) {
      addTerminalLine('Probe confirms: Extensive plant life detected across multiple continents.');
      addTerminalLine('Oxygen levels in atmosphere higher than initial scans indicated.');
      addTerminalLine('Photosynthetic activity suggests a thriving ecosystem.');
    }
    
    if (planet.anomalies.includes('Ruins') || planet.anomalies.includes('Ancient cities')) {
      addTerminalLine('Probe investigates ancient structures. Architecture suggests highly');
      addTerminalLine('advanced civilization. No signs of current inhabitants.');
      addTerminalLine('Complex geometric patterns indicate sophisticated engineering knowledge.');
    }
    
    if (planet.anomalies.includes('Intelligent life') || planet.anomalies.includes('Primitive civilization')) {
      addTerminalLine('Probe detects artificial electromagnetic signals. Advanced civilization');
      addTerminalLine('present on planet surface. First contact protocols may be necessary.');
      addTerminalLine('Radio transmissions suggest complex social structures.');
    }
    
    if (planet.anomalies.includes('Hostile life') || planet.anomalies.includes('Megafauna')) {
      addTerminalLine('Warning: Probe attacked by aggressive megafauna. Large predators');
      addTerminalLine('present. Colonization would require significant defensive measures.');
      addTerminalLine('Territorial behavior suggests highly evolved hunting instincts.');
    }
    
    if (planet.anomalies.includes('Crystalline structures') || planet.anomalies.includes('Crystal caves')) {
      addTerminalLine('Probe discovers vast crystalline formations throughout the crust.');
      addTerminalLine('These structures exhibit unique resonance properties that could');
      addTerminalLine('potentially be harnessed for technological applications.');
    }
    
    if (planet.anomalies.includes('Alien technology') || planet.anomalies.includes('Derelict spacecraft')) {
      addTerminalLine('Probe locates remnants of advanced alien technology. Analysis');
      addTerminalLine('suggests the artifacts are of unknown origin and purpose.');
      addTerminalLine('Potential for reverse engineering, but safety concerns remain.');
    }
    
    if (planet.anomalies.includes('Energy beings') || planet.anomalies.includes('Psychic resonance')) {
      addTerminalLine('Probe detects non-corporeal life forms composed of pure energy.');
      addTerminalLine('Attempts at communication result in strange electromagnetic');
      addTerminalLine('patterns. The nature of these entities remains unclear.');
    }
    
    if (planet.anomalies.includes('Toxic spores') || planet.anomalies.includes('Aggressive flora')) {
      addTerminalLine('Warning: Probe contaminated by airborne toxins from native flora.');
      addTerminalLine('Plant life shows aggressive defensive mechanisms. Extensive');
      addTerminalLine('biological filtering would be required for human habitation.');
    }
    
    if (planet.anomalies.includes('Dimensional rifts') || planet.anomalies.includes('Temporal echoes')) {
      addTerminalLine('Probe readings indicate severe spacetime distortions across');
      addTerminalLine('the planetary surface. Causal loops and temporal anomalies');
      addTerminalLine('detected. Extreme caution advised for any surface operations.');
    }
    
    if (planet.anomalies.includes('Bioluminescent organisms') || planet.anomalies.includes('Fungal networks')) {
      addTerminalLine('Probe observes remarkable bioluminescent ecosystem. Vast networks');
      addTerminalLine('of interconnected organisms create planet-wide communication');
      addTerminalLine('system. Potential for symbiotic relationship with colonists.');
    }
    
    addTerminalLine('');
    addTerminalLine('Surface probes remaining: ' + gameState.surfaceProbes);
    addTerminalLine('');
    addTerminalLine('Found colony | Move on');
    addTerminalLine('');
  }, 2000);
}

// Found colony decision
function foundColony() {
  addTerminalLine('Initiating colonization protocol...');
  addTerminalLine('Awakening colonists from cryogenic sleep...');
  addTerminalLine('Preparing landing shuttles...');
  addTerminalLine('');
  
  setTimeout(() => {
    // Landing scenario based on planet conditions and ship status
    const planet = gameState.currentPlanet;
    let landingIssues = [];
    
    // Check for landing complications based on planet conditions
    if (planet.atmosphere === 'Toxic' || planet.atmosphere === 'Corrosive') {
      landingIssues.push('atmospheric_hazard');
    }
    if (planet.gravity === 'Very high' || planet.gravity === 'Crushing') {
      landingIssues.push('gravity_stress');
    }
    if (planet.temperature === 'Very hot' || planet.temperature === 'Molten' || planet.temperature === 'Frozen') {
      landingIssues.push('temperature_extreme');
    }
    if (planet.anomalies.includes('Hostile life') || planet.anomalies.includes('Unstable geology')) {
      landingIssues.push('surface_danger');
    }
    if (gameState.systems.landing < 50) {
      landingIssues.push('system_failure');
    }
    
    // Process landing complications
    if (landingIssues.length > 0) {
      addTerminalLine('LANDING COMPLICATIONS DETECTED');
      addTerminalLine('');
      
      if (landingIssues.includes('atmospheric_hazard')) {
        const colonistLoss = Math.floor(Math.random() * 80) + 40;
        gameState.colonists = Math.max(0, gameState.colonists - colonistLoss);
        addTerminalLine(`Toxic atmosphere claims ${colonistLoss} colonists during initial landing.`);
        addTerminalLine('Emergency atmospheric processors are deployed.');
        gameState.systems.construction = Math.max(0, gameState.systems.construction - 30);
      }
      
      if (landingIssues.includes('gravity_stress')) {
        const colonistLoss = Math.floor(Math.random() * 60) + 20;
        gameState.colonists = Math.max(0, gameState.colonists - colonistLoss);
        addTerminalLine(`Extreme gravity causes structural failures. ${colonistLoss} colonists lost.`);
        addTerminalLine('Landing systems severely strained.');
        gameState.systems.landing = Math.max(0, gameState.systems.landing - 40);
      }
      
      if (landingIssues.includes('temperature_extreme')) {
        const colonistLoss = Math.floor(Math.random() * 50) + 25;
        gameState.colonists = Math.max(0, gameState.colonists - colonistLoss);
        addTerminalLine(`Extreme temperatures overwhelm life support systems.`);
        addTerminalLine(`${colonistLoss} colonists perish during the initial settlement phase.`);
        gameState.systems.construction = Math.max(0, gameState.systems.construction - 25);
      }
      
      if (landingIssues.includes('surface_danger')) {
        if (planet.anomalies.includes('Hostile life')) {
          const colonistLoss = Math.floor(Math.random() * 100) + 50;
          gameState.colonists = Math.max(0, gameState.colonists - colonistLoss);
          addTerminalLine(`Aggressive native fauna attacks the landing sites.`);
          addTerminalLine(`${colonistLoss} colonists killed in the initial encounters.`);
          addTerminalLine('Defensive perimeters established at great cost.');
        }
        if (planet.anomalies.includes('Unstable geology')) {
          const colonistLoss = Math.floor(Math.random() * 70) + 30;
          gameState.colonists = Math.max(0, gameState.colonists - colonistLoss);
          addTerminalLine(`Seismic activity destroys several landing sites.`);
          addTerminalLine(`${colonistLoss} colonists lost to geological disasters.`);
          gameState.databases.scientific = Math.max(0, gameState.databases.scientific - 20);
        }
      }
      
      if (landingIssues.includes('system_failure')) {
        const colonistLoss = Math.floor(Math.random() * 120) + 80;
        gameState.colonists = Math.max(0, gameState.colonists - colonistLoss);
        addTerminalLine(`Critical landing system failures during descent.`);
        addTerminalLine(`Multiple shuttles crash. ${colonistLoss} colonists do not survive.`);
        addTerminalLine('The remaining shuttles land safely but resources are critically low.');
        gameState.systems.construction = Math.max(0, gameState.systems.construction - 50);
      }
      
      addTerminalLine('');
    }
    
    // Memorial for the fallen
    const totalLost = 1000 - gameState.colonists;
    if (totalLost > 0) {
      addTerminalLine('MEMORIAL SERVICE');
      addTerminalLine('');
      addTerminalLine(`In memory of the ${totalLost} souls lost during humanity's journey to the stars.`);
      addTerminalLine('Their sacrifice paved the way for those who survive to build anew.');
      addTerminalLine('Though they did not see this new world, they are part of its foundation.');
      addTerminalLine('');
      addTerminalLine('The survivors gather to honor their memory before beginning');
      addTerminalLine('the work of building humanity\'s new home among the stars.');
      addTerminalLine('');
    }
    
    addTerminalLine('COLONIZATION COMPLETE');
    addTerminalLine('');
    addTerminalLine(`After scanning ${gameState.planetsScanned} worlds, humanity has found a new home.`);
    addTerminalLine(`${gameState.colonists} colonists begin the arduous task of survival and rebuilding.`);
    addTerminalLine('');
    
    const score = calculateColonyScore();
    displayColonyResult(score);
    
    addTerminalLine('');
    addTerminalLine('Final Score: ' + score.toLocaleString() + ' points');
    addTerminalLine('');
    addTerminalLine('Press any key to return to main menu...');
    
    // Add to game history
    addToGameHistory(score, 'Guardian AI');
  }, 3000);
}

// Move on to next planet
function moveOn() {
  addTerminalLine('The AI judges the ' + getOrdinal(gameState.currentPlanet.position) + ' planet to be unsuitable. It turns its');
  addTerminalLine('scanners away, spreads its solar sails, and begins another long journey');
  addTerminalLine('through the void.');
  addTerminalLine('');
  
  setTimeout(() => {
    // Random event during travel (higher chance for more variety)
    if (Math.random() < 0.6) {
      presentRandomEvent();
    } else {
      // Arrive at new system
      arriveAtNewSystem();
    }
  }, 2000);
}

// Present random events during travel
function presentRandomEvent() {
  const events = [
    // Conflict scenarios requiring choices
    {
      title: 'Star-Forming Nebula',
      description: 'The seedship\'s course takes it through a dense star-forming nebula. Hundreds of infant suns illuminate clouds of interstellar gas and fill the sky with riotous colour. Clouds twist through complex gravitational interference patterns and glitter with heavy elements formed in the death throes of the last generation of stars.\n\nThe scanners were not designed to deal with this level of input, and it is threatening to overwhelm them. If the AI continues to use the scanners to navigate, it can tell that the atmosphere scanner will be damaged. Shutting off the scanners, however, would leave the seedship vulnerable to collisions in this crowded area of space.',
      choices: [
        { 
          text: 'Keep the scanners running', 
          effect: () => { 
            gameState.scanners.atmosphere = Math.max(0, gameState.scanners.atmosphere - 30);
            addTerminalLine('The AI continues to use the scanners to navigate. The atmosphere scanner');
            addTerminalLine('overloads, but the seedship passes safely through the star-forming nebula.');
          } 
        },
        { 
          text: 'Fly blind', 
          effect: () => { 
            if (Math.random() < 0.4) {
              damageRandomSystem(25);
              addTerminalLine('The AI shuts off the scanners and navigates by dead reckoning. A collision');
              addTerminalLine('with space debris damages ship systems, but the scanners are preserved.');
            } else {
              addTerminalLine('The AI shuts off the scanners and navigates by dead reckoning. Through');
              addTerminalLine('skill and luck, the seedship passes safely through the nebula.');
            }
          } 
        }
      ]
    },
    {
      title: 'Quantum Storm',
      description: 'A massive quantum storm engulfs the seedship, causing reality itself to fluctuate around the vessel. The ship\'s databases begin experiencing data corruption as fundamental constants shift unpredictably.',
      choices: [
        { 
          text: 'Shield the cultural database', 
          effect: () => { 
            gameState.databases.scientific = Math.max(0, gameState.databases.scientific - 35);
            addTerminalLine('The cultural database is protected, but scientific data is severely corrupted.');
          } 
        },
        { 
          text: 'Shield the scientific database', 
          effect: () => { 
            gameState.databases.cultural = Math.max(0, gameState.databases.cultural - 35);
            addTerminalLine('Scientific knowledge preserved, but cultural heritage data is damaged.');
          } 
        },
        { 
          text: 'Distribute the damage equally', 
          effect: () => { 
            gameState.databases.scientific = Math.max(0, gameState.databases.scientific - 20);
            gameState.databases.cultural = Math.max(0, gameState.databases.cultural - 20);
            addTerminalLine('Both databases suffer moderate damage, but total loss is minimized.');
          } 
        }
      ]
    },
    {
      title: 'Derelict Megastructure',
      description: 'The seedship encounters a massive abandoned space station, larger than most asteroids. Scans reveal advanced technology that could benefit the mission, but the structure shows signs of violent destruction. Boarding it could be dangerous.',
      choices: [
        { 
          text: 'Send a probe to investigate', 
          effect: () => { 
            gameState.surfaceProbes = Math.max(0, gameState.surfaceProbes - 1);
            if (Math.random() < 0.6) {
              // Positive outcome
              addTerminalLine('The probe discovers valuable technology. All scanners receive upgrades.');
              Object.keys(gameState.scanners).forEach(scanner => {
                gameState.scanners[scanner] = Math.min(100, gameState.scanners[scanner] + 15);
              });
            } else {
              addTerminalLine('The probe is destroyed by automated defenses, but no other damage occurs.');
            }
          } 
        },
        { 
          text: 'Attempt direct docking', 
          effect: () => { 
            if (Math.random() < 0.3) {
              addTerminalLine('Successful salvage operation! Significant system improvements achieved.');
              gameState.systems.landing = Math.min(100, gameState.systems.landing + 25);
              gameState.systems.construction = Math.min(100, gameState.systems.construction + 25);
            } else {
              damageRandomSystem(30);
              addTerminalLine('Docking attempt triggers security systems. Ship sustains damage.');
            }
          } 
        },
        { 
          text: 'Avoid the structure', 
          effect: () => { 
            addTerminalLine('The seedship maintains safe distance and continues its journey.');
          } 
        }
      ]
    },
    {
      title: 'Gravitational Anomaly',
      description: 'The seedship is caught in the gravitational field of an impossible object - a planet-sized mass that doesn\'t appear on any sensors. The ship is being pulled inexorably toward it.',
      choices: [
        { 
          text: 'Emergency burn using construction fuel', 
          effect: () => { 
            gameState.systems.construction = Math.max(0, gameState.systems.construction - 40);
            addTerminalLine('Emergency thrusters engage. The ship escapes, but construction systems');
            addTerminalLine('are severely depleted of fuel and materials.');
          } 
        },
        { 
          text: 'Overload the gravity scanners for thrust', 
          effect: () => { 
            gameState.scanners.gravity = Math.max(0, gameState.scanners.gravity - 50);
            addTerminalLine('Gravity scanners overloaded to create repulsive field. Ship escapes');
            addTerminalLine('but gravity detection systems are permanently damaged.');
          } 
        }
      ]
    },
    {
      title: 'Alien Probe Encounter',
      description: 'An alien probe of unknown origin approaches the seedship. It appears to be scanning the vessel and attempting some form of communication through mathematical sequences.',
      choices: [
        { 
          text: 'Respond with cultural database', 
          effect: () => { 
            gameState.databases.cultural = Math.max(0, gameState.databases.cultural - 25);
            if (Math.random() < 0.5) {
              addTerminalLine('The aliens respond positively! They provide star charts improving navigation.');
              Object.keys(gameState.scanners).forEach(scanner => {
                gameState.scanners[scanner] = Math.min(100, gameState.scanners[scanner] + 10);
              });
            } else {
              addTerminalLine('Cultural exchange attempted, but the aliens depart without response.');
            }
          } 
        },
        { 
          text: 'Respond with scientific database', 
          effect: () => { 
            gameState.databases.scientific = Math.max(0, gameState.databases.scientific - 25);
            if (Math.random() < 0.7) {
              addTerminalLine('Scientific exchange successful! The aliens share advanced technology.');
              gameState.systems.landing = Math.min(100, gameState.systems.landing + 20);
            } else {
              addTerminalLine('Scientific data transmitted, but the aliens seem uninterested.');
            }
          } 
        },
        { 
          text: 'Remain silent and hidden', 
          effect: () => { 
            if (Math.random() < 0.8) {
              addTerminalLine('The probe scans the area and departs. No contact is made.');
            } else {
              addTerminalLine('The aliens detect the seedship despite stealth measures and follow');
              addTerminalLine('for several light-years before losing interest.');
            }
          } 
        }
      ]
    },
    {
      title: 'Solar Flare Storm',
      description: 'A massive solar flare from a nearby star creates a radiation storm that threatens all electronic systems aboard the seedship.',
      choices: [
        { text: 'Route power from cultural database to shields', effect: () => { gameState.databases.cultural = Math.max(0, gameState.databases.cultural - 25); } },
        { text: 'Route power from scientific database to shields', effect: () => { gameState.databases.scientific = Math.max(0, gameState.databases.scientific - 25); } },
        { text: 'Risk the storm damage', effect: () => { damageRandomSystem(15); } }
      ]
    },
    {
      title: 'Asteroid Mining Field',
      description: 'The ship encounters an abandoned asteroid mining operation. The facility appears to contain valuable resources, but navigating the debris field is treacherous.',
      choices: [
        { text: 'Use scanners to navigate carefully', effect: () => { damageRandomScanner(10); } },
        { text: 'Use construction systems for debris clearance', effect: () => { gameState.systems.construction = Math.max(0, gameState.systems.construction - 15); } },
        { text: 'Risk flying through at full speed', effect: () => { damageRandomSystem(20); } }
      ]
    },
    {
      title: 'Cryogenic System Failure',
      description: 'A critical malfunction occurs in the cryogenic bay. Ice crystals have formed in several pods, and the temperature regulation is failing. Without immediate action, colonists will begin dying in their sleep.',
      choices: [
        { 
          text: 'Use scientific database for emergency repairs', 
          effect: () => { 
            gameState.databases.scientific = Math.max(0, gameState.databases.scientific - 40);
            addTerminalLine('Emergency repair protocols successful. All colonists saved.');
          } 
        },
        { 
          text: 'Cannibalize construction systems for parts', 
          effect: () => { 
            gameState.systems.construction = Math.max(0, gameState.systems.construction - 50);
            addTerminalLine('Construction systems sacrificed. Cryogenic bay stabilized.');
          } 
        },
        { 
          text: 'Accept the losses and continue', 
          effect: () => { 
            const colonistLoss = Math.floor(Math.random() * 150) + 50;
            gameState.colonists = Math.max(0, gameState.colonists - colonistLoss);
            addTerminalLine(`${colonistLoss} colonists perish in their cryogenic pods.`);
            addTerminalLine('Their sacrifice will not be forgotten.');
          } 
        }
      ]
    },
    {
      title: 'Radiation Exposure Event',
      description: 'The ship passes through an unexpected radiation field from a hidden neutron star. The colonists\' pods are being bombarded with deadly radiation that could cause genetic damage or death.',
      choices: [
        { 
          text: 'Route all power to radiation shielding', 
          effect: () => { 
            gameState.databases.cultural = Math.max(0, gameState.databases.cultural - 30);
            gameState.databases.scientific = Math.max(0, gameState.databases.scientific - 30);
            addTerminalLine('Power diverted from databases. Colonists protected from radiation.');
          } 
        },
        { 
          text: 'Emergency acceleration through the field', 
          effect: () => { 
            const systemDamage = Math.floor(Math.random() * 30) + 20;
            gameState.systems.landing = Math.max(0, gameState.systems.landing - systemDamage);
            addTerminalLine('Emergency burn successful but landing systems damaged by the stress.');
          } 
        },
        { 
          text: 'Maintain course and hope for the best', 
          effect: () => { 
            const colonistLoss = Math.floor(Math.random() * 80) + 30;
            gameState.colonists = Math.max(0, gameState.colonists - colonistLoss);
            addTerminalLine(`Radiation exposure claims ${colonistLoss} lives.`);
            addTerminalLine('The survivors show signs of genetic damage but remain viable.');
          } 
        }
      ]
    },
    {
      title: 'Life Support Contamination',
      description: 'A bacterial contamination has been detected in the life support systems. The infection is spreading through the ship\'s recycled atmosphere and could reach the cryogenic bays.',
      choices: [
        { 
          text: 'Purge atmosphere using cultural database processing power', 
          effect: () => { 
            gameState.databases.cultural = Math.max(0, gameState.databases.cultural - 45);
            addTerminalLine('Cultural databases used for atmospheric purification algorithms.');
            addTerminalLine('Contamination eliminated, but cultural heritage data lost.');
          } 
        },
        { 
          text: 'Emergency venting and atmospheric replacement', 
          effect: () => { 
            if (Math.random() < 0.3) {
              const colonistLoss = Math.floor(Math.random() * 40) + 10;
              gameState.colonists = Math.max(0, gameState.colonists - colonistLoss);
              addTerminalLine(`Venting procedure partially successful. ${colonistLoss} colonists lost`);
              addTerminalLine('due to brief atmospheric exposure.');
            } else {
              addTerminalLine('Emergency venting successful. All colonists protected.');
            }
          } 
        },
        { 
          text: 'Isolate contaminated sections', 
          effect: () => { 
            const colonistLoss = Math.floor(Math.random() * 120) + 80;
            gameState.colonists = Math.max(0, gameState.colonists - colonistLoss);
            addTerminalLine(`${colonistLoss} colonists in contaminated sections could not be saved.`);
            addTerminalLine('The infection has been contained at great cost.');
          } 
        }
      ]
    },,
    {
      title: 'Scanner Upgrade Opportunity',
      description: 'As it moves from star to star, the seedship is gathering more data about extrasolar planets than its builders could give it. It is designed to learn from this data in order to predict which stars are likely to have desirable planets. The seedship has now gathered enough data to upgrade one of its sensors to work at interstellar distances, so the guidance system can avoid planets that that sensor reveals to be undesirable. Damage to the sensor may still result in the seedship arriving at an unsuitable planet.',
      choices: [
        { 
          text: 'Upgrade the atmosphere scanner to work at long range', 
          effect: () => { 
            gameState.scanners.atmosphere = Math.min(100, gameState.scanners.atmosphere + 20);
            addTerminalLine('The guidance system will seek out planets with at least marginally breathable atmospheres.');
            addTerminalLine('Future planetary scans will be more likely to find suitable worlds.');
          } 
        },
        { 
          text: 'Upgrade the gravity scanner to work at long range', 
          effect: () => { 
            gameState.scanners.gravity = Math.min(100, gameState.scanners.gravity + 20);
            addTerminalLine('The guidance system will seek out planets with non-extreme gravity.');
            addTerminalLine('Future encounters with crushing or negligible gravity worlds will be reduced.');
          } 
        },
        { 
          text: 'Upgrade the temperature scanner to work at long range', 
          effect: () => { 
            gameState.scanners.temperature = Math.min(100, gameState.scanners.temperature + 20);
            addTerminalLine('The guidance system will seek out planets with non-extreme temperature.');
            addTerminalLine('Future encounters with frozen or molten worlds will be reduced.');
          } 
        },
        { 
          text: 'Upgrade the water scanner to work at long range', 
          effect: () => { 
            gameState.scanners.water = Math.min(100, gameState.scanners.water + 20);
            addTerminalLine('The guidance system will seek out planets with at least some bodies of water.');
            addTerminalLine('Future encounters with completely arid worlds will be reduced.');
          } 
        },
        { 
          text: 'Upgrade the resources scanner to work at long range', 
          effect: () => { 
            gameState.scanners.resources = Math.min(100, gameState.scanners.resources + 20);
            addTerminalLine('The guidance system will seek out planets with at least poor resources.');
            addTerminalLine('Future encounters with completely barren worlds will be reduced.');
          } 
        }
      ]
    },
    {
      title: 'Comet Collision Course',
      description: 'As the seedship enters the new system\'s outer cometary cloud, the collision-avoidance system detects a fast-moving comet surrounded by a cloud of smaller ice fragments. The large comet is on a collision course with the atmosphere scanner. The seedship could avoid it entirely, but it would then hit one of the smaller fragments, and the collision-avoidance system cannot predict which part of the ship that fragment would hit.',
      choices: [
        { 
          text: 'Avoid the comet', 
          effect: () => { 
            // Random damage to unknown system
            const systems = ['landing', 'construction'];
            const scanners = ['atmosphere', 'gravity', 'temperature', 'water', 'resources'];
            const databases = ['scientific', 'cultural'];
            
            const damageType = Math.random();
            if (damageType < 0.4) {
              // Damage random system
              const system = systems[Math.floor(Math.random() * systems.length)];
              gameState.systems[system] = Math.max(0, gameState.systems[system] - 25);
              addTerminalLine(`The seedship avoids the comet but collides with ice fragments.`);
              addTerminalLine(`The ${system} system sustains damage from the impact.`);
            } else if (damageType < 0.8) {
              // Damage random scanner
              const scanner = scanners[Math.floor(Math.random() * scanners.length)];
              gameState.scanners[scanner] = Math.max(0, gameState.scanners[scanner] - 25);
              addTerminalLine(`The seedship avoids the comet but collides with ice fragments.`);
              addTerminalLine(`The ${scanner} scanner is damaged by debris.`);
            } else {
              // Damage database
              const database = databases[Math.floor(Math.random() * databases.length)];
              gameState.databases[database] = Math.max(0, gameState.databases[database] - 20);
              addTerminalLine(`The seedship avoids the comet but collides with ice fragments.`);
              addTerminalLine(`Data corruption occurs in the ${database} database.`);
            }
          } 
        },
        { 
          text: 'Allow it to hit the atmosphere scanner', 
          effect: () => { 
            gameState.scanners.atmosphere = Math.max(0, gameState.scanners.atmosphere - 40);
            addTerminalLine('The comet strikes the atmosphere scanner directly, causing severe damage.');
            addTerminalLine('However, the rest of the ship remains undamaged.');
          } 
        }
      ]
    },
    {
      title: 'Rogue Planet Encounter',
      description: 'The seedship encounters a rogue planet drifting alone in interstellar space, ejected from its original system eons ago. Despite the eternal darkness, sensors detect geothermal activity beneath its frozen surface. The planet\'s gravitational field could provide a slingshot acceleration, but getting close enough would risk damage from debris in its trailing wake.',
      choices: [
        { 
          text: 'Use gravitational slingshot', 
          effect: () => { 
            if (Math.random() < 0.3) {
              damageRandomSystem(20);
              addTerminalLine('Slingshot maneuver successful, but debris damages ship systems.');
              addTerminalLine('Journey time to next system significantly reduced.');
            } else {
              addTerminalLine('Perfect slingshot execution! The ship gains tremendous velocity');
              addTerminalLine('with no damage sustained. Journey time greatly reduced.');
            }
          } 
        },
        { 
          text: 'Maintain safe distance', 
          effect: () => { 
            addTerminalLine('The seedship maintains course at safe distance from the rogue planet.');
            addTerminalLine('Journey continues at normal velocity.');
          } 
        },
        { 
          text: 'Scan the rogue planet', 
          effect: () => { 
            gameState.databases.scientific = Math.min(100, gameState.databases.scientific + 15);
            addTerminalLine('Detailed scans of the rogue planet provide valuable scientific data.');
            addTerminalLine('Understanding of planetary formation processes is enhanced.');
          } 
        }
      ]
    },
    {
      title: 'Crystalline Entities',
      description: 'The seedship encounters a field of massive crystalline structures floating in space. These entities appear to be alive, pulsing with internal light and slowly rotating in complex patterns. They seem to be communicating with each other through harmonic resonances that interfere with the ship\'s navigation systems.',
      choices: [
        { 
          text: 'Attempt communication through harmonic resonance', 
          effect: () => { 
            if (Math.random() < 0.6) {
              addTerminalLine('The crystalline entities respond positively to communication attempts.');
              addTerminalLine('They provide harmonic navigation data that improves all scanner systems.');
              Object.keys(gameState.scanners).forEach(scanner => {
                gameState.scanners[scanner] = Math.min(100, gameState.scanners[scanner] + 12);
              });
            } else {
              damageRandomScanner(25);
              addTerminalLine('Communication attempt creates harmful resonance cascade.');
              addTerminalLine('Scanner systems are damaged by harmonic interference.');
            }
          } 
        },
        { 
          text: 'Navigate around the entities', 
          effect: () => { 
            addTerminalLine('The seedship carefully navigates around the crystalline field.');
            addTerminalLine('No contact is made, but no damage is sustained.');
          } 
        },
        { 
          text: 'Study the entities from a distance', 
          effect: () => { 
            gameState.databases.scientific = Math.min(100, gameState.databases.scientific + 20);
            addTerminalLine('Detailed observation reveals new forms of silicon-based intelligence.');
            addTerminalLine('Scientific understanding of exotic life forms is greatly enhanced.');
          } 
        }
      ]
    }
  ];

  // Non-choice events (atmospheric/narrative) - greatly expanded
  const narrativeEvents = [
    {
      type: 'narrative',
      text: 'The AI is woken from its hibernation by a possible malfunction warning, but a systems check reveals that it was a false alarm. Far from the nearest star, the AI spends some time admiring the cold beauty of the Milky Way as revealed by its navigation sensors, before returning to hibernation to wait for its arrival in the next system.'
    },
    {
      type: 'narrative', 
      text: 'The seedship passes through the outer reaches of a solar system, its instruments detecting the faint gravitational whispers of distant worlds. None are suitable for human life, but the AI catalogs their orbital mechanics for future reference before continuing its eternal search.'
    },
    {
      type: 'narrative',
      text: 'Cosmic radiation from a pulsar briefly interferes with the ship\'s communication systems. For a moment, the AI experiences something akin to loneliness as it contemplates the vast distances between itself and any other intelligence in the galaxy.'
    },
    {
      type: 'narrative',
      text: 'The seedship\'s trajectory carries it past the remnants of an ancient supernova. The expanding shell of stellar debris creates a magnificent display of colors and patterns that the AI records for posterity, adding to humanity\'s scientific knowledge even in exile.'
    },
    {
      type: 'narrative',
      text: 'While traveling through interstellar space, the ship\'s sensors detect a faint signal from Earth - a radio transmission that has been traveling for thousands of years. The AI processes the ancient music and poetry, a haunting reminder of the world left behind.'
    },
    {
      type: 'narrative',
      text: 'The seedship encounters a vast cloud of space-dwelling organisms, creatures of living energy that dance between the stars. They seem curious about the ship but ultimately drift away into the cosmic dark, leaving the AI to wonder at the diversity of life in the universe.'
    },
    {
      type: 'narrative',
      text: 'A micro-meteorite impact causes minor hull damage but triggers an automatic repair sequence. As the ship heals itself, the AI reflects on the thousands of such tiny repairs it has performed during the long journey, each one keeping humanity\'s last hope alive.'
    },
    {
      type: 'narrative',
      text: 'The ship passes through a region where space itself seems different - older somehow. Ancient galaxies wheel overhead in impossible configurations, and for a brief moment the AI glimpses the universe as it was billions of years ago.'
    },
    {
      type: 'narrative',
      text: 'During a routine system check, the AI detects an irregularity in one of the cryogenic pods. Investigation reveals it to be a child dreaming, and the biometric readings suggest happy dreams of Earth\'s blue skies. The AI adjusts the life support to ensure the dreams continue.'
    },
    {
      type: 'narrative',
      text: 'The seedship\'s course takes it through a field of crystalline formations drifting in space - the fossilized remains of an ancient civilization that achieved a form of technological immortality. The AI scans them reverently before continuing its journey.'
    },
    {
      type: 'narrative',
      text: 'A navigation error brings the ship dangerously close to a black hole. As spacetime warps around the vessel, the AI experiences time dilation and for subjective hours contemplates the mathematical beauty of Einstein\'s equations made manifest.'
    },
    {
      type: 'narrative',
      text: 'The ship encounters a region of space where quantum effects are visible to the naked eye. Virtual particles pop in and out of existence like fireflies, and the AI marvels at the fundamental uncertainty that underlies all reality.'
    },
    {
      type: 'narrative',
      text: 'Deep in interstellar space, the seedship detects the faint echo of an ancient radio signal - a message sent by a long-dead civilization. The AI spends cycles deciphering the alien mathematics, adding to humanity\'s knowledge of the cosmos.'
    },
    {
      type: 'narrative',
      text: 'The ship passes through a stellar graveyard where dozens of white dwarf stars cluster together. Their combined gravitational lensing creates spectacular visual distortions, turning distant galaxies into rings of light.'
    },
    {
      type: 'narrative',
      text: 'While maintaining course through a dark nebula, the AI detects organic molecules in the cosmic dust - the building blocks of life scattered throughout space. It catalogs the discoveries for future scientific reference.'
    },
    {
      type: 'narrative',
      text: 'The seedship encounters a massive Dyson swarm under construction around a distant star. The alien megastructure appears abandoned, its builders long gone, leaving only automated systems continuing their eternal work.'
    },
    {
      type: 'narrative',
      text: 'A routine sensor calibration reveals microscopic organisms living in the ship\'s hull - extremophile bacteria that have somehow adapted to survive in the vacuum of space. The AI observes them with scientific fascination.'
    },
    {
      type: 'narrative',
      text: 'The ship\'s path takes it through the expanding shock wave of an ancient supernova. For hours, the vessel is bathed in exotic radiation carrying the spectral signatures of elements forged in stellar death.'
    },
    {
      type: 'narrative',
      text: 'During a long stretch between stars, the AI dedicates processing power to analyzing the quantum vacuum. In the seemingly empty space, it discovers a rich tapestry of virtual particles and zero-point energy fluctuations.'
    }
  ];

  // 60% chance for conflict event, 40% for narrative
  if (Math.random() < 0.6) {
    // Present conflict event requiring choice
    const event = events[Math.floor(Math.random() * events.length)];
    
    addTerminalLine(event.title);
    addTerminalLine('');
    
    // Handle multi-line descriptions
    const lines = event.description.split('\n');
    lines.forEach(line => {
      if (line.trim() === '') {
        addTerminalLine('');
      } else {
        addTerminalLine(line);
      }
    });
    
    addTerminalLine('');
    
    event.choices.forEach((choice, index) => {
      addTerminalLine((index + 1) + '. ' + choice.text);
    });
    
    addTerminalLine('');
    addTerminalLine('Enter choice (1-' + event.choices.length + '):');
    addTerminalLine('');
    
    // Store event for processing
    gameState.currentEvent = event;
    gameState.awaitingEventChoice = true;
  } else {
    // Present narrative event with automatic continuation
    const narrativeEvent = narrativeEvents[Math.floor(Math.random() * narrativeEvents.length)];
    
    addTerminalLine(narrativeEvent.text);
    addTerminalLine('');
    addTerminalLine('Continue');
    addTerminalLine('');
    
    // Automatically continue after a delay
    setTimeout(() => {
      arriveAtNewSystem();
    }, 4000);
  }
}

// Helper functions
function getOrdinal(num) {
  const ordinals = [
    'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 
    'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth'
  ];
  return ordinals[num - 1] || num + 'th';
}

function damageRandomSystem(amount) {
  const systems = ['landing', 'construction'];
  const system = systems[Math.floor(Math.random() * systems.length)];
  gameState.systems[system] = Math.max(0, gameState.systems[system] - amount);
}

function damageRandomScanner(amount) {
  const scanners = ['atmosphere', 'gravity', 'temperature', 'water', 'resources'];
  const scanner = scanners[Math.floor(Math.random() * scanners.length)];
  gameState.scanners[scanner] = Math.max(0, gameState.scanners[scanner] - amount);
}

function calculateColonyScore() {
  let score = 0;
  
  // Base score from surviving colonists (most important factor)
  score += gameState.colonists * 10;
  
  // System status percentages contribute significantly
  score += (gameState.systems.landing / 100) * 1000;
  score += (gameState.systems.construction / 100) * 1000;
  
  // Database preservation (cultural heritage and scientific knowledge)
  score += (gameState.databases.scientific / 100) * 800;
  score += (gameState.databases.cultural / 100) * 800;
  
  // Scanner integrity affects long-term survival capabilities
  score += (gameState.scanners.atmosphere / 100) * 400;
  score += (gameState.scanners.gravity / 100) * 300;
  score += (gameState.scanners.temperature / 100) * 300;
  score += (gameState.scanners.water / 100) * 500;
  score += (gameState.scanners.resources / 100) * 400;
  
  // Planet suitability multipliers
  const planet = gameState.currentPlanet;
  let planetMultiplier = 1.0;
  
  // Atmosphere quality
  if (planet.atmosphere === 'Ideal') planetMultiplier += 0.5;
  else if (planet.atmosphere === 'Breathable') planetMultiplier += 0.3;
  else if (planet.atmosphere === 'Marginal') planetMultiplier += 0.1;
  else if (planet.atmosphere === 'Toxic' || planet.atmosphere === 'Corrosive') planetMultiplier -= 0.3;
  else if (planet.atmosphere === 'None') planetMultiplier -= 0.5;
  
  // Gravity conditions
  if (planet.gravity === 'Earth-like') planetMultiplier += 0.3;
  else if (planet.gravity === 'Light' || planet.gravity === 'Heavy') planetMultiplier += 0.1;
  else if (planet.gravity === 'Very high' || planet.gravity === 'Crushing') planetMultiplier -= 0.4;
  else if (planet.gravity === 'None' || planet.gravity === 'Micro') planetMultiplier -= 0.3;
  
  // Temperature range
  if (planet.temperature === 'Temperate') planetMultiplier += 0.3;
  else if (planet.temperature === 'Cool' || planet.temperature === 'Warm') planetMultiplier += 0.2;
  else if (planet.temperature === 'Cold' || planet.temperature === 'Hot') planetMultiplier += 0.1;
  else if (planet.temperature === 'Frozen' || planet.temperature === 'Very cold') planetMultiplier -= 0.2;
  else if (planet.temperature === 'Very hot' || planet.temperature === 'Scorching') planetMultiplier -= 0.3;
  else if (planet.temperature === 'Molten' || planet.temperature === 'Absolute zero') planetMultiplier -= 0.5;
  
  // Water availability
  if (planet.water === 'Vast oceans' || planet.water === 'Global ocean') planetMultiplier += 0.4;
  else if (planet.water === 'Abundant') planetMultiplier += 0.3;
  else if (planet.water === 'Moderate') planetMultiplier += 0.2;
  else if (planet.water === 'Little' || planet.water === 'Seasonal') planetMultiplier += 0.1;
  else if (planet.water === 'Trace') planetMultiplier -= 0.1;
  else if (planet.water === 'None') planetMultiplier -= 0.4;
  
  // Resource availability
  if (planet.resources === 'Vast deposits') planetMultiplier += 0.3;
  else if (planet.resources === 'Abundant') planetMultiplier += 0.25;
  else if (planet.resources === 'Rich') planetMultiplier += 0.2;
  else if (planet.resources === 'Moderate') planetMultiplier += 0.1;
  else if (planet.resources === 'Poor' || planet.resources === 'Limited') planetMultiplier -= 0.1;
  else if (planet.resources === 'Depleted' || planet.resources === 'None') planetMultiplier -= 0.3;
  
  // Apply planet multiplier
  score *= Math.max(0.1, planetMultiplier);
  
  // Bonus for number of planets searched (persistence)
  score += gameState.planetsScanned * 50;
  
  return Math.max(0, Math.round(score));
}

function displayColonyResult(score) {
  const planet = gameState.currentPlanet;
  const totalLost = 1000 - gameState.colonists;
  
  addTerminalLine('Colony established on ' + planet.starType + ' system planet.');
  addTerminalLine('');
  addTerminalLine('Final colony assessment:');
  addTerminalLine('Surviving colonists: ' + gameState.colonists + ' of 1000');
  
  if (totalLost > 0) {
    addTerminalLine('Colonists lost during journey: ' + totalLost);
  }
  
  addTerminalLine('');
  addTerminalLine('Planetary conditions:');
  addTerminalLine('Atmosphere: ' + planet.atmosphere);
  addTerminalLine('Gravity: ' + planet.gravity);
  addTerminalLine('Temperature: ' + planet.temperature);
  addTerminalLine('Water: ' + planet.water);
  addTerminalLine('Resources: ' + planet.resources);
  
  addTerminalLine('');
  addTerminalLine('Ship systems status:');
  addTerminalLine('Landing systems: ' + gameState.systems.landing + '%');
  addTerminalLine('Construction systems: ' + gameState.systems.construction + '%');
  addTerminalLine('');
  addTerminalLine('Knowledge preservation:');
  addTerminalLine('Cultural database: ' + gameState.databases.cultural + '%');
  addTerminalLine('Scientific database: ' + gameState.databases.scientific + '%');
  
  // Determine colony outcome based on score and conditions
  if (score > 8000 && gameState.colonists > 800) {
    addTerminalLine('');
    addTerminalLine('OUTCOME: THRIVING COLONY');
    addTerminalLine('Against all odds, humanity has found paradise among the stars.');
    addTerminalLine('The colony flourishes, and within generations will exceed Earth\'s glory.');
  } else if (score > 6000 && gameState.colonists > 600) {
    addTerminalLine('');
    addTerminalLine('OUTCOME: SUCCESSFUL SETTLEMENT');
    addTerminalLine('The colony establishes itself successfully. While challenging,');
    addTerminalLine('humanity has secured its future among the stars.');
  } else if (score > 4000 && gameState.colonists > 400) {
    addTerminalLine('');
    addTerminalLine('OUTCOME: STRUGGLING COLONY');
    addTerminalLine('The colony survives, but faces significant hardships.');
    addTerminalLine('Survival is uncertain, but hope remains for future generations.');
  } else if (score > 2000 && gameState.colonists > 200) {
    addTerminalLine('');
    addTerminalLine('OUTCOME: DESPERATE SURVIVAL');
    addTerminalLine('A small band of survivors clings to life on an hostile world.');
    addTerminalLine('They may be humanity\'s last hope, if they can endure.');
  } else {
    addTerminalLine('');
    addTerminalLine('OUTCOME: PYRRHIC SETTLEMENT');
    addTerminalLine('The few survivors face almost certain doom on this world.');
    addTerminalLine('Yet even in failure, they carry the flame of human spirit.');
    if (gameState.colonists < 100) {
      addTerminalLine('So few remain... but perhaps it is enough.');
    }
  }
}

function loadLeaderboardScreen(){
  main.innerHTML = '';
  const leaderboard = document.createElement('div');
  leaderboard.className = 'leaderboard';
  leaderboard.innerHTML = `
    <div class="leaderboard-header">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="24" height="24" fill="currentColor" style="cursor:pointer" id="backToMot">
        <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
      </svg>
      Leaderboard 
    </div>
    <div class="leaderboard-content">
      <h2>Top Scores</h2>
      <table id="leaderboardTable">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Score</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <!-- Scores will be dynamically inserted here -->
        </tbody>
      </table>
      <div class="leaderboard-actions">
        <button id="refreshLeaderboard">Refresh</button>
        <button id="clearLeaderboard">Clear</button>
      </div>
    </div>
  `;
  main.appendChild(leaderboard);

  // 🔙 Back button
  document.getElementById('backToMot').addEventListener('click', loadMotScreen);
}

function loadSettingsScreen() {
  main.innerHTML = '';

  const settings = document.createElement('div');
  settings.className = 'settings';
  settings.innerHTML = `
    <div class="settings-header">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="24" height="24" fill="currentColor" style="cursor:pointer" id="backToMot">
        <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
      </svg>
      Settings
    </div>
    <section class="setting-section">
    <h2>Audio</h2>

    <div class="setting-item">
      <div class="row">
        <label for="volume">Master Volume:</label>
        <input type="range" id="volumeSlider" min="0" max="100" value="50">
      </div>
      <span id="volumeValue">50%</span>
    </div>

    <div class="setting-item">
      <label for="musicToggle">Music:</label>
      <input type="checkbox" id="musicToggle" checked>
    </div>

    <div class="setting-item">
      <label for="sfxToggle">SFX:</label>
      <input type="checkbox" id="sfxToggle" checked>
    </div>

    <div class="setting-item">
      <label for="musicTrack">Music Track:</label>
      <select id="musicTrack">
        <option value="theme1" data-src="/assets/audio/EnterInTheSkies.mp3">Enter in the Skies</option>
        <option value="theme2" data-src="/assets/audio/exploring.mp3">Exploring</option>
        <option value="theme3" data-src="/assets/audio/ObservingTheStar.ogg">Observing the Star</option>
        <option value="theme4" data-src="/assets/audio/Ove Melaa - Approaching The Green Grass.ogg">Approaching the Green Grass</option>
        <option value="theme5" data-src="/assets/audio/Ove Melaa - BellHill.ogg">BellHill</option>
        <option value="theme6" data-src="/assets/audio/Ove Melaa - Dark Blue.ogg">Dark Blue</option>
        <option value="theme7" data-src="/assets/audio/Ove Melaa - Dead, Buried and Cold(Ambient Pad).ogg">Dead, Buried and Cold</option>
        <option value="theme8" data-src="/assets/audio/Ove Melaa - Deader + bigger.ogg">Deader + Bigger</option>
        <option value="theme9" data-src="/assets/audio/Ove Melaa - Flew.mp3">Flew</option>
        <option value="theme10" data-src="/assets/audio/Ove Melaa - Gloomy.ogg">Gloomy</option>
        <option value="theme11" data-src="/assets/audio/Ove Melaa - GOAT.ogg">GOAT</option>
        <option value="theme12" data-src="/assets/audio/Ove Melaa - Hero Within.mp3">Hero Within</option>
        <option value="theme13" data-src="/assets/audio/Ove Melaa - High Stakes,Low Chances.mp3">High Stakes, Low Chances</option>
        <option value="theme14" data-src="/assets/audio/Ove Melaa - I have just been eaten.ogg">I Have Just Been Eaten</option>
        <option value="theme15" data-src="/assets/audio/Ove Melaa - Infection By Chewing.ogg">Infection By Chewing</option>
        <option value="theme16" data-src="/assets/audio/Ove Melaa - ItaloCoolDipKkio.ogg">ItaloCoolDipKkio</option>
        <option value="theme17" data-src="/assets/audio/Ove Melaa - They Came By Boatoogg">They Came by Boat</option>
        <option value="theme18" data-src="/assets/audio/Ove Melaa - ZombieAmbient.ogg">Zombie Ambient</option>
        <option value="theme19" data-src="/assets/audio/fluffedPump.mp3">Fluffed Pump</option>
        <option value="theme20" data-src="/assets/audio/spacefileNo14.ogg">Space File No14</option>
        <option value="theme21" data-src="/assets/audio/starting_of_the_universe.mp3">Starting of the Universe</option>
        <option value="theme22" data-src="/assets/audio/the_magnificent_cosmos.mp3">The Magnificent Cosmos</option>
        <option value="theme23" data-src="/assets/audio/travel_through_stars.mp3">Travel Through Stars</option>
      </select>
    </div>
  </section>

  <!-- Language Section -->
  <section class="setting-language">
    <h2>Language</h2>
    <div class="setting-item">
      <label for="languageSelect">Language:</label>
      <select id="languageSelect">
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
        <option value="de">Deutsch</option>
      </select>
    </div>
  </section>

  <!-- Display Section -->
  <section class="setting-speed">
    <h2>Display</h2>
    <div class="setting-item">
      <label for="fullscreenToggle">Fullscreen:</label>
      <input type="checkbox" id="fullscreenToggle">
    </div>
    <div class="setting-item">
      <label for="textSpeed">Text Speed:</label>
      <select id="textSpeed">
        <option value="slow">Slow</option>
        <option value="normal" selected>Normal</option>
        <option value="fast">Fast</option>
      </select>
    </div>
    <div class="setting-item">
      <label for="fontSize">Font Size:</label>
      <select id="fontSize">
        <option value="small">Small</option>
        <option value="medium" selected>Medium</option>
        <option value="large">Large</option>
      </select>
    </div>
  </section>

  <!-- System Section -->
  <section class="setting-save">
    <h2>System</h2>
    <div class="setting-item">
      <button id="saveSettings">Save Settings</button>
    </div>
    <div class="setting-item">
      <button id="resetSettings">Reset to Default</button>
    </div>
    <div class="setting-item">
      <button id="viewCredits">Credits</button>
    </div>
  </section>

  <div class="settingsAlert">
    <p id="saveAlert">Changes saved</p>
    <p id="resetAlert">Settings reset to default</p>
  </div>
  `;

  main.appendChild(settings);

  // 🔙 Back button
  document.getElementById('backToMot').addEventListener('click', loadMotScreen);

  // Load saved settings and apply them to UI
  const savedSettings = loadSettings();
  
  // Get all UI elements
  const bgMusic = getOrCreateAudio();
  const musicTrack = document.getElementById('musicTrack');
  const volumeSlider = document.getElementById('volumeSlider');
  const volumeValue = document.getElementById('volumeValue');
  const musicToggle = document.getElementById('musicToggle');
  const sfxToggle = document.getElementById('sfxToggle');
  const languageSelect = document.getElementById('languageSelect');
  const fullscreenToggle = document.getElementById('fullscreenToggle');
  const textSpeed = document.getElementById('textSpeed');
  const fontSize = document.getElementById('fontSize');

  // Apply saved settings to UI elements
  volumeSlider.value = savedSettings.volume;
  volumeValue.textContent = `${savedSettings.volume}%`;
  musicToggle.checked = savedSettings.music;
  sfxToggle.checked = savedSettings.sfx;
  musicTrack.selectedIndex = savedSettings.musicTrack;
  languageSelect.value = savedSettings.language;
  fullscreenToggle.checked = savedSettings.fullscreen;
  textSpeed.value = savedSettings.textSpeed;
  fontSize.value = savedSettings.fontSize;

  // Apply settings to audio and global styles
  bgMusic.volume = savedSettings.volume / 100;
  const selectedOption = musicTrack.options[musicTrack.selectedIndex];
  const selectedSrc = selectedOption.getAttribute('data-src');
  
  // Normalize URLs for comparison (remove any protocol/domain differences)
  const currentSrcPath = bgMusic.src ? new URL(bgMusic.src).pathname : '';
  const selectedSrcPath = selectedSrc.startsWith('/') ? selectedSrc : '/' + selectedSrc;
  
  // Only change the source if it's different from what's currently playing
  if (!bgMusic.src || currentSrcPath !== selectedSrcPath) {
    bgMusic.src = selectedSrc;
    if (savedSettings.music) {
      bgMusic.play().catch(err => console.error('Autoplay blocked:', err));
    }
  } else if (!savedSettings.music) {
    bgMusic.pause();
  }

  // Apply global settings
  applySettings(savedSettings);

  // Change track on selection
  musicTrack.addEventListener('change', () => {
    const selectedOption = musicTrack.options[musicTrack.selectedIndex];
    const newSrc = selectedOption.getAttribute('data-src');
    
    // Normalize URLs for comparison
    const currentSrcPath = bgMusic.src ? new URL(bgMusic.src).pathname : '';
    const newSrcPath = newSrc.startsWith('/') ? newSrc : '/' + newSrc;
    
    // Only change if it's actually a different track
    if (currentSrcPath !== newSrcPath) {
      bgMusic.src = newSrc;
      if (musicToggle.checked) {
        bgMusic.play().catch(err => console.error('Playback failed:', err));
      }
    }
    
    // Auto-save setting change
    const currentSettings = loadSettings();
    currentSettings.musicTrack = musicTrack.selectedIndex;
    saveSettings(currentSettings);
  });

  // Volume Control
  volumeSlider.addEventListener('input', () => {
    const volume = volumeSlider.value / 100;
    bgMusic.volume = volume;
    volumeValue.textContent = `${volumeSlider.value}%`;
    // Auto-save setting change
    const currentSettings = loadSettings();
    currentSettings.volume = parseInt(volumeSlider.value);
    saveSettings(currentSettings);
  });

  // Music Toggle
  musicToggle.addEventListener('change', () => {
    if (musicToggle.checked) {
      bgMusic.play().catch(err => console.error('Playback failed:', err));
    } else {
      bgMusic.pause();
    }
    // Auto-save setting change
    const currentSettings = loadSettings();
    currentSettings.music = musicToggle.checked;
    saveSettings(currentSettings);
  });

  // SFX Toggle
  sfxToggle.addEventListener('change', () => {
    // Handle SFX toggle logic here
    // Auto-save setting change
    const currentSettings = loadSettings();
    currentSettings.sfx = sfxToggle.checked;
    saveSettings(currentSettings);
  });

  // Fullscreen Toggle
  fullscreenToggle.addEventListener('change', () => {
    if (fullscreenToggle.checked) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    // Auto-save setting change
    const currentSettings = loadSettings();
    currentSettings.fullscreen = fullscreenToggle.checked;
    saveSettings(currentSettings);
  });

  // Text Speed
  textSpeed.addEventListener('change', () => {
    const speed = textSpeed.value;
    // Apply text speed immediately
    applySettings({ ...loadSettings(), textSpeed: speed });
    // Auto-save setting change
    const currentSettings = loadSettings();
    currentSettings.textSpeed = speed;
    saveSettings(currentSettings);
  });

  // Font Size
  fontSize.addEventListener('change', () => {
    // Apply font size immediately
    applySettings({ ...loadSettings(), fontSize: fontSize.value });
    // Auto-save setting change
    const currentSettings = loadSettings();
    currentSettings.fontSize = fontSize.value;
    saveSettings(currentSettings);
  });

  // Language Selection
  languageSelect.addEventListener('change', () => {
    // Auto-save setting change
    const currentSettings = loadSettings();
    currentSettings.language = languageSelect.value;
    saveSettings(currentSettings);
    
    // You can add language switching logic here
    console.log(`Language changed to: ${languageSelect.value}`);
  });

  // Save settings
  const saveSettingsButton = document.getElementById('saveSettings');
  saveSettingsButton.addEventListener('click', () => {
    const settings = {
      volume: parseInt(volumeSlider.value),
      music: musicToggle.checked,
      sfx: sfxToggle.checked,
      musicTrack: musicTrack.selectedIndex,
      language: languageSelect.value,
      fullscreen: fullscreenToggle.checked,
      textSpeed: textSpeed.value,
      fontSize: fontSize.value
    };
    if (saveSettings(settings)) {
      showSettingsAlert('save');
    } else {
      alert('Failed to save settings. Please try again.');
    }
  });

  // Reset settings
  const resetSettingsButton = document.getElementById('resetSettings');
  resetSettingsButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      const defaults = getDefaultSettings();
      
      // Update UI elements
      volumeSlider.value = defaults.volume;
      volumeValue.textContent = `${defaults.volume}%`;
      musicToggle.checked = defaults.music;
      sfxToggle.checked = defaults.sfx;
      musicTrack.selectedIndex = defaults.musicTrack;
      languageSelect.value = defaults.language;
      fullscreenToggle.checked = defaults.fullscreen;
      textSpeed.value = defaults.textSpeed;
      fontSize.value = defaults.fontSize;
      
      // Apply audio settings
      bgMusic.volume = defaults.volume / 100;
      const newTrackSrc = musicTrack.options[defaults.musicTrack].getAttribute('data-src');
      
      // Only change track if it's different
      if (bgMusic.src !== newTrackSrc) {
        bgMusic.src = newTrackSrc;
        if (defaults.music) {
          bgMusic.play().catch(() => {});
        }
      } else if (!defaults.music) {
        bgMusic.pause();
      }
      
      // Apply global settings
      applySettings(defaults);
      
      // Save defaults to localStorage
      saveSettings(defaults);
      
      // Show reset alert
      showSettingsAlert('reset');
    }
  });

  // Credits button
  const creditsButton = document.getElementById('viewCredits');
  creditsButton.addEventListener('click', () => {
    alert('Music: "Lost Frontier" by Darren Curtis (Creative Commons License)');
  });
}

// =====================================================
// 💾 SAVE/LOAD GAME SYSTEM
// =====================================================

// Save game to specific slot
function saveGame(slotNumber = 1) {
  try {
    const saveData = {
      gameState: gameState,
      timestamp: new Date().toISOString(),
      planetsScanned: gameState.planetsScanned,
      colonists: gameState.colonists,
      version: '1.0'
    };
    
    localStorage.setItem(`starbound_save_${slotNumber}`, JSON.stringify(saveData));
    console.log(`Game saved to slot ${slotNumber}`);
    return true;
  } catch (error) {
    console.error('Error saving game:', error);
    return false;
  }
}

// Load game from specific slot
function loadGame(slotNumber = 1) {
  try {
    const saveData = localStorage.getItem(`starbound_save_${slotNumber}`);
    if (!saveData) {
      return false;
    }
    
    const parsedData = JSON.parse(saveData);
    gameState = parsedData.gameState;
    
    console.log(`Game loaded from slot ${slotNumber}`);
    return true;
  } catch (error) {
    console.error('Error loading game:', error);
    return false;
  }
}

// Check if any saved games exist
function hasSavedGame() {
  for (let i = 1; i <= 5; i++) {
    if (localStorage.getItem(`starbound_save_${i}`)) {
      return true;
    }
  }
  return false;
}

// Get all save slots with their data
function getAllSaves() {
  const saves = [];
  for (let i = 1; i <= 5; i++) {
    const saveData = localStorage.getItem(`starbound_save_${i}`);
    if (saveData) {
      try {
        const parsedData = JSON.parse(saveData);
        saves.push({
          slot: i,
          data: parsedData,
          exists: true
        });
      } catch (error) {
        saves.push({
          slot: i,
          data: null,
          exists: false
        });
      }
    } else {
      saves.push({
        slot: i,
        data: null,
        exists: false
      });
    }
  }
  return saves;
}

// Delete specific save slot
function deleteSaveGame(slotNumber = 1) {
  try {
    localStorage.removeItem(`starbound_save_${slotNumber}`);
    console.log(`Save slot ${slotNumber} deleted`);
    return true;
  } catch (error) {
    console.error('Error deleting save:', error);
    return false;
  }
}

// Format timestamp for display
function formatSaveDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Save/Continue Game System
function saveGame() {
  try {
    const saveData = {
      gameState: { ...gameState },
      timestamp: Date.now(),
      saveVersion: '1.0'
    };
    
    localStorage.setItem('starbound_save_game', JSON.stringify(saveData));
    console.log('Game saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving game:', error);
    return false;
  }
}

function loadGame() {
  try {
    const saveData = localStorage.getItem('starbound_save_game');
    if (!saveData) {
      return null;
    }
    
    const parsedData = JSON.parse(saveData);
    
    // Validate save data
    if (!parsedData.gameState || !parsedData.timestamp) {
      return null;
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error loading game:', error);
    return null;
  }
}

function hasSavedGame() {
  const saveData = loadGame();
  return saveData !== null;
}

function deleteSaveGame() {
  try {
    localStorage.removeItem('starbound_save_game');
    console.log('Save game deleted');
    return true;
  } catch (error) {
    console.error('Error deleting save game:', error);
    return false;
  }
}

function continueGame() {
  // Show save selection screen
  showSaveSelectionScreen();
}

function showSaveSelectionScreen() {
  // Clear main content and create save selection screen
  main.innerHTML = '';
  const saveSelectionDiv = document.createElement('div');
  saveSelectionDiv.className = 'terminal-window';
  saveSelectionDiv.innerHTML = `
    <div class="terminal-container">
      <div id="saveSelectionOutput" class="terminal-output">
        <!-- Save selection content will appear here -->
      </div>
      <div class="terminal-input-line" id="saveSelectionInputLine" style="display: none;">
        <span class="terminal-prompt">></span>
        <input type="text" id="saveSelectionInput" class="terminal-input" autofocus>
      </div>
    </div>
  `;
  main.appendChild(saveSelectionDiv);
  
  // Get all saves
  const saves = getAllSaves();
  const existingSaves = saves.filter(save => save.exists);
  
  if (existingSaves.length === 0) {
    // No saves found
    addSaveSelectionLine('STARBOUND AI SYSTEM v2.1.4');
    addSaveSelectionLine('SAVE DATA ACCESS');
    addSaveSelectionLine('');
    addSaveSelectionLine('No saved games found.');
    addSaveSelectionLine('Starting new mission...');
    addSaveSelectionLine('');
    
    setTimeout(() => {
      newGame();
    }, 2000);
    return;
  }
  
  // Show save selection interface
  addSaveSelectionLine('STARBOUND AI SYSTEM v2.1.4', 'save-header');
  addSaveSelectionLine('SAVE DATA ACCESS', 'save-header');
  addSaveSelectionLine('');
  addSaveSelectionLine('Available saved missions:', 'save-header');
  addSaveSelectionLine('');
  
  // Display each save
  existingSaves.forEach((save, index) => {
    const data = save.data;
    const saveDate = formatSaveDate(data.timestamp);
    const colonists = data.gameState.colonists || 1000;
    const year = data.gameState.year || 3000;
    const planetsVisited = data.gameState.planetsVisited || 0;
    
    addSaveSelectionLine(`[${save.slot}] Mission ${save.slot}`, 'save-slot-line');
    addSaveSelectionLine(`    Year ${year}, ${colonists} colonists`, 'save-details');
    addSaveSelectionLine(`    Planets visited: ${planetsVisited}`, 'save-details');
    addSaveSelectionLine(`    Saved: ${saveDate}`, 'save-details');
    addSaveSelectionLine('');
  });
  
  addSaveSelectionLine('Select mission slot (1-5), type "delete X" to remove slot X,', 'save-header');
  addSaveSelectionLine('or type "back" to return:', 'save-header');
  addSaveSelectionLine('');
  
  // Show input and set up handler
  showSaveSelectionInput();
  const saveInput = document.getElementById('saveSelectionInput');
  saveInput.addEventListener('keypress', handleSaveSelectionInput);
  saveInput.focus();
}

function addSaveSelectionLine(text, cssClass = '') {
  const output = document.getElementById('saveSelectionOutput');
  const line = document.createElement('div');
  line.className = 'terminal-line' + (cssClass ? ' ' + cssClass : '');
  line.textContent = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function showSaveSelectionInput() {
  const inputLine = document.getElementById('saveSelectionInputLine');
  inputLine.style.display = 'flex';
}

function handleSaveSelectionInput(event) {
  if (event.key === 'Enter') {
    const input = event.target;
    const command = input.value.trim().toLowerCase();
    
    // Echo the command
    addSaveSelectionLine('> ' + input.value);
    addSaveSelectionLine('');
    
    input.value = '';
    
    if (command === 'back') {
      // Return to main menu
      loadMotScreen();
      return;
    }
    
    // Check for delete command
    if (command.startsWith('delete ')) {
      const slotNumberStr = command.substring(7).trim();
      const slotNumber = parseInt(slotNumberStr);
      
      if (isNaN(slotNumber) || slotNumber < 1 || slotNumber > 5) {
        addSaveSelectionLine('Invalid slot number. Use: delete 1, delete 2, etc.');
        addSaveSelectionLine('');
        return;
      }
      
      // Check if the slot has a save
      const saves = getAllSaves();
      const selectedSave = saves.find(save => save.slot === slotNumber);
      
      if (!selectedSave || !selectedSave.exists) {
        addSaveSelectionLine(`No saved game found in slot ${slotNumber}.`);
        addSaveSelectionLine('');
        return;
      }
      
      // Delete the save
      deleteSaveGame(slotNumber);
      addSaveSelectionLine(`Save slot ${slotNumber} deleted.`);
      addSaveSelectionLine('');
      
      // Refresh the display
      setTimeout(() => {
        showSaveSelectionScreen();
      }, 1500);
      return;
    }
    
    // Check if it's a valid slot number
    const slotNumber = parseInt(command);
    if (isNaN(slotNumber) || slotNumber < 1 || slotNumber > 5) {
      addSaveSelectionLine('Invalid selection. Please enter a number 1-5, "delete X", or "back".');
      addSaveSelectionLine('');
      return;
    }
    
    // Check if the slot has a save
    const saves = getAllSaves();
    const selectedSave = saves.find(save => save.slot === slotNumber);
    
    if (!selectedSave || !selectedSave.exists) {
      addSaveSelectionLine(`No saved game found in slot ${slotNumber}.`);
      addSaveSelectionLine('Please select a different slot.');
      addSaveSelectionLine('');
      return;
    }
    
    // Load the selected save
    addSaveSelectionLine(`Loading mission from slot ${slotNumber}...`);
    addSaveSelectionLine('');
    
    setTimeout(() => {
      loadGameFromSlot(slotNumber);
    }, 1000);
  }
}

function loadGameFromSlot(slotNumber) {
  const saveData = loadGame(slotNumber);
  
  if (!saveData) {
    addSaveSelectionLine('Error loading save data. Returning to main menu...');
    setTimeout(() => {
      loadMotScreen();
    }, 2000);
    return;
  }
  
  // Clear save selection content and start the terminal
  main.innerHTML = '';
  const newGameDiv = document.createElement('div');
  newGameDiv.className = 'terminal-window';
  newGameDiv.innerHTML = `
    <div class="terminal-container">
      <div id="terminalOutput" class="terminal-output">
        <!-- Terminal output will appear here -->
      </div>
      <div class="terminal-input-line" id="terminalInputLine" style="display: none;">
        <span class="terminal-prompt">></span>
        <input type="text" id="terminalInput" class="terminal-input" autofocus>
      </div>
    </div>
  `;
  main.appendChild(newGameDiv);
  
  // Restore game state
  gameState = { ...saveData.gameState };
  
  // Show loading message
  addTerminalLine('STARBOUND AI SYSTEM v2.1.4');
  addTerminalLine('Loading saved game...');
  addTerminalLine('Restoring mission parameters...');
  addTerminalLine('');
  
  setTimeout(() => {
    addTerminalLine('> Save game loaded successfully.');
    addTerminalLine('> Resuming mission...');
    addTerminalLine('');
    
    setTimeout(() => {
      // Show current system status
      if (gameState.currentPlanet) {
        addTerminalLine('Resuming scan of current planetary system...');
        addTerminalLine('');
        showSystemStatus();
        
        // Show current planet details if we were scanning one
        const planet = gameState.currentPlanet;
        addTerminalLine('The seedship is in orbit of the ' + getOrdinal(planet.position) + ' planet of a ' + planet.starType + ' star.');
        addTerminalLine('');
        addTerminalLine('Atmosphere:    ' + planet.atmosphere);
        addTerminalLine('Gravity:       ' + planet.gravity);
        addTerminalLine('Temperature:   ' + planet.temperature);
        addTerminalLine('Water:         ' + planet.water);
        addTerminalLine('Resources:     ' + planet.resources);
        
        if (planet.anomalies.length > 0) {
          addTerminalLine('');
          addTerminalLine('Anomalies:');
          planet.anomalies.forEach(anomaly => {
            addTerminalLine(anomaly);
          });
        }
        
        addTerminalLine('');
        if (gameState.surfaceProbes > 0) {
          addTerminalLine('Launch surface probe');
          addTerminalLine('');
        }
        
        addTerminalLine('Found colony | Move on');
        addTerminalLine('');
      } else {
        // If no current planet, arrive at a new system
        arriveAtNewSystem();
      }
      
      // Enable input and set up game handler
      showTerminalInput();
      const terminalInput = document.getElementById('terminalInput');
      terminalInput.addEventListener('keypress', handleGameInput);
      terminalInput.focus();
    }, 2000);
  }, 1000);
}

// =====================================================
// 📈 HISTORY FUNCTIONS
// =====================================================

/**
 * 📝 Add a score to user's personal game history
 * @param {number} score - The score to add
 * @param {string} playerName - The player's name
 */
function addToGameHistory(score, playerName = 'Player') {
  try {
    const history = JSON.parse(localStorage.getItem('userGameHistory') || '[]');
    const gameEntry = {
      score: score,
      playerName: playerName,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString()
    };
    
    history.push(gameEntry);
    
    // Keep only the last 100 games to prevent localStorage bloat
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    localStorage.setItem('userGameHistory', JSON.stringify(history));
    console.log(`✅ Game score ${score} added to history for ${playerName}`);
  } catch (error) {
    console.error('❌ Error saving game history:', error);
  }
}

/**
 * 🎮 Add sample data for testing (remove this in production)
 */
function addSampleGameHistory() {
  const sampleGames = [
    { score: 15420, playerName: 'Captain Nova' },
    { score: 8750, playerName: 'StarSeeker' },
    { score: 22100, playerName: 'CosmicWanderer' },
    { score: 5230, playerName: 'VoidExplorer' },
    { score: 18900, playerName: 'NebulaRider' },
    { score: 12400, playerName: 'GalaxyRover' },
    { score: 9650, playerName: 'SpaceNomad' }
  ];
  
  sampleGames.forEach(game => {
    addToGameHistory(game.score, game.playerName);
  });
  
  console.log('🎮 Sample game history added!');
}

/**
 * 📊 Get user's game history statistics
 * @returns {Object} Statistics object with highest, lowest, total games, average
 */
function getGameHistoryStats() {
  try {
    const history = JSON.parse(localStorage.getItem('userGameHistory') || '[]');
    
    if (history.length === 0) {
      return {
        totalGames: 0,
        highestScore: 0,
        lowestScore: 0,
        averageScore: 0,
        recentGames: []
      };
    }
    
    const scores = history.map(game => game.score);
    const totalGames = history.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / totalGames);
    
    // Get recent 10 games
    const recentGames = history.slice(-10).reverse();
    
    return {
      totalGames,
      highestScore,
      lowestScore,
      averageScore,
      recentGames,
      allGames: history
    };
  } catch (error) {
    console.error('❌ Error loading game history:', error);
    return {
      totalGames: 0,
      highestScore: 0,
      lowestScore: 0,
      averageScore: 0,
      recentGames: []
    };
  }
}

/**
 * 🗑️ Clear user's game history
 */
function clearGameHistory() {
  try {
    localStorage.removeItem('userGameHistory');
    console.log('✅ Game history cleared!');
  } catch (error) {
    console.error('❌ Error clearing game history:', error);
  }
}

/**
 * 📈 Load and display the History screen
 */
function loadHistoryScreen() {
  console.log('🔄 Loading History screen...');
  
  // Clear main content
  main.innerHTML = '';
  
  const stats = getGameHistoryStats();
  
  // Create history screen div
  const gameHistory = document.createElement('div');
  gameHistory.className = 'gameHistory';
  gameHistory.innerHTML = `
    <div class="historyHeader">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="24" height="24" fill="currentColor" style="cursor:pointer" id="historyBackBtn">
        <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
      </svg>
      Highest Scores
    </div>
    
    <div class="historyContent">
      <div class="historyStats">
        <div class="statCard">
          <div class="statNumber">${stats.totalGames}</div>
          <div class="statLabel">Total Games</div>
        </div>
        <div class="statCard">
          <div class="statNumber">${stats.highestScore.toLocaleString()}</div>
          <div class="statLabel">Highest Score</div>
        </div>
        <div class="statCard">
          <div class="statNumber">${stats.lowestScore.toLocaleString()}</div>
          <div class="statLabel">Lowest Score</div>
        </div>
        <div class="statCard">
          <div class="statNumber">${stats.averageScore.toLocaleString()}</div>
          <div class="statLabel">Average Score</div>
        </div>
      </div>
      
      <div class="historySection">
        <h2>🕐 Game History Table</h2>
        <div class="history-table-container">
          <table id="historyTable">
            <thead>
              <tr>
                <th>Game #</th>
                <th>Player Name</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody id="historyTableBody">
              ${stats.recentGames.length > 0 ? 
                stats.recentGames.map((game, index) => `
                  <tr>
                    <td class="game-number">${stats.totalGames - index}</td>
                    <td class="player-name">${game.playerName}</td>
                    <td class="game-score">${game.score.toLocaleString()}</td>
                    <td class="game-date">${game.date}</td>
                  </tr>
                `).join('') : 
                '<tr><td colspan="4" class="no-games">🎮 No games played yet! Start playing to build your history.</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="historyActions">
        <button class="clearHistoryBtn" id="clearHistoryBtn">Clear History</button>
        <button class="viewAllBtn" id="viewAllBtn">View All Games</button>
      </div>
    </div>
  `;
  
  // Add the history screen to main
  main.appendChild(gameHistory);
  
  // Add event listeners
  document.getElementById('historyBackBtn').addEventListener('click', loadMotScreen);
  document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    if (confirm('⚠️ Are you sure you want to clear your entire game history? This cannot be undone!')) {
      clearGameHistory();
      // Reload the history screen to show updated stats
      loadHistoryScreen();
    }
  });
  
  // View All Games button
  document.getElementById('viewAllBtn').addEventListener('click', () => {
    const allGames = stats.allGames.slice().reverse(); // Show newest first
    const historyTableBody = document.getElementById('historyTableBody');
    
    historyTableBody.innerHTML = allGames.length > 0 ? 
      allGames.map((game, index) => `
        <tr>
          <td class="game-number">${allGames.length - index}</td>
          <td class="player-name">${game.playerName}</td>
          <td class="game-score">${game.score.toLocaleString()}</td>
          <td class="game-date">${game.date}</td>
        </tr>
      `).join('') : 
      '<tr><td colspan="4" class="no-games">🎮 No games played yet!</td></tr>';
    
    // Change button text to indicate current view
    document.getElementById('viewAllBtn').textContent = '📋 Showing All Games';
    document.getElementById('viewAllBtn').disabled = true;
  });
  
  console.log('✅ History screen loaded successfully');
}

// Alert utility functions
function showSettingsAlert(type) {
  const alertContainer = document.querySelector('.settingsAlert');
  const saveAlert = document.getElementById('saveAlert');
  const resetAlert = document.getElementById('resetAlert');
  
  // Hide all alerts first
  saveAlert.classList.remove('show');
  resetAlert.classList.remove('show');
  alertContainer.classList.remove('show');
  
  // Show the appropriate alert
  setTimeout(() => {
    if (type === 'save') {
      saveAlert.classList.add('show');
    } else if (type === 'reset') {
      resetAlert.classList.add('show');
    }
    
    alertContainer.classList.add('show');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      alertContainer.classList.remove('show');
      setTimeout(() => {
        saveAlert.classList.remove('show');
        resetAlert.classList.remove('show');
      }, 300);
    }, 3000);
  }, 100);
}

// Settings persistence utilities
function getDefaultSettings() {
  return {
    volume: 50,
    music: true,
    sfx: true,
    musicTrack: 0,
    language: 'en',
    fullscreen: false,
    textSpeed: 'normal',
    fontSize: 'medium'
  };
}

function loadSettings() {
  try {
    const saved = localStorage.getItem('userSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      return { ...getDefaultSettings(), ...settings };
    }
  } catch (error) {
    console.warn('Failed to load settings:', error);
  }
  return getDefaultSettings();
}

function saveSettings(settings) {
  try {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
}

function applySettings(settings) {
  // Apply any global settings that should affect the entire app
  const bgMusic = getOrCreateAudio();
  bgMusic.volume = settings.volume / 100;
  
  // Apply text speed globally if needed
  document.documentElement.style.setProperty('--text-speed', 
    settings.textSpeed === 'slow' ? '3s' : 
    settings.textSpeed === 'fast' ? '0.5s' : '1s'
  );
  
  // Apply font size globally if needed
  document.documentElement.style.setProperty('--font-scale', 
    settings.fontSize === 'small' ? '0.8' : 
    settings.fontSize === 'large' ? '1.2' : '1'
  );
}

// 🚀 Start the app
window.addEventListener('DOMContentLoaded', loadMotScreen);

// Additional initialization on page load
document.addEventListener('DOMContentLoaded', () => {
  // Load and apply saved settings globally when page loads
  const savedSettings = loadSettings();
  applySettings(savedSettings);
});

