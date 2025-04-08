// logic-tests.js

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
          <p class="challenge-hint">${translations[currentLang]['logic_test_2_hint'] || 'Astuce : Pensez au pire scénario pour garantir une paire !'}</p>
          <div class="sock-drawer" id="sock-drawer-${this.id}"></div>
          <div class="drop-zone" id="sock-pile-${this.id}"></div>
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
        let dx = (Math.random() - 0.5) * 0.2; // Réduire la vitesse (divisé par 10)
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
          // Vérifier si une paire est formée
          const socksInPile = pile.querySelectorAll('.sock');
          const colors = {};
          socksInPile.forEach(s => {
            const color = s.dataset.color;
            colors[color] = (colors[color] || 0) + 1;
          });
          if (Object.values(colors).some(count => count >= 2)) {
            stopChallenge(this.id);
          }
        }
      });
    },
    validate: function() {
      const pile = document.getElementById(`sock-pile-${this.id}`);
      if (!pile) return false; // Si l’élément n’existe plus, retourner false
      const socks = pile.querySelectorAll('.sock');
      const colors = {};
      socks.forEach(sock => {
        const color = sock.dataset.color;
        colors[color] = (colors[color] || 0) + 1;
      });
      return Object.values(colors).some(count => count >= 2);
    },
    correction: 'logic_test_2_correction',
    softSkills: ['logic_test_2_soft_skills']
  }
};

// Fonction utilitaire pour mélanger un tableau
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Formater le temps (MM:SS)
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
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
      <p>${translations[currentLang][challenge.correction]}</p>
      <p><strong>${translations[currentLang]['soft_skills_evaluated'] || 'Soft skills évalués :'}</strong> ${translations[currentLang][challenge.softSkills]}</p>
      <button onclick="initializeLogicTests()">${translations[currentLang]['back_to_list'] || 'Retour à la liste'}</button>
    </div>
  `;
}
