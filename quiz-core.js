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
  const scoreCounter = document.getElementById('score-counter');
  if (scoreCounter) {
    scoreCounter.textContent = `Score : ${score}`;
  } else {
    console.error("Élément 'score-counter' non trouvé.");
  }
  // Suppression des éléments total-questions, correct-count, incorrect-count car ils ne sont pas utilisés dans index.html
}

function updateTimer() {
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;
  const timerElement = document.getElementById('timer');
  if (timerElement) {
    timerElement.textContent = `Temps : ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } else {
    console.error("Élément 'timer' non trouvé.");
  }
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
    saveScore();
    showResult();
  }
}
function showResult() {
  document.getElementById('quiz-container').style.display = 'none';
  document.getElementById('result').style.display = 'block';
  document.getElementById('result-container').innerHTML = `
    <p>Score final : <span id="score">${score}</span> / <span id="total-questions-result">${selectedQuestions.length}</span></p>
    <p>Temps écoulé : ${Math.floor(timeElapsed / 60)}:${String(timeElapsed % 60).padStart(2, '0')}</p>
  `;
}

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');

  if (sectionId === 'edit') {
    if (typeof fetchQuestions === 'function') {
      fetchQuestions().then(() => loadQuestionList());
    } else {
      console.error("fetchQuestions n'est pas défini. Attendez que github.js soit chargé.");
    }
  }
  if (sectionId === 'scores') loadScores();
}

function loadLotSelection() {
  const lots = [...new Set(questions.map(q => q.lot).filter(Boolean))];
  const select = document.getElementById('lot-selection');
  if (!select) {
    console.error("Élément 'lot-selection' non trouvé.");
    return;
  }
  select.innerHTML = '<option value="">Choisir un lot</option>';
  lots.forEach(lot => {
    const option = document.createElement('option');
    option.value = lot;
    option.textContent = lot;
    select.appendChild(option);
  });
}

async function startQuiz() {
  try {
    candidateName = document.getElementById('user-name').value.trim();
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

    showSection('quiz'); // Afficher la section quiz avant de mettre à jour les éléments
    updateScoreCounter();
    updateTimer();
    loadQuestions();
    startTimer();
  } catch (error) {
    console.error("Erreur dans startQuiz :", error);
    alert("Une erreur s'est produite lors du démarrage du quiz : " + error.message);
  }
}
function showResult() {
  document.getElementById('quiz-container').style.display = 'none';
  document.getElementById('result').style.display = 'block';
  document.getElementById('result-container').innerHTML = `
    <p>Score final : <span id="score">${score}</span> / <span id="total-questions-result">${selectedQuestions.length}</span></p>
    <p>Temps écoulé : ${Math.floor(timeElapsed / 60)}:${String(timeElapsed % 60).padStart(2, '0')}</p>
  `;
}

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');

  if (sectionId === 'edit') {
    if (typeof fetchQuestions === 'function') {
      fetchQuestions().then(() => loadQuestionList());
    } else {
      console.error("fetchQuestions n'est pas défini. Attendez que github.js soit chargé.");
    }
  }
  if (sectionId === 'scores') loadScores();
}

function loadLotSelection() {
  const lots = [...new Set(questions.map(q => q.lot).filter(Boolean))];
  const select = document.getElementById('lot-selection');
  if (!select) {
    console.error("Élément 'lot-selection' non trouvé.");
    return;
  }
  select.innerHTML = '<option value="">Choisir un lot</option>';
  lots.forEach(lot => {
    const option = document.createElement('option');
    option.value = lot;
    option.textContent = lot;
    select.appendChild(option);
  });
}

async function startQuiz() {
  try {
    candidateName = document.getElementById('user-name').value.trim();
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

    showSection('quiz'); // Afficher la section quiz avant de mettre à jour les éléments
    updateScoreCounter();
    updateTimer();
    loadQuestions();
    startTimer();
  } catch (error) {
    console.error("Erreur dans startQuiz :", error);
    alert("Une erreur s'est produite lors du démarrage du quiz : " + error.message);
  }
}
function loadQuestions() {
  const container = document.getElementById('quiz-container');
  container.innerHTML = '';

  if (!selectedQuestions || selectedQuestions.length === 0) {
    container.innerHTML = '<p>Aucune question à afficher pour ce lot.</p>';
    return;
  }

  const shuffledSet = selectedQuestions.map((q) => {
    const clone = JSON.parse(JSON.stringify(q)); // Remplacement de structuredClone
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
  const scoreData = {
    name: candidateName,
    lot: document.getElementById('lot-selection').value,
    score: score,
    total: selectedQuestions.length,
    date: new Date().toLocaleDateString('fr-FR'),
    time: `${Math.floor(timeElapsed / 60)}:${String(timeElapsed % 60).padStart(2, '0')}`
  };
  scores.push(scoreData);

  try {
    localStorage.setItem('scores', JSON.stringify(scores));
    console.log("Score sauvegardé localement :", scoreData);
  } catch (e) {
    console.error("Erreur de sauvegarde dans localStorage :", e);
  }

  // Sauvegarde sur GitHub via OAuth
  saveScoresToGitHub();
}

// Attacher un écouteur d'événements au bouton "Démarrer le quiz"
document.addEventListener('DOMContentLoaded', () => {
  const startQuizButton = document.getElementById('start-quiz-button');
  if (startQuizButton) {
    startQuizButton.addEventListener('click', startQuiz);
  } else {
    console.error("Bouton 'start-quiz-button' non trouvé.");
  }
});
