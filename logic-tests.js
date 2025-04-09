console.log("Script logic-tests.js chargé, avant waitForTranslations");

// Fonction pour attendre que les traductions soient chargées
function waitForTranslations() {
  return new Promise((resolve) => {
    // Vérifier si translations est défini et non vide
    if (typeof translations !== 'undefined' && typeof currentLang !== 'undefined' && Object.keys(translations).length > 0) {
      console.log("Traductions déjà disponibles et non vides, résolution immédiate.");
      resolve();
    } else {
      console.log("En attente de l'événement translationsLoaded...");
      document.addEventListener('translationsLoaded', () => {
        console.log("Événement translationsLoaded reçu, les traductions sont prêtes.");
        resolve();
      }, { once: true });
    }
  });
}

// Exécuter le script principal une fois que les traductions sont chargées
waitForTranslations().then(() => {
  try {
    console.log("Début de l'exécution de logic-tests.js");

    // Vérifier les dépendances (par sécurité)
    if (typeof translations === 'undefined' || typeof currentLang === 'undefined' || Object.keys(translations).length === 0) {
      console.error("Erreur : Les variables globales 'translations' ou 'currentLang' ne sont pas définies ou translations est vide après translationsLoaded.");
      throw new Error("Dépendances manquantes pour logic-tests.js");
    } else {
      console.log("Dépendances vérifiées : translations et currentLang sont définis.");
      console.log("translations :", translations);
      console.log("currentLang :", currentLang);
    }

    // Définition des défis
    const challenges = {
      'challenge-1': {
        id: 'challenge-1',
        title: 'logic_test_1_title',
        description: 'logic_test_1_description',
        timeLimit: 30, // 30 secondes
        render: function(container) {
          container.innerHTML = `
            <div class="logic-test space-theme">
              <div class="mission-header">
                <h2 class="mission-title">Mission 1 : Synchronisation Temporelle</h2>
                <div class="timer-container">
                  <span id="timer-${this.id}" aria-live="polite">${formatTime(this.timeLimit)}</span>
                </div>
              </div>
              <p class="challenge-description">${translations[currentLang][this.description]}</p>
              <div class="instructions-tooltip">
                <button class="info-btn" aria-label="Afficher les instructions">?</button>
                <div class="tooltip-content">
                  Ajustez l'angle de l'horloge spatiale pour qu'il corresponde à l'heure indiquée (15h15). Utilisez le slider pour trouver l'angle correct (7.5° ± 1°).
                </div>
              </div>
              <div class="clock-container">
                <div id="clock-${this.id}" class="clock space-clock">
                  <div class="hour-hand" id="hour-hand-${this.id}"></div>
                  <div class="minute-hand" id="minute-hand-${this.id}"></div>
                </div>
              </div>
              <label for="angle-slider-${this.id}">${translations[currentLang]['logic_test_1_answer_label']}</label>
              <input type="range" id="angle-slider-${this.id}" min="0" max="360" step="0.1" value="0" aria-label="Ajuster l'angle de l'horloge">
              <p id="angle-value-${this.id}" aria-live="polite">0°</p>
              <button id="submit-${this.id}" class="submit-challenge space-button">${translations[currentLang]['logic_test_1_submit']}</button>
            </div>
          `;
          // Animation des aiguilles de l’horloge (plus fluide et moins distrayante)
          const hourHand = document.getElementById(`hour-hand-${this.id}`);
          const minuteHand = document.getElementById(`minute-hand-${this.id}`);
          let hourAngle = 90; // 15h00 = 90°
          let minuteAngle = 90; // 15h15 = 90°
          let offset = 0;
          const animate = () => {
            offset += 0.05; // Ralentir l'animation pour plus de fluidité
            const wobble = Math.sin(offset) * 2; // Réduire l'amplitude du wobble
            hourHand.style.transform = `rotate(${hourAngle + 7.5 + wobble}deg)`;
            minuteHand.style.transform = `rotate(${minuteAngle + wobble}deg)`;
            requestAnimationFrame(animate);
          };
          animate();
          // Mise à jour de l’affichage de l’angle
          const slider = document.getElementById(`angle-slider-${this.id}`);
          const angleValue = document.getElementById(`angle-value-${this.id}`);
          slider.addEventListener('input', () => {
            angleValue.textContent = `${parseFloat(slider.value).toFixed(1)}°`;
          });
        },
        validate: function() {
          const slider = document.getElementById(`angle-slider-${this.id}`);
          if (!slider) return false;
          const answer = parseFloat(slider.value);
          const isCorrect = Math.abs(answer - 7.5) <= 1;
          if (isCorrect) {
            playSuccessSound();
            showSuccessAnimation();
          } else {
            playErrorSound();
          }
          return isCorrect;
        },
        correction: 'logic_test_1_correction',
        softSkills: ['logic_test_1_soft_skills']
      },
      'challenge-2': {
        id: 'challenge-2',
        title: 'logic_test_2_title',
        description: 'logic_test_2_description',
        timeLimit: 45, // 45 secondes
        render: function(container) {
          container.innerHTML = `
            <div class="logic-test space-theme">
              <div class="mission-header">
                <h2 class="mission-title">Mission 2 : Collecte de Ressources</h2>
                <div class="timer-container">
                  <span id="timer-${this.id}" aria-live="polite">${formatTime(this.timeLimit)}</span>
                </div>
              </div>
              <p class="challenge-description">${translations[currentLang][this.description]}</p>
              <div class="instructions-tooltip">
                <button class="info-btn" aria-label="Afficher les instructions">?</button>
                <div class="tooltip-content">
                  Collectez des ressources (chaussettes) en les glissant dans la zone de dépôt. Vous devez garantir d'avoir au moins une paire (2 chaussettes de la même couleur). Combien de chaussettes devez-vous collecter au minimum ?
                </div>
              </div>
              <p class="challenge-hint">${translations[currentLang]['logic_test_2_hint']}</p>
              <div class="sock-drawer space-drawer" id="sock-drawer-${this.id}" aria-label="Zone de collecte des ressources"></div>
              <div class="drop-zone space-drop-zone" id="sock-pile-${this.id}" aria-label="Zone de dépôt"></div>
              <label for="sock-answer-${this.id}">${translations[currentLang]['logic_test_2_answer_label']}</label>
              <input type="number" id="sock-answer-${this.id}" min="1" max="24" value="1" aria-label="Nombre de chaussettes nécessaires">
              <button id="submit-${this.id}" class="submit-challenge space-button">${translations[currentLang]['logic_test_2_submit']}</button>
            </div>
          `;
          // Générer les chaussettes
          const sockDrawer = document.getElementById(`sock-drawer-${this.id}`);
          const socks = [
            ...Array(6).fill('black'), // 6 chaussettes noires
            ...Array(10).fill('red'),  // 10 chaussettes rouges
            ...Array(8).fill('blue')   // 8 chaussettes bleues
          ];
          shuffleArray(socks);
          socks.forEach((color, index) => {
            const sock = document.createElement('div');
            sock.className = 'sock space-sock';
            sock.dataset.color = color;
            sock.dataset.id = index;
            sock.draggable = true;
            sock.style.backgroundColor = color;
            sock.style.left = `${Math.random() * 80}%`;
            sock.style.top = `${Math.random() * 80}%`;
            sock.setAttribute('aria-label', `Chaussette ${color}`);
            sockDrawer.appendChild(sock);
            // Animation des chaussettes (mouvement aléatoire, optimisé)
            let x = parseFloat(sock.style.left);
            let y = parseFloat(sock.style.top);
            let dx = (Math.random() - 0.5) * 0.1; // Vitesse réduite
            let dy = (Math.random() - 0.5) * 0.1;
            const animateSock = () => {
              if (!sock.parentElement) return; // Arrêter l'animation si l'élément est retiré
              x += dx;
              y += dy;
              if (x < 0 || x > 80) dx = -dx;
              if (y < 0 || y > 80) dy = -dy;
              sock.style.left = `${x}%`;
              sock.style.top = `${y}%`;
              requestAnimationFrame(animateSock);
            };
            animateSock();
          });
          // Gestion du glisser-déposer
          const pile = document.getElementById(`sock-pile-${this.id}`);
          sockDrawer.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('sock')) {
              e.dataTransfer.setData('text/plain', e.target.dataset.id);
              pile.classList.add('highlight-drop'); // Surlignage de la zone de dépôt
            }
          });
          sockDrawer.addEventListener('dragend', () => {
            pile.classList.remove('highlight-drop'); // Retirer le surlignage
          });
          pile.addEventListener('dragover', (e) => e.preventDefault());
          pile.addEventListener('drop', (e) => {
            e.preventDefault();
            const sockId = e.dataTransfer.getData('text/plain');
            const sock = document.querySelector(`.sock[data-id="${sockId}"]`);
            if (sock) {
              sock.draggable = false;
              sock.style.position = 'relative';
              sock.style.left = '0';
              sock.style.top = '0';
              pile.appendChild(sock);
              playDropSound();
            }
          });
        },
        validate: function() {
          const answerInput = document.getElementById(`sock-answer-${this.id}`);
          if (!answerInput) return false;
          const answer = parseInt(answerInput.value);
          const isCorrect = answer === 4;
          if (isCorrect) {
            playSuccessSound();
            showSuccessAnimation();
          } else {
            playErrorSound();
          }
          return isCorrect;
        },
        correction: 'logic_test_2_correction',
        softSkills: ['logic_test_2_soft_skills']
      },
      'challenge-3': {
        id: 'challenge-3',
        title: 'logic_test_3_title',
        description: 'logic_test_3_description',
        timeLimit: 60, // 60 secondes
        render: function(container) {
          container.innerHTML = `
            <div class="logic-test space-theme">
              <div class="mission-header">
                <h2 class="mission-title">Mission 3 : Transport Interplanétaire</h2>
                <div class="timer-container">
                  <span id="timer-${this.id}" aria-live="polite">${formatTime(this.timeLimit)}</span>
                </div>
              </div>
              <p class="challenge-description">${translations[currentLang][this.description]}</p>
              <div class="instructions-tooltip">
                <button class="info-btn" aria-label="Afficher les instructions">?</button>
                <div class="tooltip-content">
                  Transportez le fermier, le loup, la chèvre et le chou de la planète gauche à la planète droite. Le vaisseau ne peut transporter que le fermier et un autre élément à la fois. Ne laissez pas le loup et la chèvre seuls ensemble, ni la chèvre et le chou seuls ensemble.
                </div>
              </div>
              <div class="river-container space-river">
                <div class="river-bank left-bank space-planet" id="left-bank-${this.id}" aria-label="Planète de départ">
                  <div class="item farmer" id="farmer-${this.id}" draggable="true" aria-label="Fermier"></div>
                  <div class="item wolf" id="wolf-${this.id}" draggable="true" aria-label="Loup"></div>
                  <div class="item goat" id="goat-${this.id}" draggable="true" aria-label="Chèvre"></div>
                  <div class="item cabbage" id="cabbage-${this.id}" draggable="true" aria-label="Chou"></div>
                </div>
                <div class="river space-warp">
                  <div class="boat space-shuttle" id="boat-${this.id}" aria-label="Vaisseau spatial"></div>
                </div>
                <div class="river-bank right-bank space-planet" id="right-bank-${this.id}" aria-label="Planète d'arrivée"></div>
              </div>
              <button id="submit-${this.id}" class="submit-challenge space-button">${translations[currentLang]['logic_test_3_submit'] || 'Terminer'}</button>
            </div>
          `;
          // Animation du vaisseau (oscillation plus fluide)
          const boat = document.getElementById(`boat-${this.id}`);
          let boatOffset = 0;
          const animateBoat = () => {
            boatOffset += 0.05;
            boat.style.transform = `translateY(${Math.sin(boatOffset) * 3}px)`; // Réduire l'amplitude
            requestAnimationFrame(animateBoat);
          };
          animateBoat();
          // Gestion du glisser-déposer
          const leftBank = document.getElementById(`left-bank-${this.id}`);
          const rightBank = document.getElementById(`right-bank-${this.id}`);
          const items = document.querySelectorAll(`#left-bank-${this.id} .item, #right-bank-${this.id} .item`);
          items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
              e.dataTransfer.setData('text/plain', e.target.id);
              boat.classList.add('highlight-drop');
              leftBank.classList.add('highlight-drop');
              rightBank.classList.add('highlight-drop');
            });
            item.addEventListener('dragend', () => {
              boat.classList.remove('highlight-drop');
              leftBank.classList.remove('highlight-drop');
              rightBank.classList.remove('highlight-drop');
            });
          });
          [leftBank, rightBank, boat].forEach(zone => {
            zone.addEventListener('dragover', (e) => e.preventDefault());
            zone.addEventListener('drop', (e) => {
              e.preventDefault();
              const itemId = e.dataTransfer.getData('text/plain');
              const item = document.getElementById(itemId);
              if (item) {
                if (zone === boat) {
                  const itemsInBoat = boat.querySelectorAll('.item:not(.farmer)').length;
                  if (itemsInBoat >= 1 && itemId !== `farmer-${this.id}`) {
                    playErrorSound();
                    return;
                  }
                }
                zone.appendChild(item);
                playDropSound();
                if (zone === leftBank || zone === rightBank) {
                  const bankItems = Array.from(zone.querySelectorAll('.item')).map(i => i.classList[1]);
                  const hasFarmer = bankItems.includes('farmer');
                  if (!hasFarmer) {
                    if (bankItems.includes('wolf') && bankItems.includes('goat')) {
                      alert(translations[currentLang]['logic_test_3_wolf_eats_goat'] || "Le loup a mangé la chèvre !");
                      playErrorSound();
                      stopChallenge(this.id, false);
                    }
                    if (bankItems.includes('goat') && bankItems.includes('cabbage')) {
                      alert(translations[currentLang]['logic_test_3_goat_eats_cabbage'] || "La chèvre a mangé le chou !");
                      playErrorSound();
                      stopChallenge(this.id, false);
                    }
                  }
                }
              }
            });
          });
        },
        validate: function() {
          const rightBank = document.getElementById(`right-bank-${this.id}`);
          const itemsOnRight = Array.from(rightBank.querySelectorAll('.item')).map(i => i.classList[1]);
          const isCorrect = itemsOnRight.includes('farmer') && itemsOnRight.includes('wolf') && itemsOnRight.includes('goat') && itemsOnRight.includes('cabbage');
          if (isCorrect) {
            playSuccessSound();
            showSuccessAnimation();
          } else {
            playErrorSound();
          }
          return isCorrect;
        },
        correction: 'logic_test_3_correction',
        softSkills: ['logic_test_3_soft_skills']
      },
      'challenge-4': {
        id: 'challenge-4',
        title: 'logic_test_4_title',
        description: 'logic_test_4_description',
        timeLimit: 20, // 20 secondes
        render: function(container) {
          container.innerHTML = `
            <div class="logic-test space-theme">
              <div class="mission-header">
                <h2 class="mission-title">Mission 4 : Analyse des Signaux</h2>
                <div class="timer-container">
                  <span id="timer-${this.id}" aria-live="polite">${formatTime(this.timeLimit)}</span>
                </div>
              </div>
              <p class="challenge-description">${translations[currentLang][this.description]}</p>
              <div class="instructions-tooltip">
                <button class="info-btn" aria-label="Afficher les instructions">?</button>
                <div class="tooltip-content">
                  Sélectionnez un signal (couleur) parmi ceux qui orbitent autour de la station spatiale. Chaque couleur représente un type de signal. Choisissez judicieusement !
                </div>
              </div>
              <div class="color-container space-orbit" id="color-container-${this.id}" aria-label="Zone des signaux"></div>
            </div>
          `;
          // Animation des cercles de couleur (plus fluide et moins distrayant)
          const containerElement = document.getElementById(`color-container-${this.id}`);
          const colors = ['red', 'blue', 'green', 'yellow'];
          colors.forEach((color, index) => {
            const circle = document.createElement('div');
            circle.className = `color-circle space-signal ${color}`;
            circle.id = `${color}-${this.id}`;
            circle.setAttribute('aria-label', `Signal ${color}`);
            circle.setAttribute('tabindex', '0'); // Rendre focusable
            containerElement.appendChild(circle);
            let angle = (index * 90) * (Math.PI / 180); // Position initiale en cercle
            const radius = 100; // Rayon de l'orbite
            const animateCircle = () => {
              angle += 0.02; // Vitesse d'orbite réduite
              const x = 50 + radius * Math.cos(angle);
              const y = 50 + radius * Math.sin(angle);
              circle.style.left = `${x}%`;
              circle.style.top = `${y}%`;
              requestAnimationFrame(animateCircle);
            };
            animateCircle();
            circle.addEventListener('click', () => {
              this.selectedColor = color;
              stopChallenge(this.id);
            });
            circle.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                this.selectedColor = color;
                stopChallenge(this.id);
              }
            });
          });
          // Ajouter des signaux fantômes (distractions, limitées)
          let ghostCount = 0;
          const maxGhosts = 3; // Limiter le nombre de fantômes
          const addGhostCircle = () => {
            if (ghostCount >= maxGhosts) return;
            const ghost = document.createElement('div');
            ghost.className = 'color-circle ghost space-signal';
            ghost.style.backgroundColor = ['#ff00ff', '#00ffff', '#ffff00'][Math.floor(Math.random() * 3)];
            ghost.style.left = `${Math.random() * 80}%`;
            ghost.style.top = `${Math.random() * 80}%`;
            containerElement.appendChild(ghost);
            ghostCount++;
            setTimeout(() => {
              ghost.remove();
              ghostCount--;
            }, 2000);
          };
          setInterval(addGhostCircle, 5000);
        },
        validate: function() {
          const isCorrect = !!this.selectedColor;
          if (isCorrect) {
            playSuccessSound();
            showSuccessAnimation();
          } else {
            playErrorSound();
          }
          return isCorrect;
        },
        correction: 'logic_test_4_correction',
        softSkills: ['logic_test_4_soft_skills'],
        getResultMessage: function() {
          const messages = {
            red: translations[currentLang]['logic_test_4_result_red'] || "Vous êtes une personne d'action et d'énergie (Dominance).",
            blue: translations[currentLang]['logic_test_4_result_blue'] || "Vous êtes analytique et logique (Influence).",
            green: translations[currentLang]['logic_test_4_result_green'] || "Vous êtes empathique et communicatif (Stabilité).",
            yellow: translations[currentLang]['logic_test_4_result_yellow'] || "Vous êtes créatif et imaginatif (Conformité)."
          };
          return messages[this.selectedColor] || translations[currentLang]['challenge_failure'] || "Échec !";
        }
      },
      'challenge-5': {
        id: 'challenge-5',
        title: 'logic_test_5_title',
        description: 'logic_test_5_description',
        timeLimit: 45, // 45 secondes
        render: function(container) {
          container.innerHTML = `
            <div class="logic-test space-theme">
              <div class="mission-header">
                <h2 class="mission-title">Mission 5 : Connexion des Stations</h2>
                <div class="timer-container">
                  <span id="timer-${this.id}" aria-live="polite">${formatTime(this.timeLimit)}</span>
                </div>
              </div>
              <p class="challenge-description">${translations[currentLang][this.description]}</p>
              <div class="instructions-tooltip">
                <button class="info-btn" aria-label="Afficher les instructions">?</button>
                <div class="tooltip-content">
                  Connectez chaque station (A, B, C) aux trois ressources (eau, électricité, gaz) sans que les lignes ne se croisent. Cliquez et maintenez pour dessiner une connexion.
                </div>
              </div>
              <div class="houses-container space-stations">
                <div class="houses">
                  <div class="house space-station" id="house-a-${this.id}" aria-label="Station A">A</div>
                  <div class="house space-station" id="house-b-${this.id}" aria-label="Station B">B</div>
                  <div class="house space-station" id="house-c-${this.id}" aria-label="Station C">C</div>
                </div>
                <div class="canvas-container">
                  <canvas id="canvas-${this.id}" width="400" height="200" aria-label="Zone de connexion"></canvas>
                </div>
                <div class="services">
                  <div class="service water space-resource" id="water-${this.id}" aria-label="Ressource Eau">${translations[currentLang]['logic_test_5_service_water'] || 'Eau'}</div>
                  <div class="service electricity space-resource" id="electricity-${this.id}" aria-label="Ressource Électricité">${translations[currentLang]['logic_test_5_service_electricity'] || 'Électricité'}</div>
                  <div class="service gas space-resource" id="gas-${this.id}" aria-label="Ressource Gaz">${translations[currentLang]['logic_test_5_service_gas'] || 'Gaz'}</div>
                </div>
              </div>
              <button id="submit-${this.id}" class="submit-challenge space-button">${translations[currentLang]['logic_test_5_submit'] || 'Valider'}</button>
            </div>
          `;
          // Gestion du dessin des câbles
          const canvas = document.getElementById(`canvas-${this.id}`);
          const ctx = canvas.getContext('2d');
          const houses = document.querySelectorAll(`.house`);
          const services = document.querySelectorAll(`.service`);
          let drawing = false;
          let startPoint = null;
          let connections = [];

          const getElementPosition = (element) => {
            const rect = element.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();
            return {
              x: rect.left + rect.width / 2 - canvasRect.left,
              y: rect.top + rect.height / 2 - canvasRect.top
            };
          };

          const redraw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            connections.forEach(conn => {
              ctx.beginPath();
              ctx.moveTo(conn.start.x, conn.start.y);
              ctx.lineTo(conn.end.x, conn.end.y);
              ctx.strokeStyle = conn.color;
              ctx.lineWidth = 2;
              ctx.stroke();
            });
          };

          houses.forEach(house => {
            house.addEventListener('mousedown', (e) => {
              drawing = true;
              startPoint = getElementPosition(house);
              startPoint.element = house;
              house.classList.add('highlight');
            });
            house.addEventListener('mouseup', () => {
              house.classList.remove('highlight');
            });
          });

          services.forEach(service => {
            service.addEventListener('mouseup', (e) => {
              if (drawing) {
                const endPoint = getElementPosition(service);
                connections.push({
                  start: startPoint,
                  end: endPoint,
                  color: service.classList.contains('water') ? 'blue' : service.classList.contains('electricity') ? 'yellow' : 'green'
                });
                redraw();
                drawing = false;
                startPoint = null;
                playConnectSound();
              }
            });
          });

          // Animation des services (oscillation plus fluide)
          services.forEach(service => {
            let offset = Math.random() * 100;
            const animateService = () => {
              offset += 0.05;
              service.style.transform = `translateY(${Math.sin(offset) * 3}px)`;
              requestAnimationFrame(animateService);
            };
            animateService();
          });

          this.connections = connections;
        },
        validate: function() {
          const requiredConnections = [
            ['house-a', 'water'], ['house-a', 'electricity'], ['house-a', 'gas'],
            ['house-b', 'water'], ['house-b', 'electricity'], ['house-b', 'gas'],
            ['house-c', 'water'], ['house-c', 'electricity'], ['house-c', 'gas']
          ];
          const hasAllConnections = requiredConnections.every(([house, service]) => {
            return this.connections.some(conn => {
              const startId = conn.start.element.id.split('-')[1];
              const endId = conn.end.element.id.split('-')[1];
              return (startId === house && endId === service) || (startId === service && endId === house);
            });
          });
          let hasCrossing = false;
          for (let i = 0; i < this.connections.length; i++) {
            for (let j = i + 1; j < this.connections.length; j++) {
              const line1 = this.connections[i];
              const line2 = this.connections[j];
              if (doLinesIntersect(line1.start, line1.end, line2.start, line2.end)) {
                hasCrossing = true;
                break;
              }
            }
            if (hasCrossing) break;
          }
          const isCorrect = hasAllConnections && !hasCrossing;
          if (isCorrect) {
            playSuccessSound();
            showSuccessAnimation();
          } else {
            playErrorSound();
          }
          return isCorrect;
        },
        correction: 'logic_test_5_correction',
        softSkills: ['logic_test_5_soft_skills']
      },
      'challenge-6': {
        id: 'challenge-6',
        title: 'logic_test_6_title',
        description: 'logic_test_6_description',
        timeLimit: 60, // 60 secondes
        render: function(container) {
          this.lightCoin = Math.floor(Math.random() * 9) + 1;
          container.innerHTML = `
            <div class="logic-test space-theme">
              <div class="mission-header">
                <h2 class="mission-title">Mission 6 : Analyse de Masse</h2>
                <div class="timer-container">
                  <span id="timer-${this.id}" aria-live="polite">${formatTime(this.timeLimit)}</span>
                </div>
              </div>
              <p class="challenge-description">${translations[currentLang][this.description]}</p>
              <div class="instructions-tooltip">
                <button class="info-btn" aria-label="Afficher les instructions">?</button>
                <div class="tooltip-content">
                  Identifiez l'échantillon plus léger parmi les 9 échantillons en utilisant la balance. Vous avez droit à 2 pesées maximum. Placez les échantillons sur les plateaux et pesez-les pour comparer.
                </div>
              </div>
              <div class="coins-container space-samples" id="coins-container-${this.id}" aria-label="Zone des échantillons"></div>
              <div class="scale-container space-scale">
                <div class="scale">
                  <div class="scale-pan left-pan" id="left-pan-${this.id}" aria-label="Plateau gauche"></div>
                  <div class="scale-pan right-pan" id="right-pan-${this.id}" aria-label="Plateau droit"></div>
                </div>
                <button id="weigh-${this.id}" class="space-button">${translations[currentLang]['logic_test_6_weigh'] || 'Peser'}</button>
              </div>
              <label for="light-coin-${this.id}">${translations[currentLang]['logic_test_6_answer_label'] || 'Quelle pièce est plus légère ?'}</label>
              <input type="number" id="light-coin-${this.id}" min="1" max="9" value="1" aria-label="Numéro de l'échantillon plus léger">
              <button id="submit-${this.id}" class="submit-challenge space-button">${translations[currentLang]['logic_test_6_submit'] || 'Valider'}</button>
            </div>
          `;
          const coinsContainer = document.getElementById(`coins-container-${this.id}`);
          for (let i = 1; i <= 9; i++) {
            const coin = document.createElement('div');
            coin.className = 'coin space-sample';
            coin.id = `coin-${i}-${this.id}`;
            coin.draggable = true;
            coin.textContent = i;
            coin.setAttribute('aria-label', `Échantillon ${i}`);
            coinsContainer.appendChild(coin);
          }
          const coins = document.querySelectorAll(`#coins-container-${this.id} .coin`);
          const leftPan = document.getElementById(`left-pan-${this.id}`);
          const rightPan = document.getElementById(`right-pan-${this.id}`);
          coins.forEach(coin => {
            coin.addEventListener('dragstart', (e) => {
              e.dataTransfer.setData('text/plain', e.target.id);
              leftPan.classList.add('highlight-drop');
              rightPan.classList.add('highlight-drop');
            });
            coin.addEventListener('dragend', () => {
              leftPan.classList.remove('highlight-drop');
              rightPan.classList.remove('highlight-drop');
            });
          });
          [leftPan, rightPan].forEach(pan => {
            pan.addEventListener('dragover', (e) => e.preventDefault());
            pan.addEventListener('drop', (e) => {
              e.preventDefault();
              const coinId = e.dataTransfer.getData('text/plain');
              const coin = document.getElementById(coinId);
              if (coin) {
                pan.appendChild(coin);
                coin.draggable = false;
                playDropSound();
              }
            });
          });
          const scale = document.querySelector('.scale');
          let offset = 0;
          const animateScale = () => {
            offset += 0.05;
            scale.style.transform = `rotate(${Math.sin(offset) * 1}deg)`; // Réduire l'amplitude
            requestAnimationFrame(animateScale);
          };
          animateScale();
          const weighButton = document.getElementById(`weigh-${this.id}`);
          this.weighCount = 0;
          weighButton.addEventListener('click', () => {
            if (this.weighCount >= 2) {
              alert(translations[currentLang]['logic_test_6_max_weighs'] || "Vous avez déjà fait 2 pesées !");
              playErrorSound();
              return;
            }
            const leftCoins = Array.from(leftPan.querySelectorAll('.coin')).map(c => parseInt(c.id.split('-')[1]));
            const rightCoins = Array.from(rightPan.querySelectorAll('.coin')).map(c => parseInt(c.id.split('-')[1]));
            if (leftCoins.length === 0 || rightCoins.length === 0) {
              alert(translations[currentLang]['logic_test_6_empty_pans'] || "Veuillez placer des pièces sur les deux plateaux !");
              playErrorSound();
              return;
            }
            if (leftCoins.length + rightCoins.length > 6) {
              alert(translations[currentLang]['logic_test_6_too_many_coins'] || "Trop de pièces ! La balance casse !");
              playErrorSound();
              stopChallenge(this.id, false);
              return;
            }
            this.weighCount++;
            const leftHasLight = leftCoins.includes(this.lightCoin);
            const rightHasLight = rightCoins.includes(this.lightCoin);
            if (leftHasLight && !rightHasLight) {
              leftPan.style.transform = 'translateY(-20px)';
              rightPan.style.transform = 'translateY(20px)';
            } else if (rightHasLight && !leftHasLight) {
              leftPan.style.transform = 'translateY(20px)';
              rightPan.style.transform = 'translateY(-20px)';
            } else {
              leftPan.style.transform = 'translateY(0)';
              rightPan.style.transform = 'translateY(0)';
            }
            playWeighSound();
          });
        },
        validate: function() {
          const answerInput = document.getElementById(`light-coin-${this.id}`);
          if (!answerInput) return false;
          const answer = parseInt(answerInput.value);
          const isCorrect = answer === this.lightCoin;
          if (isCorrect) {
            playSuccessSound();
            showSuccessAnimation();
          } else {
            playErrorSound();
          }
          return isCorrect;
        },
        correction: 'logic_test_6_correction',
        softSkills: ['logic_test_6_soft_skills']
      },
      'challenge-7': {
        id: 'challenge-7',
        title: 'logic_test_7_title',
        description: 'logic_test_7_description',
        timeLimit: 30, // 30 secondes
        render: function(container) {
          this.code = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10));
          const clues = [
            { symbol: 'star', value: this.code[0] },
            { symbol: 'circle', value: this.code[1] },
            { symbol: 'square', value: this.code[2] },
            { symbol: 'triangle', value: this.code[3] }
          ];
          container.innerHTML = `
            <div class="logic-test space-theme">
              <div class="mission-header">
                <h2 class="mission-title">Mission 7 : Décryptage du Code</h2>
                <div class="timer-container">
                  <span id="timer-${this.id}" aria-live="polite">${formatTime(this.timeLimit)}</span>
                </div>
              </div>
              <p class="challenge-description">${translations[currentLang][this.description]}</p>
              <div class="instructions-tooltip">
                <button class="info-btn" aria-label="Afficher les instructions">?</button>
                <div class="tooltip-content">
                  Décryptez le code à 4 chiffres en utilisant les indices fournis. Entrez les chiffres dans les champs ci-dessous et validez.
                </div>
              </div>
              <div class="clues-container space-clues" id="clues-container-${this.id}" aria-label="Zone des indices"></div>
              <div class="safe-container space-safe">
                <input type="number" id="code-1-${this.id}" min="0" max="9" value="0" aria-label="Chiffre 1">
                <input type="number" id="code-2-${this.id}" min="0" max="9" value="0" aria-label="Chiffre 2">
                <input type="number" id="code-3-${this.id}" min="0" max="9" value="0" aria-label="Chiffre 3">
                <input type="number" id="code-4-${this.id}" min="0" max="9" value="0" aria-label="Chiffre 4">
              </div>
              <button id="submit-${this.id}" class="submit-challenge space-button">${translations[currentLang]['logic_test_7_submit'] || 'Valider'}</button>
            </div>
          `;
          const cluesContainer = document.getElementById(`clues-container-${this.id}`);
          clues.forEach(clue => {
            const clueElement = document.createElement('div');
            clueElement.className = `clue space-clue ${clue.symbol}`;
            clueElement.id = `clue-${clue.symbol}-${this.id}`;
            clueElement.textContent = `${clue.symbol === 'star' ? '★' : clue.symbol === 'circle' ? '●' : clue.symbol === 'square' ? '■' : '▲'} = ${clue.value}`;
            cluesContainer.appendChild(clueElement);
            let x = Math.random() * 80;
            let y = Math.random() * 80;
            let dx = (Math.random() - 0.5) * 0.5;
            let dy = (Math.random() - 0.5) * 0.5;
            const animateClue = () => {
              if (!clueElement.parentElement) return;
              x += dx;
              y += dy;
              if (x < 0 || x > 80) dx = -dx;
              if (y < 0 || y > 80) dy = -dy;
              clueElement.style.left = `${x}%`;
              clueElement.style.top = `${y}%`;
              clueElement.style.opacity = Math.abs(Math.sin(Date.now() * 0.002)) * 0.3 + 0.7;
              requestAnimationFrame(animateClue);
            };
            animateClue();
          });
          let ghostCount = 0;
          const maxGhosts = 2;
          const addGhostClue = () => {
            if (ghostCount >= maxGhosts) return;
            const ghost = document.createElement('div');
            ghost.className = 'clue ghost space-clue';
            ghost.textContent = `${['★', '●', '■', '▲'][Math.floor(Math.random() * 4)]} = ${Math.floor(Math.random() * 10)}`;
            ghost.style.left = `${Math.random() * 80}%`;
            ghost.style.top = `${Math.random() * 80}%`;
            cluesContainer.appendChild(ghost);
            ghostCount++;
            setTimeout(() => {
              ghost.remove();
              ghostCount--;
            }, 2000);
          };
          setInterval(addGhostClue, 5000);
        },
        validate: function() {
          const inputs = [
            document.getElementById(`code-1-${this.id}`),
            document.getElementById(`code-2-${this.id}`),
            document.getElementById(`code-3-${this.id}`),
            document.getElementById(`code-4-${this.id}`)
          ];
          if (inputs.some(input => !input)) return false;
          const answer = inputs.map(input => parseInt(input.value));
          const isCorrect = answer.every((val, i) => val === this.code[i]);
          if (isCorrect) {
            playSuccessSound();
            showSuccessAnimation();
          } else {
            playErrorSound();
          }
          return isCorrect;
        },
        correction: 'logic_test_7_correction',
        softSkills: ['logic_test_7_soft_skills']
      },
      'challenge-8': {
        id: 'challenge-8',
        title: 'logic_test_8_title',
        description: 'logic_test_8_description',
        timeLimit: 45, // 45 secondes
        render: function(container) {
          container.innerHTML = `
            <div class="logic-test space-theme">
              <div class="mission-header">
                <h2 class="mission-title">Mission 8 : Exploration Lunaire</h2>
                <div class="timer-container">
                  <span id="timer-${this.id}" aria-live="polite">${formatTime(this.timeLimit)}</span>
                </div>
              </div>
              <p class="challenge-description">${translations[currentLang][this.description]}</p>
              <div class="instructions-tooltip">
                <button class="info-btn" aria-label="Afficher les instructions">?</button>
                <div class="tooltip-content">
                  Collectez de l'eau sur la lune en glissant les drones vers les oasis. Chaque drone peut collecter 1 litre d'eau. Vous avez besoin de 5 litres au total. Combien d'oasis devez-vous visiter au minimum ?
                </div>
              </div>
              <div class="desert-container space-moon" id="desert-container-${this.id}" aria-label="Surface lunaire"></div>
              <div class="water-gauge space-gauge">
                <div class="water-level" id="water-level-${this.id}"></div>
                <span id="water-amount-${this.id}" aria-live="polite">0 / 5 ${translations[currentLang]['logic_test_8_liters'] || 'litres'}</span>
              </div>
              <label for="oasis-answer-${this.id}">${translations[currentLang]['logic_test_8_answer_label'] || 'Combien d’oasis faut-il visiter ?'}</label>
              <input type="number" id="oasis-answer-${this.id}" min="1" max="10" value="1" aria-label="Nombre d'oasis à visiter">
              <button id="submit-${this.id}" class="submit-challenge space-button">${translations[currentLang]['logic_test_8_submit'] || 'Valider'}</button>
            </div>
          `;
          const desertContainer = document.getElementById(`desert-container-${this.id}`);
          for (let i = 1; i <= 3; i++) {
            const camel = document.createElement('div');
            camel.className = 'camel space-drone';
            camel.id = `camel-${i}-${this.id}`;
            camel.draggable = true;
            camel.textContent = '🚀';
            camel.setAttribute('aria-label', `Drone ${i}`);
            desertContainer.appendChild(camel);
          }
          const camels = document.querySelectorAll(`.camel`);
          this.waterAmount = 0;
          this.oasisVisited = 0;
          const waterLevel = document.getElementById(`water-level-${this.id}`);
          const waterAmountDisplay = document.getElementById(`water-amount-${this.id}`);
          camels.forEach(camel => {
            camel.addEventListener('dragstart', (e) => {
              e.dataTransfer.setData('text/plain', e.target.id);
            });
          });
          const addOasis = () => {
            const oasis = document.createElement('div');
            oasis.className = 'oasis space-oasis';
            oasis.style.left = `${Math.random() * 80}%`;
            oasis.style.top = `${Math.random() * 80}%`;
            oasis.setAttribute('aria-label', 'Oasis');
            desertContainer.appendChild(oasis);
            setTimeout(() => {
              oasis.classList.add('disappear');
              setTimeout(() => oasis.remove(), 1000);
            }, 5000);
            oasis.addEventListener('dragover', (e) => e.preventDefault());
            oasis.addEventListener('drop', (e) => {
              e.preventDefault();
              const camelId = e.dataTransfer.getData('text/plain');
              const camel = document.getElementById(camelId);
              if (camel && !camel.classList.contains('filled')) {
                camel.classList.add('filled');
                this.waterAmount += 1;
                this.oasisVisited += 1;
                waterLevel.style.width = `${(this.waterAmount / 5) * 100}%`;
                waterAmountDisplay.textContent = `${this.waterAmount} / 5 ${translations[currentLang]['logic_test_8_liters'] || 'litres'}`;
                playCollectSound();
              }
            });
          };
          setInterval(addOasis, 7000);
          const addMirage = () => {
            const mirage = document.createElement('div');
            mirage.className = 'mirage space-mirage';
            mirage.style.left = `${Math.random() * 80}%`;
            mirage.style.top = `${Math.random() * 80}%`;
            desertContainer.appendChild(mirage);
            setTimeout(() => mirage.remove(), 3000);
          };
          setInterval(addMirage, 5000);
        },
        validate: function() {
          const answerInput = document.getElementById(`oasis-answer-${this.id}`);
          if (!answerInput) return false;
          const answer = parseInt(answerInput.value);
          const isCorrect = answer === 2;
          if (isCorrect) {
            playSuccessSound();
            showSuccessAnimation();
          } else {
            playErrorSound();
          }
          return isCorrect;
        },
        correction: 'logic_test_8_correction',
        softSkills: ['logic_test_8_soft_skills']
      },
      'challenge-9': {
        id: 'challenge-9',
        title: 'logic_test_9_title',
        description: 'logic_test_9_description',
        timeLimit: 60, // 60 secondes
        render: function(container) {
          const mapping = shuffleArray(['A', 'B', 'C']);
          this.mapping = {
            1: mapping[0],
            2: mapping[1],
            3: mapping[2]
          };
          container.innerHTML = `
            <div class="logic-test space-theme">
              <div class="mission-header">
                <h2 class="mission-title">Mission 9 : Calibration des Relais</h2>
                <div class="timer-container">
                  <span id="timer-${this.id}" aria-live="polite">${formatTime(this.timeLimit)}</span>
                </div>
              </div>
              <p class="challenge-description">${translations[currentLang][this.description]}</p>
              <div class="instructions-tooltip">
                <button class="info-btn" aria-label="Afficher les instructions">?</button>
                <div class="tooltip-content">
                  Activez les interrupteurs pour allumer les relais (A, B, C). Associez chaque interrupteur au bon relais en fonction de leur état (ON/OFF).
                </div>
              </div>
              <div class="switches-container space-switches">
                <div class="switch space-switch" id="switch-1-${this.id}" aria-label="Interrupteur 1">${translations[currentLang]['logic_test_9_switch'] || 'Interrupteur'} 1: <span class="switch-state">OFF</span></div>
                <div class="switch space-switch" id="switch-2-${this.id}" aria-label="Interrupteur 2">${translations[currentLang]['logic_test_9_switch'] || 'Interrupteur'} 2: <span class="switch-state">OFF</span></div>
                <div class="switch space-switch" id="switch-3-${this.id}" aria-label="Interrupteur 3">${translations[currentLang]['logic_test_9_switch'] || 'Interrupteur'} 3: <span class="switch-state">OFF</span></div>
              </div>
              <button id="visit-${this.id}" class="space-button">${translations[currentLang]['logic_test_9_visit'] || 'Aller voir les ampoules'}</button>
              <div class="bulbs-container space-relays" id="bulbs-container-${this.id}" style="display: none;" aria-label="État des relais">
                <div class="bulb space-relay" id="bulb-a-${this.id}">A: <span class="bulb-state">OFF</span></div>
                <div class="bulb space-relay" id="bulb-b-${this.id}">B: <span class="bulb-state">OFF</span></div>
                <div class="bulb space-relay" id="bulb-c-${this.id}">C: <span class="bulb-state">OFF</span></div>
              </div>
              <div class="answers-container space-answers" id="answers-container-${this.id}" style="display: none;">
                <label>${translations[currentLang]['logic_test_9_switch'] || 'Interrupteur'} 1 → </label>
                <select id="answer-1-${this.id}" aria-label="Relais pour l'interrupteur 1">
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
                <label>${translations[currentLang]['logic_test_9_switch'] || 'Interrupteur'} 2 → </label>
                <select id="answer-2-${this.id}" aria-label="Relais pour l'interrupteur 2">
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
                <label>${translations[currentLang]['logic_test_9_switch'] || 'Interrupteur'} 3 → </label>
                <select id="answer-3-${this.id}" aria-label="Relais pour l'interrupteur 3">
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
              <button id="submit-${this.id}" class="submit-challenge space-button" style="display: none;">${translations[currentLang]['logic_test_9_submit'] || 'Valider'}</button>
            </div>
          `;
          const switches = document.querySelectorAll(`.switch`);
          switches.forEach(switchEl => {
            const switchId = parseInt(switchEl.id.split('-')[1]);
            const stateEl = switchEl.querySelector('.switch-state');
            switchEl.addEventListener('click', () => {
              const currentState = stateEl.textContent === 'OFF' ? 'ON' : 'OFF';
              stateEl.textContent = currentState;
              switchEl.classList.toggle('active');
              playSwitchSound();
            });
            switchEl.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                const currentState = stateEl.textContent === 'OFF' ? 'ON' : 'OFF';
                stateEl.textContent = currentState;
                switchEl.classList.toggle('active');
                playSwitchSound();
              }
            });
          });
          const visitButton = document.getElementById(`visit-${this.id}`);
          let offset = 0;
          const animateDoor = () => {
            offset += 0.05;
            visitButton.style.transform = `translateX(${Math.sin(offset) * 2}px)`;
            requestAnimationFrame(animateDoor);
          };
          animateDoor();
          visitButton.addEventListener('click', () => {
            const bulbsContainer = document.getElementById(`bulbs-container-${this.id}`);
            const answersContainer = document.getElementById(`answers-container-${this.id}`);
            const submitButton = document.getElementById(`submit-${this.id}`);
            visitButton.style.display = 'none';
            switches.forEach(switchEl => switchEl.style.pointerEvents = 'none');
            bulbsContainer.style.display = 'block';
            answersContainer.style.display = 'block';
            submitButton.style.display = 'block';
            for (let i = 1; i <= 3; i++) {
              const switchState = document.querySelector(`#switch-${i}-${this.id} .switch-state`).textContent;
              const bulbId = this.mapping[i];
              const bulbState = document.querySelector(`#bulb-${bulbId.toLowerCase()}-${this.id} .bulb-state`);
              bulbState.textContent = switchState;
              if (switchState === 'ON') {
                document.getElementById(`bulb-${bulbId.toLowerCase()}-${this.id}`).classList.add('active');
              }
            }
            playRevealSound();
          });
        },
        validate: function() {
          const answers = {
            1: document.getElementById(`answer-1-${this.id}`).value,
            2: document.getElementById(`answer-2-${this.id}`).value,
            3: document.getElementById(`answer-3-${this.id}`).value
          };
          const isCorrect = Object.keys(this.mapping).every(key => this.mapping[key] === answers[key]);
          if (isCorrect) {
            playSuccessSound();
            showSuccessAnimation();
          } else {
            playErrorSound();
          }
          return isCorrect;
        },
        correction: 'logic_test_9_correction',
        softSkills: ['logic_test_9_soft_skills']
      },
      'challenge-10': {
        id: 'challenge-10',
        title: 'logic_test_10_title',
        description: 'logic_test_10_description',
        timeLimit: 45, // 45 secondes
        render: function(container) {
          this.maze = Array(5).fill().map(() => Array(5).fill(0));
          this.maze[0][0] = 2;
          this.maze[4][4] = 3;
          this.maze[1][1] = 1;
          this.maze[2][3] = 1;
          this.maze[3][2] = 1;
          this.clues = {
            '1-0': { from: 'north', to: 'east' },
            '1-1': { from: 'west', to: 'south' },
            '2-2': { from: 'north', to: 'west' },
            '3-3': { from: 'east', to: 'south' },
            '4-4': { from: 'west', to: 'north' }
          };
          this.playerPos = { x: 0, y: 0 };
          this.moves = 0;
          container.innerHTML = `
            <div class="logic-test space-theme">
              <div class="mission-header">
                <h2 class="mission-title">Mission 10 : Navigation Stellaire</h2>
                <div class="timer-container">
                  <span id="timer-${this.id}" aria-live="polite">${formatTime(this.timeLimit)}</span>
                </div>
              </div>
              <p class="challenge-description">${translations[currentLang][this.description]}</p>
              <div class="instructions-tooltip">
                <button class="info-btn" aria-label="Afficher les instructions">?</button>
                <div class="tooltip-content">
                  Naviguez dans le labyrinthe spatial pour atteindre la sortie (en bas à droite). Suivez les indices pour trouver le chemin. Combien de mouvements minimum faut-il ?
                </div>
              </div>
              <div class="maze-container space-maze" id="maze-container-${this.id}" aria-label="Labyrinthe spatial"></div>
              <div class="clue-display space-clue-display" id="clue-display-${this.id}" aria-live="polite"></div>
              <div class="controls space-controls">
                <button id="up-${this.id}" aria-label="Haut">${translations[currentLang]['logic_test_10_up'] || 'Haut'}</button>
                <button id="down-${this.id}" aria-label="Bas">${translations[currentLang]['logic_test_10_down'] || 'Bas'}</button>
                <button id="left-${this.id}" aria-label="Gauche">${translations[currentLang]['logic_test_10_left'] || 'Gauche'}</button>
                <button id="right-${this.id}" aria-label="Droite">${translations[currentLang]['logic_test_10_right'] || 'Droite'}</button>
              </div>
              <label for="moves-answer-${this.id}">${translations[currentLang]['logic_test_10_answer_label'] || 'Nombre minimum de mouvements ?'}</label>
              <input type="number" id="moves-answer-${this.id}" min="1" max="20" value="1" aria-label="Nombre minimum de mouvements">
              <button id="submit-${this.id}" class="submit-challenge space-button">${translations[currentLang]['logic_test_10_submit'] || 'Valider'}</button>
            </div>
          `;
          const mazeContainer = document.getElementById(`maze-container-${this.id}`);
          for (let y = 0; y < 5; y++) {
            for (let x = 0; x < 5; x++) {
              const cell = document.createElement('div');
              cell.className = 'maze-cell space-cell';
              if (this.maze[y][x] === 1) cell.classList.add('wall');
              if (this.maze[y][x] === 2) cell.classList.add('entrance');
              if (this.maze[y][x] === 3) cell.classList.add('exit');
              if (x === this.playerPos.x && y === this.playerPos.y) cell.classList.add('player');
              cell.setAttribute('aria-label', `Cellule ${x},${y}`);
              mazeContainer.appendChild(cell);
            }
          }
          const clueDisplay = document.getElementById(`clue-display-${this.id}`);
          const updateClue = () => {
            const key = `${this.playerPos.y}-${this.playerPos.x}`;
            if (this.clues[key]) {
              clueDisplay.textContent = `${translations[currentLang]['logic_test_10_clue_from'] || 'Si vous venez de'} ${translations[currentLang][`logic_test_10_direction_${this.clues[key].from}`] || this.clues[key].from}, ${translations[currentLang]['logic_test_10_clue_to'] || 'allez à'} ${translations[currentLang][`logic_test_10_direction_${this.clues[key].to}`] || this.clues[key].to}`;
            } else {
              clueDisplay.textContent = translations[currentLang]['logic_test_10_no_clue'] || "Aucun indice ici.";
            }
            clueDisplay.style.opacity = Math.abs(Math.sin(Date.now() * 0.002)) * 0.3 + 0.7;
          };
          updateClue();
          const animateClue = () => {
            updateClue();
            requestAnimationFrame(animateClue);
          };
          animateClue();
          let fakeExitCount = 0;
          const maxFakeExits = 2;
          const addFakeExit = () => {
            if (fakeExitCount >= maxFakeExits) return
                        const fakeExit = document.createElement('div');
            fakeExit.className = 'fake-exit space-fake-exit';
            fakeExit.textContent = translations[currentLang]['logic_test_10_fake_exit'] || 'Sortie';
            fakeExit.style.left = `${Math.random() * 80}%`;
            fakeExit.style.top = `${Math.random() * 80}%`;
            mazeContainer.appendChild(fakeExit);
            fakeExitCount++;
            setTimeout(() => {
              fakeExit.remove();
              fakeExitCount--;
            }, 3000);
          };
          setInterval(addFakeExit, 5000);
          const directions = {
            up: { dx: 0, dy: -1, name: 'north' },
            down: { dx: 0, dy: 1, name: 'south' },
            left: { dx: -1, dy: 0, name: 'west' },
            right: { dx: 1, dy: 0, name: 'east' }
          };
          Object.keys(directions).forEach(dir => {
            const button = document.getElementById(`${dir}-${this.id}`);
            button.addEventListener('click', () => {
              const { dx, dy, name } = directions[dir];
              const newX = this.playerPos.x + dx;
              const newY = this.playerPos.y + dy;
              if (newX >= 0 && newX < 5 && newY >= 0 && newY < 5 && this.maze[newY][newX] !== 1) {
                this.playerPos = { x: newX, y: newY };
                this.moves++;
                mazeContainer.innerHTML = '';
                for (let y = 0; y < 5; y++) {
                  for (let x = 0; x < 5; x++) {
                    const cell = document.createElement('div');
                    cell.className = 'maze-cell space-cell';
                    if (this.maze[y][x] === 1) cell.classList.add('wall');
                    if (this.maze[y][x] === 2) cell.classList.add('entrance');
                    if (this.maze[y][x] === 3) cell.classList.add('exit');
                    if (x === this.playerPos.x && y === this.playerPos.y) cell.classList.add('player');
                    cell.setAttribute('aria-label', `Cellule ${x},${y}`);
                    mazeContainer.appendChild(cell);
                  }
                }
                updateClue();
                playMoveSound();
              }
            });
          });
        },
        validate: function() {
          const answerInput = document.getElementById(`moves-answer-${this.id}`);
          if (!answerInput) return false;
          const answer = parseInt(answerInput.value);
          const isCorrect = this.playerPos.x === 4 && this.playerPos.y === 4 && answer === 5; // 5 mouvements minimum
          if (isCorrect) {
            playSuccessSound();
            showSuccessAnimation();
          } else {
            playErrorSound();
          }
          return isCorrect;
        },
        correction: 'logic_test_10_correction',
        softSkills: ['logic_test_10_soft_skills']
      }
    };

    // Fonction utilitaire pour mélanger un tableau
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    // Formater le temps (MM:SS)
    function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // Vérifier si deux lignes se croisent (simplifié)
    function doLinesIntersect(p1, p2, p3, p4) {
      const det = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
      if (det === 0) return false; // Lignes parallèles
      const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / det;
      const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / det;
      return t > 0 && t < 1 && u > 0 && u < 1;
    }

    // Fonctions pour les sons (simulées, à implémenter avec des fichiers audio réels)
    function playSuccessSound() {
      const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-1.mp3'); // Remplacer par un fichier audio réel
      audio.play().catch(() => console.log("Erreur lors de la lecture du son de succès"));
    }

    function playErrorSound() {
      const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3'); // Remplacer par un fichier audio réel
      audio.play().catch(() => console.log("Erreur lors de la lecture du son d'erreur"));
    }

    function playDropSound() {
      const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-4.mp3'); // Remplacer par un fichier audio réel
      audio.play().catch(() => console.log("Erreur lors de la lecture du son de dépôt"));
    }

    function playConnectSound() {
      const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-5.mp3'); // Remplacer par un fichier audio réel
      audio.play().catch(() => console.log("Erreur lors de la lecture du son de connexion"));
    }

    function playWeighSound() {
      const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-6.mp3'); // Remplacer par un fichier audio réel
      audio.play().catch(() => console.log("Erreur lors de la lecture du son de pesée"));
    }

    function playSwitchSound() {
      const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-7.mp3'); // Remplacer par un fichier audio réel
      audio.play().catch(() => console.log("Erreur lors de la lecture du son d'interrupteur"));
    }

    function playRevealSound() {
      const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-8.mp3'); // Remplacer par un fichier audio réel
      audio.play().catch(() => console.log("Erreur lors de la lecture du son de révélation"));
    }

    function playCollectSound() {
      const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-9.mp3'); // Remplacer par un fichier audio réel
      audio.play().catch(() => console.log("Erreur lors de la lecture du son de collecte"));
    }

    function playMoveSound() {
      const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3'); // Remplacer par un fichier audio réel
      audio.play().catch(() => console.log("Erreur lors de la lecture du son de mouvement"));
    }

    // Fonction pour afficher une animation de succès
    function showSuccessAnimation() {
      const overlay = document.createElement('div');
      overlay.className = 'success-overlay';
      overlay.innerHTML = `
        <div class="success-animation">
          <div class="star-burst"></div>
          <p>Mission Accomplie !</p>
        </div>
      `;
      document.body.appendChild(overlay);
      setTimeout(() => overlay.remove(), 2000);
    }

    // Variables globales pour gérer les timers
    const timers = {};

 // Définir initializeLogicTests dans le scope global
window.initializeLogicTests = function() {
  console.log("Initialisation des Défis Logiques et Soft Skills...");
  const testList = document.getElementById('logic-test-list');
  const testContent = document.getElementById('logic-test-result');

  if (!testList || !testContent) {
    console.error("Éléments pour les défis logiques non trouvés.");
    return;
  }

  // Ajouter la classe space-theme au conteneur parent
  testList.classList.add('space-theme');

  // Afficher la liste des défis avec un thème spatial
  testList.innerHTML = `
    <div class="mission-board">
      <h2 class="board-title">Missions Spatiales</h2>
      <div class="progress-bar">
        <div class="progress" style="width: 0%"></div>
      </div>
    </div>
  `;
  const missionBoard = testList.querySelector('.mission-board');
  Object.values(challenges).forEach((challenge, index) => {
    const challengeItem = document.createElement('div');
    challengeItem.className = 'challenge-item space-mission';
    challengeItem.innerHTML = `
      <h3>Mission ${index + 1} : ${translations[currentLang][challenge.title]}</h3>
      <button aria-label="Lancer la mission ${index + 1}">${translations[currentLang]['start_challenge'] || 'Lancer le défi'}</button>
    `;
    const button = challengeItem.querySelector('button');
    button.addEventListener('click', () => {
      console.log(`Bouton cliqué pour lancer le défi : ${challenge.id}`);
      startChallenge(challenge.id);
    });
    missionBoard.appendChild(challengeItem);
  });
  // Mettre à jour la barre de progression (simulée)
  const progress = (Object.keys(challenges).length / 10) * 100; // 10 missions au total
  missionBoard.querySelector('.progress').style.width = `${progress}%`;
};

    // Définir startChallenge dans le scope global
    window.startChallenge = function(challengeId) {
      console.log(`startChallenge appelé avec challengeId : ${challengeId}`);
      const challenge = challenges[challengeId];
      if (!challenge) {
        console.error(`Défi non trouvé pour l'ID : ${challengeId}`);
        return;
      }

      const testContent = document.getElementById('logic-test-content');
      const testResult = document.getElementById('logic-test-result');
      if (!testContent || !testResult) {
        console.error("Éléments logic-test-content ou logic-test-result non trouvés.");
        return;
      }

      console.log("Nettoyage des éléments existants...");
      testContent.innerHTML = '';
      testResult.innerHTML = '';

      console.log("Rendu du défi...");
      challenge.render(testContent);

      console.log("Lancement du timer...");
      let timeLeft = challenge.timeLimit;
      const timerElement = document.getElementById(`timer-${challengeId}`);
      if (!timerElement) {
        console.error(`Élément timer-${challengeId} non trouvé.`);
        return;
      }
      timerElement.textContent = formatTime(timeLeft);
      timers[challengeId] = setInterval(() => {
        timeLeft--;
        timerElement.textContent = formatTime(timeLeft);
        if (timeLeft <= 10) {
          timerElement.style.color = '#ff4d4d'; // Alerte visuelle
        }
        if (timeLeft <= 0) {
          stopChallenge(challengeId, false);
        }
      }, 1000);

      console.log("Attachement de l'événement de validation...");
      const submitButton = document.getElementById(`submit-${challengeId}`);
      if (submitButton) {
        submitButton.addEventListener('click', () => {
          stopChallenge(challengeId);
        });
      } else {
        console.error(`Bouton submit-${challengeId} non trouvé.`);
      }
    };

    // Définir stopChallenge dans le scope global
    window.stopChallenge = function(challengeId, userSubmitted = true) {
      console.log(`stopChallenge appelé avec challengeId : ${challengeId}, userSubmitted : ${userSubmitted}`);
      const challenge = challenges[challengeId];
      clearInterval(timers[challengeId]);
      delete timers[challengeId];

      // Valider la réponse avant de nettoyer le DOM
      const success = userSubmitted ? challenge.validate() : false;

      // Nettoyer le contenu après validation
      const testContent = document.getElementById('logic-test-content');
      const testResult = document.getElementById('logic-test-result');
      testContent.innerHTML = '';

      // Afficher le résultat avec un style spatial
      testResult.innerHTML = `
        <div class="challenge-result space-theme ${success ? 'success' : 'failure'}">
          <h3>${success ? (translations[currentLang]['challenge_success'] || 'Succès !') : (translations[currentLang]['challenge_failure'] || 'Échec !')}</h3>
          <p>${challenge.getResultMessage ? challenge.getResultMessage() : translations[currentLang][challenge.correction]}</p>
          <p><strong>${translations[currentLang]['soft_skills_evaluated'] || 'Soft skills évalués :'}</strong> ${translations[currentLang][challenge.softSkills]}</p>
          <button onclick="initializeLogicTests()" aria-label="Retour à la liste des missions">${translations[currentLang]['back_to_list'] || 'Retour à la liste'}</button>
        </div>
      `;
    };

    console.log("Fin de l'exécution de logic-tests.js");
  } catch (error) {
    console.error("Erreur lors de l'exécution de logic-tests.js :", error);
  }
});
