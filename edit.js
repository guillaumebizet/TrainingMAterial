async function loadQuestionList() {
  // Charger les questions une seule fois si elles ne sont pas déjà chargées
  if (!questions || questions.length === 0) {
    await fetchQuestions();
  }

  const container = document.getElementById('question-list');
  if (!container) return;
  container.innerHTML = '';

  questions.forEach((q, index) => {
    const div = document.createElement('div');
    div.className = 'question-item';
    div.innerHTML = `
      <h3>Question ${index + 1}</h3>
      <label>Question :</label>
      <input type="text" value="${q.question}" onchange="updateQuestion(${index}, 'question', this.value)">
      <label>Options :</label>
      <div id="options-list-${index}"></div>
      <label>Lot :</label>
      <input type="text" value="${q.lot || ''}" onchange="updateQuestion(${index}, 'lot', this.value)">
      <label>Type :</label>
      <select id="type-select-${index}" onchange="updateQuestionType(${index}, this.value)">
        <option value="Choix simple" ${q.type === 'Choix simple' ? 'selected' : ''}>Choix simple</option>
        <option value="QCM" ${q.type === 'QCM' ? 'selected' : ''}>QCM</option>
      </select>
      <div class="actions">
        <button onclick="deleteQuestion(${index})">Supprimer</button>
        <button onclick="addOption(${index})">Ajouter une option</button>
      </div>
    `;
    container.appendChild(div);

    updateOptionsDisplay(index);
  });
}

function updateOptionsDisplay(index) {
  const q = questions[index];
  const optionsList = document.getElementById(`options-list-${index}`);
  if (!optionsList) return;
  optionsList.innerHTML = '';

  q.options.forEach((opt, optIdx) => {
    const isCorrect = q.type === 'QCM' ? (Array.isArray(q.correct) && q.correct.includes(optIdx)) : (q.correct === optIdx);
    optionsList.insertAdjacentHTML('beforeend', `
      <div class="option">
        <input type="text" value="${opt}" onchange="updateOption(${index}, ${optIdx}, this.value)">
        <input type="${q.type === 'QCM' ? 'checkbox' : 'radio'}" name="correct-${index}" value="${optIdx}" ${isCorrect ? 'checked' : ''} onchange="updateCorrect(${index}, this)">
        <button onclick="deleteOption(${index}, ${optIdx})">Supprimer</button>
      </div>
    `);
  });
}

function updateQuestionType(index, value) {
  const q = questions[index];
  const previousType = q.type;
  q.type = value;

  if (previousType === 'QCM' && value === 'Choix simple') {
    q.correct = Array.isArray(q.correct) && q.correct.length > 0 ? q.correct[0] : 0;
  } else if (previousType === 'Choix simple' && value === 'QCM') {
    q.correct = typeof q.correct === 'number' ? [q.correct] : [];
  }

  updateQuestion(index, 'type', value);
  updateOptionsDisplay(index);
}

function addOption(index) {
  questions[index].options.push("Nouvelle option");
  updateOptionsDisplay(index);
}

function deleteOption(index, optIndex) {
  questions[index].options.splice(optIndex, 1);
  const q = questions[index];
  if (q.type === 'QCM') {
    q.correct = q.correct.filter(idx => idx !== optIndex).map(idx => idx > optIndex ? idx - 1 : idx);
  } else if (q.correct === optIndex) {
    q.correct = 0;
  } else if (q.correct > optIndex) {
    q.correct -= 1;
  }
  updateOptionsDisplay(index);
}

function updateOption(index, optIndex, value) {
  questions[index].options[optIndex] = value;
}

function updateCorrect(index, input) {
  if (questions[index].type === 'QCM') {
    const correctInputs = document.querySelectorAll(`input[name="correct-${index}"]:checked`);
    questions[index].correct = Array.from(correctInputs).map(inp => parseInt(inp.value));
  } else {
    questions[index].correct = parseInt(input.value);
  }
}

function updateQuestion(index, field, value) {
  if (field === 'options') {
    questions[index][field] = value.split('\n').filter(opt => opt.trim());
  } else if (field === 'correct') {
    if (questions[index].type === 'QCM') {
      questions[index][field] = value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
    } else {
      questions[index][field] = parseInt(value);
    }
  } else {
    questions[index][field] = value;
  }
}

function addNewQuestion() {
  questions.push({
    question: "Nouvelle question",
    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
    correct: 0,
    lot: "GENERAL",
    type: "Choix simple"
  });
  loadQuestionList();
}

function deleteQuestion(index) {
  questions.splice(index, 1);
  loadQuestionList();
}
