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
    alert('Veuillez sélectionner une réponse');
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
      alert('Veuillez entrer votre nom');
      return;
    }

    const selectedLot = document.getElementById('lot-selection').value;
    if (!selectedLot) {
      alert('Veuillez sélectionner un lot de questions');
      return;
    }

    if (typeof fetchQuestions !== 'function') {
      alert("Les questions ne sont pas encore chargées. Veuillez réessayer dans un instant.");
      return;
    }

    await fetchQuestions();

    if (!questions || questions.length === 0) {
      alert('Aucune question chargée. Vérifiez le chargement initial.');
      return;
    }

    selectedQuestions = questions.filter(q =>
      q.lot && q.lot.trim().toUpperCase() === selectedLot.trim().toUpperCase()
    );

    if (selectedQuestions.length === 0) {
      alert('Aucune question disponible pour ce lot');
      return;
    }

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
    alert("Une erreur s'est produite lors du démarrage du quiz : " + error.message);
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
    container.innerHTML = '<p>Aucune question à afficher pour ce lot.</p>';
    return;
  }

  const shuffledSet = selectedQuestions.map((q) => {
    const clone = structuredClone(q);
    const shuffled = shuffle([...clone.options]);

    if (Array.isArray(clone.correct)) {
      clone.correct = clone.correct.map(c => shuffled.indexOf(clone.options[c]));
    } else {
      clone.correct = shuffled.indexOf(clone.options[clone.correct]);
    }

    clone.options = shuffled;
    return clone;
  });

  selectedQuestions = shuffledSet;

  shuffledSet.forEach((q, index) => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    questionDiv.innerHTML = `
      <h3>Question ${index + 1} : ${q.question}</h3>
      <div class="options" id="options-${index}"></div>
      <div class="question-actions">
        <button class="validate-btn" onclick="validateAnswer(${index})">Valider</button>
        <span class="feedback" id="feedback-${index}"></span>
      </div>
    `;
    container.appendChild(questionDiv);

    const optionsDiv = document.getElementById(`options-${index}`);
    q.options.forEach((option, i) => {
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
  const lotSelect = document.getElementById('lot-selection');
  const selectedLot = lotSelect && lotSelect.value ? lotSelect.value : "Non spécifié"; // Vérifie que l’élément existe et a une valeur
  const scoreData = {
    name: candidateName,
    date: new Date().toLocaleDateString('fr-FR'),
    score: `${score} / ${selectedQuestions.length}`,
    time: `${Math.floor(timeElapsed / 60)}:${String(timeElapsed % 60).padStart(2, '0')}`,
    lot: selectedLot
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
    return true;
  } else {
    console.log("Aucun PAT fourni, sauvegarde uniquement locale.");
    return false;
  }
}

// Initialisation et événements
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM chargé, attachement des événements...");

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
        patFeedback.textContent = 'PAT validé avec succès !';
        patFeedback.style.display = 'block';
        patInput.style.display = 'none';
        validatePatButton.style.display = 'none';
        patStatus.style.display = 'inline';
        patInput.value = '';
        setTimeout(() => patFeedback.style.display = 'none', 3000);
        console.log("PAT validé et interface mise à jour.");
      } else {
        alert('Veuillez entrer un PAT valide.');
      }
    });
    console.log("Événement attaché au bouton 'validate-pat-btn'");
  } else {
    console.error("Bouton 'validate-pat-btn' non trouvé.");
  }

  const saveResultButton = document.getElementById('save-result-btn');
  if (saveResultButton) {
    saveResultButton.addEventListener('click', () => {
      saveScore();
      const feedback = document.getElementById('save-result-feedback');
      feedback.textContent = 'Résultats sauvegardés avec succès !';
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
        feedback.textContent = saved ? 'Score actuel sauvegardé avec succès !' : 'Score sauvegardé localement (aucun PAT fourni).';
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
