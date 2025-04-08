console.log("Début de l'exécution de quiz-core.js");
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
let currentLang = "fr";
let translations = {};
let validatedStates = []; // Pour stocker l'état des réponses validées

// Charger les traductions
async function loadTranslations(lang) {
  console.log(`Début de loadTranslations pour ${lang}`);
  try {
    console.log(`Tentative de fetch pour lang/${lang}.json`);
    const response = await fetch(`lang/${lang}.json`);
    console.log(`Réponse fetch reçue : ${response.status}`);
    if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
    translations[lang] = await response.json();
    console.log(`Traductions chargées :`, translations[lang]);
    applyTranslations();
    console.log(`Sur le point de déclencher l'événement translationsLoaded pour ${lang}`);
    const event = new Event('translationsLoaded');
    document.dispatchEvent(event);
    console.log(`Traductions pour ${lang} chargées avec succès.`);
  } catch (error) {
    console.error(`Erreur lors du chargement des traductions pour ${lang}:`, error);
  }
}

function applyTranslations() {
  // Mettre à jour les éléments avec data-lang
  document.querySelectorAll('[data-lang]').forEach(element => {
    const key = element.getAttribute('data-lang');
    element.textContent = translations[currentLang][key] || key;
  });

  // Mettre à jour les placeholders avec data-lang-placeholder
  document.querySelectorAll('[data-lang-placeholder]').forEach(element => {
    const key = element.getAttribute('data-lang-placeholder');
    element.placeholder = translations[currentLang][key] || key;
  });

  // Mettre à jour le placeholder du champ candidate-name
  const candidateNameInput = document.getElementById('candidate-name');
  if (candidateNameInput) {
    candidateNameInput.placeholder = translations[currentLang]['candidate_name'] || 'Enter your name';
  }
}

function changeLanguage(lang) {
  currentLang = lang;
  loadTranslations(lang).then(() => {
    // Si un quiz est actif, recharger les questions avec la nouvelle langue
    if (document.getElementById('quiz-container').style.display === 'block') {
      // Sauvegarder l'état des réponses validées avant de recharger
      saveValidatedStates();
      loadQuestions();
      // Restaurer l'état des réponses validées après rechargement
      restoreValidatedStates();
    }
    // Réinitialiser les sections dynamiques si elles sont visibles
    const currentTab = document.querySelector('.tab.active');
    if (currentTab) {
      const tabId = currentTab.getAttribute('onclick').match(/'([^']+)'/)[1];
      showTab(tabId);
    }
  });
}

function showModal(message, details = null) {
  const modal = document.getElementById('github-modal');
  const modalMessage = document.getElementById('modal-message');
  const closeBtn = document.getElementById('modal-close-btn');

  let formattedDetails = '';

  if (details && typeof details === 'object' && details.question) {
    formattedDetails = `
      <h3>${translations[currentLang]['modal_details_title'] || 'Détails de la question'}</h3>
      <p><strong>${translations[currentLang]['modal_question_fr'] || 'Question (FR)'}:</strong> ${details.question.fr}</p>
      <p><strong>${translations[currentLang]['modal_question_us'] || 'Question (US)'}:</strong> ${details.question.us}</p>
      <h4>${translations[currentLang]['modal_options'] || 'Options'}:</h4>
      ${details.options.fr.map((option, i) => `
        <p>${i + 1}. ${option} / ${details.options.us[i]} ${details.type === 'Choix simple' ? (i === parseInt(details.correct) ? '(' + (translations[currentLang]['correct'] || 'Correct') + ')' : '') : (Array.isArray(details.correct) && details.correct.includes(i) ? '(' + (translations[currentLang]['correct'] || 'Correct') + ')' : '')}</p>
      `).join('')}
      <p><strong>${translations[currentLang]['modal_lot'] || 'Lot'}:</strong> ${details.lot}</p>
      <p><strong>${translations[currentLang]['modal_type'] || 'Type'}:</strong> ${details.type}</p>
    `;
  } else if (details && typeof details === 'string') {
    formattedDetails = `<p>${details}</p>`;
  } else if (details) {
    formattedDetails = `<p>${translations[currentLang]['modal_details_unavailable'] || 'Détails non disponibles ou format non pris en charge.'}</p>`;
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

function validateAnswer(index, forceValidation = false) {
  const question = selectedQuestions[index];
  const selected = document.querySelectorAll(`input[name="option-${index}"]:checked`);
  const feedback = document.getElementById(`feedback-${index}`);
  const validateBtn = document.querySelectorAll('.validate-btn')[index];

  if (!selected.length) {
    if (!forceValidation) {
      showModal('select_answer');
      return false;
    }
    console.log(`Aucune réponse sélectionnée pour la question ${index + 1}, considérée comme incorrecte.`);
    incorrectCount++;
    feedback.textContent = translations[currentLang]['incorrect_no_selection'] || "Incorrect (aucune réponse sélectionnée)";
    feedback.className = 'feedback incorrect';
  } else {
    const answers = Array.from(selected).map(i => parseInt(i.value, 10));
    const correct = Array.isArray(question.correct) ? question.correct : [question.correct];

    const isCorrect = (
      answers.length === correct.length &&
      answers.every(ans => correct.includes(ans))
    );

    if (isCorrect) {
      score++;
      correctCount++;
      feedback.textContent = translations[currentLang]['correct'] || "Correct !";
      feedback.className = 'feedback correct';
      console.log(`Question ${index + 1} correcte, score mis à jour : ${score}`);
    } else {
      incorrectCount++;
      feedback.textContent = translations[currentLang]['incorrect'] || "Incorrect";
      feedback.className = 'feedback incorrect';
      console.log(`Question ${index + 1} incorrecte, score : ${score}`);
    }
  }

  feedback.style.display = 'inline-block';
  updateScoreCounter();
  selected.forEach(input => input.disabled = true);
  validateBtn.disabled = true;

  const allValidated = [...document.querySelectorAll('.validate-btn')].every(btn => btn.disabled);
  if (allValidated && !forceValidation) {
    clearInterval(timerInterval);
    showResult();
  }
  return true;
}

function validateAllAnswers() {
  console.log("Validation de toutes les réponses non validées...");
  let allValidated = true;
  selectedQuestions.forEach((_, index) => {
    const validateBtn = document.querySelectorAll('.validate-btn')[index];
    if (!validateBtn.disabled) {
      const validated = validateAnswer(index, true);
      if (!validated) {
        allValidated = false;
      }
    }
  });
  console.log("Validation terminée, score final :", score);
  return allValidated;
}

function saveValidatedStates() {
  validatedStates = [];
  selectedQuestions.forEach((_, index) => {
    const selected = document.querySelectorAll(`input[name="option-${index}"]:checked`);
    const validateBtn = document.querySelectorAll('.validate-btn')[index];
    const feedback = document.getElementById(`feedback-${index}`);
    validatedStates[index] = {
      selected: Array.from(selected).map(input => parseInt(input.value)),
      validated: validateBtn.disabled,
      feedbackText: feedback ? feedback.textContent : '',
      feedbackClass: feedback ? feedback.className : ''
    };
  });
  console.log("État des réponses sauvegardé :", validatedStates);
}

function restoreValidatedStates() {
  selectedQuestions.forEach((_, index) => {
    const state = validatedStates[index];
    if (state) {
      // Restaurer les réponses sélectionnées
      state.selected.forEach(value => {
        const input = document.querySelector(`input[name="option-${index}"][value="${value}"]`);
        if (input) input.checked = true;
      });
      // Restaurer l'état de validation
      const validateBtn = document.querySelectorAll('.validate-btn')[index];
      const feedback = document.getElementById(`feedback-${index}`);
      if (state.validated) {
        validateBtn.disabled = true;
        document.querySelectorAll(`input[name="option-${index}"]`).forEach(input => input.disabled = true);
      }
      if (state.feedbackText) {
        feedback.textContent = state.feedbackText;
        feedback.className = state.feedbackClass;
        feedback.style.display = 'inline-block';
      }
    }
  });
  console.log("État des réponses restauré.");
}

function showResult() {
  document.getElementById('quiz-container').style.display = 'none';
  document.getElementById('result').style.display = 'block';
  document.getElementById('score').textContent = score;
  document.getElementById('total-questions-result').textContent = selectedQuestions.length;
}

function showTab(tabId) {
  // Liste de tous les conteneurs d'onglets
  const allTabs = [
    'start-screen',
    'quiz-container',
    'edit-container',
    'scores-container',
    'result',
    'mermaid-editor-container',
    'converter-container',
    'json-validator-container',
    'cicd-course-container',
    'logic-tests-container'
  ];

  // Masquer tous les onglets
  allTabs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = 'none';
    }
  });

  // Afficher l'onglet sélectionné
  const selectedTab = document.getElementById(tabId);
  if (selectedTab) {
    selectedTab.style.display = 'block';
  } else {
    console.error(`Onglet '${tabId}' non trouvé.`);
  }

  // Mettre à jour l'état actif des onglets
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  const activeTab = document.querySelector(`.tab[onclick="showTab('${tabId}')"]`);
  if (activeTab) {
    activeTab.classList.add('active');
  }

  // Actions spécifiques à certains onglets
  if (tabId === 'edit-container') {
    if (typeof fetchQuestions === 'function') {
      fetchQuestions().then(() => loadQuestionList());
    } else {
      console.error("fetchQuestions n'est pas défini.");
    }
  }
  if (tabId === 'scores-container') {
    loadScores();
  }
  if (tabId === 'mermaid-editor-container') {
    console.log("Affichage de l'onglet Mermaid Live Editor, initialisation...");
    initializeMermaidEditor();
  }
  if (tabId === 'converter-container') {
    console.log("Affichage de l'onglet Convertisseur de Documents, initialisation...");
    initializeDocumentConverter();
  }
  if (tabId === 'json-validator-container') {
    console.log("Affichage de l'onglet Validateur JSON, initialisation...");
    initializeJsonValidator();
  }
  if (tabId === 'cicd-course-container') {
    console.log("Affichage de l'onglet Cours CI/CD, initialisation...");
    initializeCICDCourse();
  }
  if (tabId === 'logic-tests-container') {
    console.log("Affichage de l'onglet Défis Logiques et Soft Skills, initialisation...");
    // Attendre que les traductions soient chargées avant d'appeler initializeLogicTests
    if (typeof translations[currentLang] === 'undefined') {
      document.addEventListener('translationsLoaded', () => {
        if (typeof initializeLogicTests === 'function') {
          initializeLogicTests();
        } else {
          console.error("initializeLogicTests n'est pas défini même après le chargement des traductions. Vérifiez que logic-tests.js est correctement chargé.");
          showModal("Erreur : Impossible d'initialiser les Défis Logiques et Soft Skills. Veuillez vérifier que tous les scripts sont chargés.");
        }
      }, { once: true });
    } else {
      if (typeof initializeLogicTests === 'function') {
        initializeLogicTests();
      } else {
        console.error("initializeLogicTests n'est pas défini. Vérifiez que logic-tests.js est correctement chargé.");
        showModal("Erreur : Impossible d'initialiser les Défis Logiques et Soft Skills. Veuillez vérifier que tous les scripts sont chargés.");
      }
    }
  }
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
    console.log(`Questions pour ${selectedLot} :`, selectedQuestions.length, selectedQuestions);

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
    validatedStates = []; // Réinitialiser l'état des réponses

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

  selectedQuestions.forEach((q, index) => {
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

async function saveScore() {
  console.log("Début de saveScore...");
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
  console.log("Score à sauvegarder :", scoreData);

  scores.push(scoreData);
  console.log("Scores après ajout :", scores);

  try {
    localStorage.setItem('scores', JSON.stringify(scores));
    console.log("Score sauvegardé localement :", scoreData);
  } catch (e) {
    console.error("Erreur de sauvegarde dans localStorage :", e);
  }

  const token = sessionStorage.getItem('githubPAT');
  if (token) {
    console.log("Tentative de sauvegarde sur GitHub avec PAT:", scores);
    await saveScoresToGitHub(token);
    console.log("Sauvegarde sur GitHub terminée.");
  } else {
    console.log("Aucun PAT fourni, sauvegarde uniquement locale.");
  }

  clearInterval(timerInterval);
  showTab('scores-container');
  return true;
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
    saveResultButton.addEventListener('click', async () => {
      validateAllAnswers();
      await saveScore();
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
    saveCurrentScoreButton.addEventListener('click', async () => {
      console.log("Clic sur 'Sauvegarder le score actuel'");
      validateAllAnswers();
      const saved = await saveScore();
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
