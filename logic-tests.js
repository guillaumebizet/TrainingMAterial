// logic-tests.js

// Vérifier les dépendances
if (typeof translations === 'undefined' || typeof currentLang === 'undefined') {
  console.error("Erreur : Les variables globales 'translations' ou 'currentLang' ne sont pas définies. Assurez-vous que quiz-core.js est chargé et exécuté correctement avant logic-tests.js.");
  throw new Error("Dépendances manquantes pour logic-tests.js");
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
        <div class="logic-test">
          <div class="timer-container">
            <span id="timer-${this.id}">${formatTime(this.timeLimit)}</span>
          </div>
          <p class="challenge-description">${translations[currentLang][this.description]}</p>
          <div class="clock-container">
            <div id="clock-${this.id}" class="clock">
              <div class="hour-hand" id="hour-hand-${this.id}"></div>
              <div class="minute-hand" id="minute-hand-${this.id}"></div>
            </div>
          </div>
          <label for="angle-slider-${this.id}">${translations[currentLang]['logic_test_1_answer_label']}</label>
          <input type="range" id="angle-slider-${this.id}" min="0" max="360" step="0.1" value="0">
          <p id="angle-value-${this.id}">0°</p>
          <button id="submit-${this.id}" class="submit-challenge">${translations[currentLang]['logic_test_1_submit']}</button>
        </div>
      `;
      // Animation des aiguilles de l’horloge (avec un léger mouvement aléatoire pour distraire)
      const hourHand = document.getElementById(`hour-hand-${this.id}`);
      const minuteHand = document.getElementById(`minute-hand-${this.id}`);
      let hourAngle = 90; // 15h00 = 90°
      let minuteAngle = 90; // 15h15 = 90°
      let offset = 0;
      const animate = () => {
        offset += 0.1;
        const wobble = Math.sin(offset) * 5; // Mouvement aléatoire de ±5°
        hourHand.style.transform = `rotate(${hourAngle + 7.5 + wobble}deg)`; // 15h15 = 7,5° d’avance
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
      if (!slider) return false; // Si l’élément n’existe plus, retourner false
      const answer = parseFloat(slider.value);
      return Math.abs(answer - 7.5) <= 1; // Accepter une marge d’erreur de ±1°
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
        <div class="logic-test">
          <div class="timer-container">
            <span id="timer-${this.id}">${formatTime(this.timeLimit)}</span>
          </div>
          <p class="challenge-description">${translations[currentLang][this.description]}</p>
          <p class="challenge-hint">${translations[currentLang]['logic_test_2_hint']}</p>
          <div class="sock-drawer" id="sock-drawer-${this.id}"></div>
          <div class="drop-zone" id="sock-pile-${this.id}"></div>
          <label for="sock-answer-${this.id}">${translations[currentLang]['logic_test_2_answer_label']}</label>
          <input type="number" id="sock-answer-${this.id}" min="1" max="24" value="1">
          <button id="submit-${this.id}" class="submit-challenge">${translations[currentLang]['logic_test_2_submit']}</button>
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
        sock.className = 'sock';
        sock.dataset.color = color;
        sock.dataset.id = index;
        sock.draggable = true;
        sock.style.backgroundColor = color;
        sock.style.left = `${Math.random() * 80}%`; // Position aléatoire
        sock.style.top = `${Math.random() * 80}%`;
        sockDrawer.appendChild(sock);
        // Animation des chaussettes (mouvement aléatoire, vitesse réduite)
        let x = parseFloat(sock.style.left);
        let y = parseFloat(sock.style.top);
        let dx = (Math.random() - 0.5) * 0.2; // Vitesse réduite
        let dy = (Math.random() - 0.5) * 0.2;
        const animateSock = () => {
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
        }
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
        }
      });
    },
    validate: function() {
      const answerInput = document.getElementById(`sock-answer-${this.id}`);
      if (!answerInput) return false; // Si l’élément n’existe plus, retourner false
      const answer = parseInt(answerInput.value);
      return answer === 4; // La réponse correcte est 4 chaussettes
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
        <div class="logic-test">
          <div class="timer-container">
            <span id="timer-${this.id}">${formatTime(this.timeLimit)}</span>
          </div>
          <p class="challenge-description">${translations[currentLang][this.description]}</p>
          <div class="river-container">
            <div class="river-bank left-bank" id="left-bank-${this.id}">
              <div class="item farmer" id="farmer-${this.id}" draggable="true"></div>
              <div class="item wolf" id="wolf-${this.id}" draggable="true"></div>
              <div class="item goat" id="goat-${this.id}" draggable="true"></div>
              <div class="item cabbage" id="cabbage-${this.id}" draggable="true"></div>
            </div>
            <div class="river">
              <div class="boat" id="boat-${this.id}"></div>
            </div>
            <div class="river-bank right-bank" id="right-bank-${this.id}"></div>
          </div>
          <button id="submit-${this.id}" class="submit-challenge">${translations[currentLang]['logic_test_3_submit'] || 'Terminer'}</button>
        </div>
      `;
      // Animation de la barque (oscillation)
      const boat = document.getElementById(`boat-${this.id}`);
      let boatOffset = 0;
      const animateBoat = () => {
        boatOffset += 0.1;
        boat.style.transform = `translateY(${Math.sin(boatOffset) * 5}px)`; // Oscillation verticale
        requestAnimationFrame(animateBoat);
      };
      animateBoat();
      // Gestion du glisser-déposer
      const leftBank = document.getElementById(`left-bank-${this.id}`);
      const rightBank = document.getElementById(`right-bank-${this.id}`);
      const boat = document.getElementById(`boat-${this.id}`);
      const items = document.querySelectorAll(`#left-bank-${this.id} .item, #right-bank-${this.id} .item`);
      items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', e.target.id);
        });
      });
      [leftBank, rightBank, boat].forEach(zone => {
        zone.addEventListener('dragover', (e) => e.preventDefault());
        zone.addEventListener('drop', (e) => {
          e.preventDefault();
          const itemId = e.dataTransfer.getData('text/plain');
          const item = document.getElementById(itemId);
          if (item) {
            // Si on dépose dans la barque, vérifier qu'il n'y a pas déjà un autre item (sauf le fermier)
            if (zone === boat) {
              const itemsInBoat = boat.querySelectorAll('.item:not(.farmer)').length;
              if (itemsInBoat >= 1 && itemId !== `farmer-${this.id}`) return; // Limite à 1 item + fermier
            }
            zone.appendChild(item);
            // Vérifier les règles si on dépose sur une rive
            if (zone === leftBank || zone === rightBank) {
              const bankItems = Array.from(zone.querySelectorAll('.item')).map(i => i.classList[1]);
              const hasFarmer = bankItems.includes('farmer');
              if (!hasFarmer) {
                if (bankItems.includes('wolf') && bankItems.includes('goat')) {
                  alert(translations[currentLang]['logic_test_3_wolf_eats_goat'] || "Le loup a mangé la chèvre !");
                  stopChallenge(this.id, false);
                }
                if (bankItems.includes('goat') && bankItems.includes('cabbage')) {
                  alert(translations[currentLang]['logic_test_3_goat_eats_cabbage'] || "La chèvre a mangé le chou !");
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
      return itemsOnRight.includes('farmer') && itemsOnRight.includes('wolf') && itemsOnRight.includes('goat') && itemsOnRight.includes('cabbage');
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
        <div class="logic-test">
          <div class="timer-container">
            <span id="timer-${this.id}">${formatTime(this.timeLimit)}</span>
          </div>
          <p class="challenge-description">${translations[currentLang][this.description]}</p>
          <div class="color-container" id="color-container-${this.id}">
            <div class="color-circle red" id="red-${this.id}"></div>
            <div class="color-circle blue" id="blue-${this.id}"></div>
            <div class="color-circle green" id="green-${this.id}"></div>
            <div class="color-circle yellow" id="yellow-${this.id}"></div>
          </div>
        </div>
      `;
      // Animation des cercles de couleur
      const containerElement = document.getElementById(`color-container-${this.id}`);
      const circles = document.querySelectorAll(`#color-container-${this.id} .color-circle`);
      circles.forEach(circle => {
        let x = Math.random() * 80;
        let y = Math.random() * 80;
        let dx = (Math.random() - 0.5) * 2;
        let dy = (Math.random() - 0.5) * 2;
        const animateCircle = () => {
          x += dx;
          y += dy;
          if (x < 0 || x > 80) dx = -dx;
          if (y < 0 || y > 80) dy = -dy;
          circle.style.left = `${x}%`;
          circle.style.top = `${y}%`;
          requestAnimationFrame(animateCircle);
        };
        animateCircle();
        circle.addEventListener('click', () => {
          this.selectedColor = circle.classList[1];
          stopChallenge(this.id);
        });
      });
      // Ajouter des cercles fantômes (distractions)
      const addGhostCircle = () => {
        const ghost = document.createElement('div');
        ghost.className = 'color-circle ghost';
        ghost.style.backgroundColor = ['#ff00ff', '#00ffff', '#ffff00'][Math.floor(Math.random() * 3)];
        ghost.style.left = `${Math.random() * 80}%`;
        ghost.style.top = `${Math.random() * 80}%`;
        containerElement.appendChild(ghost);
        setTimeout(() => ghost.remove(), 2000);
      };
      setInterval(addGhostCircle, 3000);
    },
    validate: function() {
      return !!this.selectedColor; // Succès si une couleur est sélectionnée
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
        <div class="logic-test">
          <div class="timer-container">
            <span id="timer-${this.id}">${formatTime(this.timeLimit)}</span>
          </div>
          <p class="challenge-description">${translations[currentLang][this.description]}</p>
          <div class="houses-container">
            <div class="houses">
              <div class="house" id="house-a-${this.id}">A</div>
              <div class="house" id="house-b-${this.id}">B</div>
              <div class="house" id="house-c-${this.id}">C</div>
            </div>
            <div class="canvas-container">
              <canvas id="canvas-${this.id}" width="400" height="200"></canvas>
            </div>
            <div class="services">
              <div class="service water" id="water-${this.id}">${translations[currentLang]['logic_test_5_service_water'] || 'Eau'}</div>
              <div class="service electricity" id="electricity-${this.id}">${translations[currentLang]['logic_test_5_service_electricity'] || 'Électricité'}</div>
              <div class="service gas" id="gas-${this.id}">${translations[currentLang]['logic_test_5_service_gas'] || 'Gaz'}</div>
            </div>
          </div>
          <button id="submit-${this.id}" class="submit-challenge">${translations[currentLang]['logic_test_5_submit'] || 'Valider'}</button>
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
          }
        });
      });

      // Animation des services (oscillation)
      services.forEach(service => {
        let offset = Math.random() * 100;
        const animateService = () => {
          offset += 0.1;
          service.style.transform = `translateY(${Math.sin(offset) * 5}px)`;
          requestAnimationFrame(animateService);
        };
        animateService();
      });

      this.connections = connections;
    },
    validate: function() {
      // Vérifier si chaque maison est connectée à chaque service sans croisement
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
      // Vérifier les croisements (simplifié : vérifier si les lignes se croisent)
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
      return hasAllConnections && !hasCrossing;
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
      // Générer une pièce plus légère aléatoire
      this.lightCoin = Math.floor(Math.random() * 9) + 1;
      container.innerHTML = `
        <div class="logic-test">
          <div class="timer-container">
            <span id="timer-${this.id}">${formatTime(this.timeLimit)}</span>
          </div>
          <p class="challenge-description">${translations[currentLang][this.description]}</p>
          <div class="coins-container" id="coins-container-${this.id}">
            ${Array.from({ length: 9 }, (_, i) => `
              <div class="coin" id="coin-${i + 1}-${this.id}" draggable="true">${i + 1}</div>
            `).join('')}
          </div>
          <div class="scale-container">
            <div class="scale">
              <div class="scale-pan left-pan" id="left-pan-${this.id}"></div>
              <div class="scale-pan right-pan" id="right-pan-${this.id}"></div>
            </div>
            <button id="weigh-${this.id}">${translations[currentLang]['logic_test_6_weigh'] || 'Peser'}</button>
          </div>
          <label for="light-coin-${this.id}">${translations[currentLang]['logic_test_6_answer_label'] || 'Quelle pièce est plus légère ?'}</label>
          <input type="number" id="light-coin-${this.id}" min="1" max="9" value="1">
          <button id="submit-${this.id}" class="submit-challenge">${translations[currentLang]['logic_test_6_submit'] || 'Valider'}</button>
        </div>
      `;
      // Gestion du glisser-déposer
      const coins = document.querySelectorAll(`#coins-container-${this.id} .coin`);
      const leftPan = document.getElementById(`left-pan-${this.id}`);
      const rightPan = document.getElementById(`right-pan-${this.id}`);
      coins.forEach(coin => {
        coin.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', e.target.id);
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
          }
        });
      });
      // Animation de la balance (tremblement)
      const scale = document.querySelector('.scale');
      let offset = 0;
      const animateScale = () => {
        offset += 0.1;
        scale.style.transform = `rotate(${Math.sin(offset) * 2}deg)`; // Tremblement léger
        requestAnimationFrame(animateScale);
      };
      animateScale();
      // Gestion de la pesée
      const weighButton = document.getElementById(`weigh-${this.id}`);
      this.weighCount = 0;
      weighButton.addEventListener('click', () => {
        if (this.weighCount >= 2) {
          alert(translations[currentLang]['logic_test_6_max_weighs'] || "Vous avez déjà fait 2 pesées !");
          return;
        }
        const leftCoins = Array.from(leftPan.querySelectorAll('.coin')).map(c => parseInt(c.id.split('-')[1]));
        const rightCoins = Array.from(rightPan.querySelectorAll('.coin')).map(c => parseInt(c.id.split('-')[1]));
        if (leftCoins.length === 0 || rightCoins.length === 0) {
          alert(translations[currentLang]['logic_test_6_empty_pans'] || "Veuillez placer des pièces sur les deux plateaux !");
          return;
        }
        if (leftCoins.length + rightCoins.length > 6) {
          alert(translations[currentLang]['logic_test_6_too_many_coins'] || "Trop de pièces ! La balance casse !");
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
      });
    },
    validate: function() {
      const answerInput = document.getElementById(`light-coin-${this.id}`);
      if (!answerInput) return false;
      const answer = parseInt(answerInput.value);
      return answer === this.lightCoin;
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
      // Générer un code aléatoire
      this.code = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10));
      const clues = [
        { symbol: 'star', value: this.code[0] },
        { symbol: 'circle', value: this.code[1] },
        { symbol: 'square', value: this.code[2] },
        { symbol: 'triangle', value: this.code[3] }
      ];
      container.innerHTML = `
        <div class="logic-test">
          <div class="timer-container">
            <span id="timer-${this.id}">${formatTime(this.timeLimit)}</span>
          </div>
          <p class="challenge-description">${translations[currentLang][this.description]}</p>
          <div class="clues-container" id="clues-container-${this.id}">
            ${clues.map(clue => `
              <div class="clue ${clue.symbol}" id="clue-${clue.symbol}-${this.id}">
                ${clue.symbol === 'star' ? '★' : clue.symbol === 'circle' ? '●' : clue.symbol === 'square' ? '■' : '▲'} = ${clue.value}
              </div>
            `).join('')}
          </div>
          <div class="safe-container">
            <input type="number" id="code-1-${this.id}" min="0" max="9" value="0">
            <input type="number" id="code-2-${this.id}" min="0" max="9" value="0">
            <input type="number" id="code-3-${this.id}" min="0" max="9" value="0">
            <input type="number" id="code-4-${this.id}" min="0" max="9" value="0">
          </div>
          <button id="submit-${this.id}" class="submit-challenge">${translations[currentLang]['logic_test_7_submit'] || 'Valider'}</button>
        </div>
      `;
      // Animation des indices (clignotement et déplacement)
      const cluesContainer = document.getElementById(`clues-container-${this.id}`);
      clues.forEach(clue => {
        const clueElement = document.getElementById(`clue-${clue.symbol}-${this.id}`);
        let x = Math.random() * 80;
        let y = Math.random() * 80;
        let dx = (Math.random() - 0.5) * 1;
        let dy = (Math.random() - 0.5) * 1;
        const animateClue = () => {
          x += dx;
          y += dy;
          if (x < 0 || x > 80) dx = -dx;
          if (y < 0 || y > 80) dy = -dy;
          clueElement.style.left = `${x}%`;
          clueElement.style.top = `${y}%`;
          clueElement.style.opacity = Math.abs(Math.sin(Date.now() * 0.002)) * 0.5 + 0.5; // Clignotement
          requestAnimationFrame(animateClue);
        };
        animateClue();
      });
      // Ajouter des indices fantômes
      const addGhostClue = () => {
        const ghost = document.createElement('div');
        ghost.className = 'clue ghost';
        ghost.textContent = `${['★', '●', '■', '▲'][Math.floor(Math.random() * 4)]} = ${Math.floor(Math.random() * 10)}`;
        ghost.style.left = `${Math.random() * 80}%`;
        ghost.style.top = `${Math.random() * 80}%`;
        cluesContainer.appendChild(ghost);
        setTimeout(() => ghost.remove(), 2000);
      };
      setInterval(addGhostClue, 3000);
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
      return answer.every((val, i) => val === this.code[i]);
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
        <div class="logic-test">
          <div class="timer-container">
            <span id="timer-${this.id}">${formatTime(this.timeLimit)}</span>
          </div>
          <p class="challenge-description">${translations[currentLang][this.description]}</p>
          <div class="desert-container" id="desert-container-${this.id}">
            <div class="camel" id="camel-1-${this.id}" draggable="true">🐫</div>
            <div class="camel" id="camel-2-${this.id}" draggable="true">🐫</div>
            <div class="camel" id="camel-3-${this.id}" draggable="true">🐫</div>
          </div>
          <div class="water-gauge">
            <div class="water-level" id="water-level-${this.id}"></div>
            <span id="water-amount-${this.id}">0 / 5 ${translations[currentLang]['logic_test_8_liters'] || 'litres'}</span>
          </div>
          <label for="oasis-answer-${this.id}">${translations[currentLang]['logic_test_8_answer_label'] || 'Combien d’oasis faut-il visiter ?'}</label>
          <input type="number" id="oasis-answer-${this.id}" min="1" max="10" value="1">
          <button id="submit-${this.id}" class="submit-challenge">${translations[currentLang]['logic_test_8_submit'] || 'Valider'}</button>
        </div>
      `;
      // Gestion des chameaux et des oasis
      const camels = document.querySelectorAll(`.camel`);
      const desertContainer = document.getElementById(`desert-container-${this.id}`);
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
        oasis.className = 'oasis';
        oasis.style.left = `${Math.random() * 80}%`;
        oasis.style.top = `${Math.random() * 80}%`;
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
          }
        });
      };
      setInterval(addOasis, 7000);
      // Ajouter des mirages
      const addMirage = () => {
        const mirage = document.createElement('div');
        mirage.className = 'mirage';
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
      return answer === 2; // Il faut 2 oasis pour obtenir 5 litres (3 chameaux, 1 litre chacun)
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
      // Générer une correspondance aléatoire
      const mapping = shuffleArray(['A', 'B', 'C']);
      this.mapping = {
        1: mapping[0],
        2: mapping[1],
        3: mapping[2]
      };
      container.innerHTML = `
        <div class="logic-test">
          <div class="timer-container">
            <span id="timer-${this.id}">${formatTime(this.timeLimit)}</span>
          </div>
          <p class="challenge-description">${translations[currentLang][this.description]}</p>
          <div class="switches-container">
            <div class="switch" id="switch-1-${this.id}">${translations[currentLang]['logic_test_9_switch'] || 'Interrupteur'} 1: <span class="switch-state">OFF</span></div>
            <div class="switch" id="switch-2-${this.id}">${translations[currentLang]['logic_test_9_switch'] || 'Interrupteur'} 2: <span class="switch-state">OFF</span></div>
            <div class="switch" id="switch-3-${this.id}">${translations[currentLang]['logic_test_9_switch'] || 'Interrupteur'} 3: <span class="switch-state">OFF</span></div>
          </div>
          <button id="visit-${this.id}">${translations[currentLang]['logic_test_9_visit'] || 'Aller voir les ampoules'}</button>
          <div class="bulbs-container" id="bulbs-container-${this.id}" style="display: none;">
            <div class="bulb" id="bulb-a-${this.id}">A: <span class="bulb-state">OFF</span></div>
            <div class="bulb" id="bulb-b-${this.id}">B: <span class="bulb-state">OFF</span></div>
            <div class="bulb" id="bulb-c-${this.id}">C: <span class="bulb-state">OFF</span></div>
          </div>
          <div class="answers-container" id="answers-container-${this.id}" style="display: none;">
            <label>${translations[currentLang]['logic_test_9_switch'] || 'Interrupteur'} 1 → </label>
            <select id="answer-1-${this.id}">
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
            <label>${translations[currentLang]['logic_test_9_switch'] || 'Interrupteur'} 2 → </label>
            <select id="answer-2-${this.id}">
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
            <label>${translations[currentLang]['logic_test_9_switch'] || 'Interrupteur'} 3 → </label>
            <select id="answer-3-${this.id}">
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
          <button id="submit-${this.id}" class="submit-challenge" style="display: none;">${translations[currentLang]['logic_test_9_submit'] || 'Valider'}</button>
        </div>
      `;
      // Gestion des interrupteurs
      const switches = document.querySelectorAll(`.switch`);
      switches.forEach(switchEl => {
        const switchId = parseInt(switchEl.id.split('-')[1]);
        const stateEl = switchEl.querySelector('.switch-state');
        switchEl.addEventListener('click', () => {
          const currentState = stateEl.textContent === 'OFF' ? 'ON' : 'OFF';
          stateEl.textContent = currentState;
        });
      });
      // Animation de la porte (tremblement)
      const visitButton = document.getElementById(`visit-${this.id}`);
      let offset = 0;
      const animateDoor = () => {
        offset += 0.1;
        visitButton.style.transform = `translateX(${Math.sin(offset) * 3}px)`; // Tremblement
        requestAnimationFrame(animateDoor);
      };
      animateDoor();
      // Gestion de la visite
      visitButton.addEventListener('click', () => {
        const bulbsContainer = document.getElementById(`bulbs-container-${this.id}`);
        const answersContainer = document.getElementById(`answers-container-${this.id}`);
        const submitButton = document.getElementById(`submit-${this.id}`);
        visitButton.style.display = 'none';
        switches.forEach(switchEl => switchEl.style.pointerEvents = 'none'); // Désactiver les interrupteurs
        bulbsContainer.style.display = 'block';
        answersContainer.style.display = 'block';
        submitButton.style.display = 'block';
        // Mettre à jour l’état des ampoules
        for (let i = 1; i <= 3; i++) {
          const switchState = document.querySelector(`#switch-${i}-${this.id} .switch-state`).textContent;
          const bulbId = this.mapping[i];
          const bulbState = document.querySelector(`#bulb-${bulbId.toLowerCase()}-${this.id} .bulb-state`);
          bulbState.textContent = switchState;
        }
      });
    },
    validate: function() {
      const answers = {
        1: document.getElementById(`answer-1-${this.id}`).value,
        2: document.getElementById(`answer-2-${this.id}`).value,
        3: document.getElementById(`answer-3-${this.id}`).value
      };
      return Object.keys(this.mapping).every(key => this.mapping[key] === answers[key]);
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
      // Définir le labyrinthe (5x5) et les indices
      this.maze = Array(5).fill().map(() => Array(5).fill(0)); // 0 = chemin, 1 = mur
      this.maze[0][0] = 2; // Entrée
      this.maze[4][4] = 3; // Sortie
      this.maze[1][1] = 1; // Mur
      this.maze[2][3] = 1; // Mur
      this.maze[3][2] = 1; // Mur
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
        <div class="logic-test">
          <div class="timer-container">
            <span id="timer-${this.id}">${formatTime(this.timeLimit)}</span>
          </div>
          <p class="challenge-description">${translations[currentLang][this.description]}</p>
          <div class="maze-container" id="maze-container-${this.id}"></div>
          <div class="clue-display" id="clue-display-${this.id}"></div>
          <div class="controls">
            <button id="up-${this.id}">${translations[currentLang]['logic_test_10_up'] || 'Haut'}</button>
            <button id="down-${this.id}">${translations[currentLang]['logic_test_10_down'] || 'Bas'}</button>
            <button id="left-${this.id}">${translations[currentLang]['logic_test_10_left'] || 'Gauche'}</button>
            <button id="right-${this.id}">${translations[currentLang]['logic_test_10_right'] || 'Droite'}</button>
          </div>
          <label for="moves-answer-${this.id}">${translations[currentLang]['logic_test_10_answer_label'] || 'Nombre minimum de mouvements ?'}</label>
          <input type="number" id="moves-answer-${this.id}" min="1" max="20" value="1">
          <button id="submit-${this.id}" class="submit-challenge">${translations[currentLang]['logic_test_10_submit'] || 'Valider'}</button>
        </div>
      `;
      // Rendre le labyrinthe
      const mazeContainer = document.getElementById(`maze-container-${this.id}`);
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          const cell = document.createElement('div');
          cell.className = 'maze-cell';
          if (this.maze[y][x] === 1) cell.classList.add('wall');
          if (this.maze[y][x] === 2) cell.classList.add('entrance');
          if (this.maze[y][x] === 3) cell.classList.add('exit');
          if (x === this.playerPos.x && y === this.playerPos.y) cell.classList.add('player');
          mazeContainer.appendChild(cell);
        }
      }
      // Afficher l’indice initial
      const clueDisplay = document.getElementById(`clue-display-${this.id}`);
      const updateClue = () => {
        const key = `${this.playerPos.y}-${this.playerPos.x}`;
        if (this.clues[key]) {
          clueDisplay.textContent = `${translations[currentLang]['logic_test_10_clue_from'] || 'Si vous venez de'} ${translations[currentLang][`logic_test_10_direction_${this.clues[key].from}`] || this.clues[key].from}, ${translations[currentLang]['logic_test_10_clue_to'] || 'allez à'} ${translations[currentLang][`logic_test_10_direction_${this.clues[key].to}`] || this.clues[key].to}`;
        } else {
          clueDisplay.textContent = translations[currentLang]['logic_test_10_no_clue'] || "Aucun indice ici.";
        }
        clueDisplay.style.opacity = Math.abs(Math.sin(Date.now() * 0.002)) * 0.5 + 0.5; // Clignotement
      };
      updateClue();
      // Animation des indices (clignotement)
      const animateClue = () => {
        updateClue();
        requestAnimationFrame(animateClue);
      };
      animateClue();
      // Ajouter des fausses sorties
      const addFakeExit = () => {
        const fakeExit = document.createElement('div');
        fakeExit.className = 'fake-exit';
        fakeExit.textContent = translations[currentLang]['logic_test_10_fake_exit'] || 'Sortie';
        fakeExit.style.left = `${Math.random() * 80}%`;
        fakeExit.style.top = `${Math.random() * 80}%`;
        mazeContainer.appendChild(fakeExit);
        setTimeout(() => fakeExit.remove(), 3000);
      };
      setInterval(addFakeExit, 5000);
      // Gestion des déplacements
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
            // Redessiner le labyrinthe
            mazeContainer.innerHTML = '';
            for (let y = 0; y < 5; y++) {
              for (              let x = 0; x < 5; x++) {
                const cell = document.createElement('div');
                cell.className = 'maze-cell';
                if (this.maze[y][x] === 1) cell.classList.add('wall');
                if (this.maze[y][x] === 2) cell.classList.add('entrance');
                if (this.maze[y][x] === 3) cell.classList.add('exit');
                if (x === this.playerPos.x && y === this.playerPos.y) cell.classList.add('player');
                mazeContainer.appendChild(cell);
              }
            }
            updateClue();
          }
        });
      });
    },
    validate: function() {
      const answerInput = document.getElementById(`moves-answer-${this.id}`);
      if (!answerInput) return false;
      const answer = parseInt(answerInput.value);
      return this.playerPos.x === 4 && this.playerPos.y === 4 && answer === 5; // 5 mouvements minimum
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

// Variables globales pour gérer les timers
const timers = {};

// Initialisation de la section
function initializeLogicTests() {
  console.log("Initialisation des Défis Logiques et Soft Skills...");
  const testList = document.getElementById('logic-test-list');
  const testContent = document.getElementById('logic-test-result');

  if (!testList || !testContent) {
    console.error("Éléments pour les défis logiques non trouvés.");
    return;
  }

  // Afficher la liste des défis
  testList.innerHTML = '';
  Object.values(challenges).forEach(challenge => {
    const challengeItem = document.createElement('div');
    challengeItem.className = 'challenge-item';
    challengeItem.innerHTML = `
      <h3>${translations[currentLang][challenge.title]}</h3>
      <button onclick="startChallenge('${challenge.id}')">${translations[currentLang]['start_challenge'] || 'Lancer le défi'}</button>
    `;
    testList.appendChild(challengeItem);
  });
}

// Lancer un défi
function startChallenge(challengeId) {
  const challenge = challenges[challengeId];
  const testContent = document.getElementById('logic-test-content');
  const testResult = document.getElementById('logic-test-result');
  testContent.innerHTML = '';
  testResult.innerHTML = ''; // Nettoyer les résultats précédents

  // Rendre l’interface du défi
  challenge.render(testContent);

  // Lancer le timer
  let timeLeft = challenge.timeLimit;
  const timerElement = document.getElementById(`timer-${challengeId}`);
  timerElement.textContent = formatTime(timeLeft);
  timers[challengeId] = setInterval(() => {
    timeLeft--;
    timerElement.textContent = formatTime(timeLeft);
    if (timeLeft <= 10) {
      timerElement.style.color = 'red'; // Alerte visuelle
    }
    if (timeLeft <= 0) {
      stopChallenge(challengeId, false);
    }
  }, 1000);

  // Attacher l’événement de validation
  const submitButton = document.getElementById(`submit-${challengeId}`);
  if (submitButton) {
    submitButton.addEventListener('click', () => {
      stopChallenge(challengeId);
    });
  }
}

// Arrêter un défi
function stopChallenge(challengeId, userSubmitted = true) {
  const challenge = challenges[challengeId];
  clearInterval(timers[challengeId]);
  delete timers[challengeId];

  // Valider la réponse avant de nettoyer le DOM
  const success = userSubmitted ? challenge.validate() : false;

  // Nettoyer le contenu après validation
  const testContent = document.getElementById('logic-test-content');
  const testResult = document.getElementById('logic-test-result');
  testContent.innerHTML = '';

  // Afficher le résultat
  testResult.innerHTML = `
    <div class="challenge-result ${success ? 'success' : 'failure'}">
      <h3>${success ? (translations[currentLang]['challenge_success'] || 'Succès !') : (translations[currentLang]['challenge_failure'] || 'Échec !')}</h3>
      <p>${challenge.getResultMessage ? challenge.getResultMessage() : translations[currentLang][challenge.correction]}</p>
      <p><strong>${translations[currentLang]['soft_skills_evaluated'] || 'Soft skills évalués :'}</strong> ${translations[currentLang][challenge.softSkills]}</p>
      <button onclick="initializeLogicTests()">${translations[currentLang]['back_to_list'] || 'Retour à la liste'}</button>
    </div>
  `;
}
