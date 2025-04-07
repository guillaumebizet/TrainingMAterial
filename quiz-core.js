// Variables globales
let questions = [];
let selectedQuestions = [];
let score = 0;
let correctCount = 0;
let incorrectCount = 0;
let timerInterval;
let timeElapsed = 0;
let candidateName = '';
let scores = [];
let currentLot = "Non spécifié";
let currentLang = "fr"; // Langue par défaut
let translations = {};

// Charger les traductions
async function loadTranslations(lang) {
  try {
    const response = await fetch(`lang/${lang}.json`);
    if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
    translations[lang] = await response.json();
    applyTranslations();
  } catch (error) {
    console.error(`Erreur lors du chargement des traductions pour ${lang}:`, error);
  }
}

function applyTranslations() {
  document.querySelectorAll('[data-lang]').forEach(element => {
    const key = element.getAttribute('data-lang');
    element.textContent = translations[currentLang][key] || key;
  });
  // Placeholder pour candidate-name
  document.getElementById('candidate-name').placeholder = currentLang === "fr" ? "Entrez votre nom" : "Enter your name";
}

function changeLanguage(lang) {
  currentLang = lang;
  loadTranslations(lang);
}

function showModal(message, details = null) {
  const modal = document.getElementById('github-modal');
  const modalMessage = document.getElementById('modal-message');
  const closeBtn = document.getElementById('modal-close-btn');

  let formattedDetails = '';

  if (details && typeof details === 'object' && details.question) {
    formattedDetails = `
      <h3>Détails de la question</h3>
      <p><strong>Question (FR):</strong> ${details.question.fr}</p>
      <p><strong>Question (US):</strong> ${details.question.us}</p>
      <h4>Options:</h4>
      ${details.options.fr.map((option, i) => `
        <p>${i + 1}. ${option} / ${details.options.us[i]} ${details.type === 'Choix simple' ? (i === parseInt(details.correct) ? '(Correct)' : '') : (Array.isArray(details.correct) && details.correct.includes(i) ? '(Correct)' : '')}</p>
      `).join('')}
      <p><strong>Lot:</strong> ${details.lot}</p>
      <p><strong>Type:</strong> ${details.type}</p>
    `;
  } else if (details && typeof details === 'string') {
    formattedDetails = `<p>${details}</p>`;
  } else if (details) {
    formattedDetails = `<p>Détails non disponibles ou format non pris en charge.</p>`;
  }

  modalMessage.innerHTML = `
    ${translations[currentLang]?.[message] || message}
    ${formattedDetails ? `<div style="margin-top: 10px; text-align: left; max-height: 200px; overflow-y: auto;">${formattedDetails}</div>` : ''}
  `;
  modal.style.display = 'flex';

  closeBtn.onclick = () => {
    modal.style.display = 'none';
  };
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function updateScoreCounter() {
  document.getElementById('current-score').textContent = score;
  document.getElementById('total-questions').textContent = selectedQuestions.length;
  document.getElementById('correct-count').textContent = correctCount;
  document.getElementById('incorrect-count').textContent = incorrectCount;
}

function updateTimer() {
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;
  document.getElementById('timer').textContent = `Temps : ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
  console.log('Démarrage du timer');
  timerInterval = setInterval(() => {
    timeElapsed++;
    updateTimer();
  }, 1000);
}

function validateAnswer(index) {
  const question = selectedQuestions[index];
  const selected = document.querySelectorAll(`input[name="option-${index}"]:checked`);
  const feedback = document.getElementById(`feedback-${index}`);
  const validateBtn = document.querySelectorAll('.validate-btn')[index];

  if (!selected.length) {
    showModal('select_answer');
    return;
  }

  const answers = Array.from(selected).map(i => parseInt(i.value, 10));
  const correct = Array.isArray(question.correct) ? question.correct : [question.correct];

  const isCorrect = (
    answers.length === correct.length &&
    answers.every(ans => correct.includes(ans))
  );

  if (isCorrect) {
    score++;
    correctCount++;
    feedback.textContent = "Correct !";
    feedback.className = 'feedback correct';
  } else {
    incorrectCount++;
    feedback.textContent = "Incorrect";
    feedback.className = 'feedback incorrect';
  }

  feedback.style.display = 'inline-block';
  updateScoreCounter();
  selected.forEach(input => input.disabled = true);
  validateBtn.disabled = true;

  const allValidated = [...document.querySelectorAll('.validate-btn')].every(btn => btn.disabled);
  if (allValidated) {
    clearInterval(timerInterval);
    showResult();
  }
}

function showResult() {
  document.getElementById('quiz-container').style.display = 'none';
  document.getElementById('result').style.display = 'block';
  document.getElementById('score').textContent = score;
  document.getElementById('total-questions-result').textContent = selectedQuestions.length;
}

function showTab(tabId) {
  document.querySelectorAll('#start-screen, #quiz-container, #edit-container, #scores-container, #result').forEach(el => el.style.display = 'none');
  document.getElementById(tabId).style.display = 'block';
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  const activeTab = document.querySelector(`.tab[onclick="showTab('${tabId}')"]`);
  if (activeTab) {
    activeTab.classList.add('active');
  }
  if (tabId === 'edit-container') {
    if (typeof fetchQuestions === 'function') {
      fetchQuestions().then(() => loadQuestionList());
    } else {
      console.error("fetchQuestions n'est pas défini.");
    }
  }
  if (tabId === 'scores-container') loadScores();
}

async function startQuiz() {
  try {
    candidateName = document.getElementById('candidate-name').value.trim();
    if (!candidateName) {
      showModal('enter_name');
      return;
    }

    const lotSelect = document.getElementById('lot-selection');
    const selectedLot = lotSelect.value;
    if (!selectedLot) {
      showModal('select_lot_prompt');
      return;
    }

    if (typeof fetchQuestions !== 'function') {
      showModal('questions_not_loaded');
      return;
    }

    await fetchQuestions();

    if (!questions || questions.length === 0) {
      showModal('no_questions_loaded');
      return;
    }

    selectedQuestions = questions.filter(q =>
      q.lot && q.lot.trim().toUpperCase() === selectedLot.trim().toUpperCase()
    );
    console.log(`Questions pour ${selectedLot} :`, selectedQuestions.length, selectedQuestions); // Log ajouté

    if (selectedQuestions.length === 0) {
      showModal('no_questions_for_lot');
      return;
    }

    currentLot = selectedLot;
    lotSelect.value = selectedLot;

    selectedQuestions = shuffle([...selectedQuestions]);
    score = 0;
    correctCount = 0;
    incorrectCount = 0;
    timeElapsed = 0;

    updateScoreCounter();
    updateTimer();
    showTab('quiz-container');
    loadQuestions();
    startTimer();
  } catch (error) {
    console.error("Erreur dans startQuiz :", error);
    showModal("Une erreur s'est produite lors du démarrage du quiz : " + error.message);
  }
}

function loadQuestions() {
  const container = document.getElementById('questions-list');
  if (!container) {
    console.error("Conteneur 'questions-list' non trouvé.");
    return;
  }
  container.innerHTML = '';

  if (!selectedQuestions || selectedQuestions.length === 0) {
    container.innerHTML = `<p>${translations[currentLang]['no_questions']}</p>`;
    return;
  }

  const shuffledSet = selectedQuestions.map((q) => {
    const clone = structuredClone(q);
    const shuffled = shuffle([...clone.options[currentLang]]);

    if (Array.isArray(clone.correct)) {
      clone.correct = clone.correct.map(c => shuffled.indexOf(clone.options[currentLang][c]));
    } else {
      clone.correct = shuffled.indexOf(clone.options[currentLang][clone.correct]);
    }

    clone.options[currentLang] = shuffled;
    return clone;
  });

  selectedQuestions = shuffledSet;

  shuffledSet.forEach((q, index) => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    questionDiv.innerHTML = `
      <h3>Question ${index + 1} : ${q.question[currentLang]}</h3>
      <div class="options" id="options-${index}"></div>
      <div class="question-actions">
        <button class="validate-btn" onclick="validateAnswer(${index})">${translations[currentLang]['validate']}</button>
        <span class="feedback" id="feedback-${index}"></span>
      </div>
    `;
    container.appendChild(questionDiv);

    const optionsDiv = document.getElementById(`options-${index}`);
    q.options[currentLang].forEach((option, i) => {
      const optionHTML = `
        <div class="option">
          <input type="${q.type === 'QCM' ? 'checkbox' : 'radio'}" name="option-${index}" id="option-${index}-${i}" value="${i}">
          <label for="option-${index}-${i}">${option}</label>
        </div>
      `;
      optionsDiv.insertAdjacentHTML('beforeend', optionHTML);
    });
  });

  updateScoreCounter();
}

function saveScore() {
  console.log("Lot sélectionné au moment de la sauvegarde :", currentLot);
  const lotSelect = document.getElementById('lot-selection');
  console.log("Options de lot disponibles :", lotSelect ? lotSelect.innerHTML : "Élément non trouvé");

  const scoreData = {
    name: candidateName,
    date: new Date().toLocaleDateString('fr-FR'),
    score: `${score} / ${selectedQuestions.length}`,
    time: `${Math.floor(timeElapsed / 60)}:${String(timeElapsed % 60).padStart(2, '0')}`,
    lot: currentLot,
    lang: currentLang
  };
  scores.push(scoreData);

  try {
    localStorage.setItem('scores', JSON.stringify(scores));
    console.log("Score sauvegardé localement :", scoreData);
  } catch (e) {
    console.error("Erreur de sauvegarde dans localStorage :", e);
  }

  const token = sessionStorage.getItem('githubPAT');
  if (token) {
    console.log("Tentative de sauvegarde sur GitHub avec PAT:", scores);
    saveScoresToGitHub(token);
    clearInterval(timerInterval);
    showTab('scores-container');
    return true;
  } else {
    console.log("Aucun PAT fourni, sauvegarde uniquement locale.");
    return false;
  }
}

// Initialisation et événements
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM chargé, attachement des événements...");

  loadTranslations(currentLang).then(() => {
    fetchQuestions().then(() => {
      loadQuestionList();
      loadScores();
    });
  });

  const startQuizButton = document.getElementById('start-quiz-button');
  if (startQuizButton) {
    startQuizButton.addEventListener('click', startQuiz);
    console.log("Événement attaché au bouton 'start-quiz-button'");
  } else {
    console.error("Bouton 'start-quiz-button' non trouvé.");
  }

  const validatePatButton = document.getElementById('validate-pat-btn');
  const patInput = document.getElementById('github-pat');
  const patStatus = document.getElementById('pat-status');
  const patFeedback = document.getElementById('pat-feedback');
  const resetPatButton = document.getElementById('reset-pat-btn');

  if (sessionStorage.getItem('githubPAT')) {
    patInput.style.display = 'none';
    validatePatButton.style.display = 'none';
    patStatus.style.display = 'inline';
    console.log("PAT déjà chargé au démarrage.");
  }

  if (validatePatButton) {
    validatePatButton.addEventListener('click', () => {
      const pat = patInput.value.trim();
      if (pat) {
        sessionStorage.setItem('githubPAT', pat);
        patFeedback.textContent = translations[currentLang]['pat_validated'] || 'PAT validé avec succès !';
        patFeedback.style.display = 'block';
        patInput.style.display = 'none';
        validatePatButton.style.display = 'none';
        patStatus.style.display = 'inline';
        patInput.value = '';
        setTimeout(() => patFeedback.style.display = 'none', 3000);
        console.log("PAT validé et interface mise à jour.");
      } else {
        showModal('invalid_pat');
      }
    });
    console.log("Événement attaché au bouton 'validate-pat-btn'");
  } else {
    console.error("Bouton 'validate-pat-btn' non trouvé.");
  }

  if (resetPatButton) {
    resetPatButton.addEventListener('click', () => {
      sessionStorage.removeItem('githubPAT');
      patInput.style.display = 'inline';
      validatePatButton.style.display = 'inline';
      patStatus.style.display = 'none';
      console.log("PAT réinitialisé.");
      applyTranslations();
    });
    console.log("Événement attaché au bouton 'reset-pat-btn'");
  } else {
    console.error("Bouton 'reset-pat-btn' non trouvé.");
  }

  const saveResultButton = document.getElementById('save-result-btn');
  if (saveResultButton) {
    saveResultButton.addEventListener('click', () => {
      saveScore();
      const feedback = document.getElementById('save-result-feedback');
      feedback.textContent = translations[currentLang]['save_results_success'] || 'Résultats sauvegardés avec succès !';
      feedback.style.display = 'block';
      setTimeout(() => feedback.style.display = 'none', 3000);
    });
    console.log("Événement attaché au bouton 'save-result-btn'");
  } else {
    console.error("Bouton 'save-result-btn' non trouvé.");
  }

  const saveCurrentScoreButton = document.getElementById('save-current-score-btn');
  if (saveCurrentScoreButton) {
    saveCurrentScoreButton.addEventListener('click', () => {
      console.log("Clic sur 'Sauvegarder le score actuel'");
      const saved = saveScore();
      const feedback = document.getElementById('save-current-feedback');
      if (feedback) {
        feedback.textContent = saved ? translations[currentLang]['save_current_success'] || 'Score actuel sauvegardé avec succès !' : translations[currentLang]['scores_local'] || 'Score sauvegardé localement (aucun PAT fourni).';
        feedback.style.display = 'block';
        setTimeout(() => feedback.style.display = 'none', 3000);
      } else {
        console.error("Élément 'save-current-feedback' non trouvé.");
      }
    });
    console.log("Événement attaché au bouton 'save-current-score-btn'");
  } else {
    console.error("Bouton 'save-current-score-btn' non trouvé.");
  }
});
