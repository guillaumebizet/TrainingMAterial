let editingIndex = null;

function loadQuestionList() {
  const list = document.getElementById('question-list');
  list.innerHTML = '';
  questions.forEach((q, index) => {
    const div = document.createElement('div');
    div.className = 'question-item';
    div.innerHTML = `
      <input type="text" value="${q.question.fr}" placeholder="Question (FR)" onchange="updateQuestion(${index}, 'question', 'fr', this.value)">
      <input type="text" value="${q.question.us}" placeholder="Question (US)" onchange="updateQuestion(${index}, 'question', 'us', this.value)">
      <textarea onchange="updateQuestion(${index}, 'options', 'fr', this.value.split(','))">${q.options.fr.join(',')}</textarea>
      <textarea onchange="updateQuestion(${index}, 'options', 'us', this.value.split(','))">${q.options.us.join(',')}</textarea>
      <input type="number" value="${q.correct}" onchange="updateQuestion(${index}, 'correct', null, this.value)">
      <input type="text" value="${q.lot}" onchange="updateQuestion(${index}, 'lot', null, this.value)">
      <select onchange="updateQuestion(${index}, 'type', null, this.value)">
        <option value="Choix simple" ${q.type === 'Choix simple' ? 'selected' : ''}>Choix simple</option>
        <option value="QCM" ${q.type === 'QCM' ? 'selected' : ''}>QCM</option>
      </select>
      <div class="actions">
        <button onclick="deleteQuestion(${index})">Supprimer</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function updateQuestion(index, field, lang, value) {
  if (field === 'options' || field === 'question') {
    if (!questions[index][field]) questions[index][field] = {};
    questions[index][field][lang] = value;
  } else {
    questions[index][field] = value;
  }
}

function deleteQuestion(index) {
  questions.splice(index, 1);
  loadQuestionList();
}

function addNewQuestion() {
  questions.push({
    question: {"fr": "", "us": ""},
    options: {"fr": [""], "us": [""]},
    correct: 0,
    lot: "GENERAL",
    type: "Choix simple"
  });
  loadQuestionList();
}

function filterQuestionsByLot() {
  const filter = document.getElementById('lot-filter').value;
  const filtered = filter ? questions.filter(q => q.lot === filter) : questions;
  const list = document.getElementById('question-list');
  list.innerHTML = '';
  filtered.forEach((q, index) => {
    const div = document.createElement('div');
    div.className = 'question-item';
    div.innerHTML = `
      <input type="text" value="${q.question.fr}" placeholder="Question (FR)" onchange="updateQuestion(${index}, 'question', 'fr', this.value)">
      <input type="text" value="${q.question.us}" placeholder="Question (US)" onchange="updateQuestion(${index}, 'question', 'us', this.value)">
      <textarea onchange="updateQuestion(${index}, 'options', 'fr', this.value.split(','))">${q.options.fr.join(',')}</textarea>
      <textarea onchange="updateQuestion(${index}, 'options', 'us', this.value.split(','))">${q.options.us.join(',')}</textarea>
      <input type="number" value="${q.correct}" onchange="updateQuestion(${index}, 'correct', null, this.value)">
      <input type="text" value="${q.lot}" onchange="updateQuestion(${index}, 'lot', null, this.value)">
      <select onchange="updateQuestion(${index}, 'type', null, this.value)">
        <option value="Choix simple" ${q.type === 'Choix simple' ? 'selected' : ''}>Choix simple</option>
        <option value="QCM" ${q.type === 'QCM' ? 'selected' : ''}>QCM</option>
      </select>
      <div class="actions">
        <button onclick="deleteQuestion(${index})">Supprimer</button>
      </div>
    `;
    list.appendChild(div);
  });
}

loadQuestionList();
