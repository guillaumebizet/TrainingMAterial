let editingIndex = null;

function loadQuestionList() {
  const list = document.getElementById('question-list');
  list.innerHTML = '';
  questions.forEach((q, index) => {
    const div = document.createElement('div');
    div.className = 'question-item';
    div.innerHTML = `
      <div class="question-block">
        <h3>${q.question.fr} / ${q.question.us}</h3>
        <div class="options">
          ${q.type === 'Choix simple' ? renderRadioOptions(q.options.fr, q.options.us, q.correct) : renderCheckboxOptions(q.options.fr, q.options.us, q.correct)}
        </div>
        <p>Lot: ${q.lot} | Type: ${q.type}</p>
        <div class="actions">
          <button onclick="editQuestion(${index})">Modifier</button>
          <button onclick="deleteQuestion(${index})">Supprimer</button>
        </div>
      </div>
    `;
    list.appendChild(div);
  });
}

function renderRadioOptions(optionsFr, optionsUs, correct) {
  return optionsFr.map((option, i) => `
    <label>
      <input type="radio" name="option-${i}" ${i === parseInt(correct) ? 'checked' : ''} disabled>
      ${option} / ${optionsUs[i]}
    </label><br>
  `).join('');
}

function renderCheckboxOptions(optionsFr, optionsUs, correct) {
  // Pour un QCM, `correct` pourrait être un tableau d'indices (par exemple, [0, 2] pour plusieurs réponses correctes)
  const correctIndices = Array.isArray(correct) ? correct : [correct];
  return optionsFr.map((option, i) => `
    <label>
      <input type="checkbox" ${correctIndices.includes(i) ? 'checked' : ''} disabled>
      ${option} / ${optionsUs[i]}
    </label><br>
  `).join('');
}

function editQuestion(index) {
  editingIndex = index;
  const q = questions[index];
  const form = document.createElement('div');
  form.className = 'edit-form';
  form.innerHTML = `
    <h3>Modifier la question</h3>
    <label>Question (FR)</label>
    <input type="text" id="edit-question-fr" value="${q.question.fr}">
    <label>Question (US)</label>
    <input type="text" id="edit-question-us" value="${q.question.us}">
    <label>Options (FR, séparées par des virgules)</label>
    <textarea id="edit-options-fr">${q.options.fr.join(',')}</textarea>
    <label>Options (US, séparées par des virgules)</label>
    <textarea id="edit-options-us">${q.options.us.join(',')}</textarea>
    <label>Réponse correcte (index ou indices pour QCM, séparés par des virgules)</label>
    <input type="text" id="edit-correct" value="${Array.isArray(q.correct) ? q.correct.join(',') : q.correct}">
    <label>Lot</label>
    <input type="text" id="edit-lot" value="${q.lot}">
    <label>Type</label>
    <select id="edit-type" onchange="updateCorrectFieldType(this.value)">
      <option value="Choix simple" ${q.type === 'Choix simple' ? 'selected' : ''}>Choix simple</option>
      <option value="QCM" ${q.type === 'QCM' ? 'selected' : ''}>QCM</option>
    </select>
    <button onclick="saveQuestion()">Sauvegarder</button>
    <button onclick="cancelEdit()">Annuler</button>
  `;
  document.getElementById('question-list').prepend(form);
}

function updateCorrectFieldType(type) {
  const correctInput = document.getElementById('edit-correct');
  if (type === 'QCM') {
    correctInput.placeholder = "Indices des réponses correctes (ex: 0,2)";
  } else {
    correctInput.placeholder = "Index de la réponse correcte (ex: 0)";
  }
}

function saveQuestion() {
  const q = questions[editingIndex];
  q.question.fr = document.getElementById('edit-question-fr').value;
  q.question.us = document.getElementById('edit-question-us').value;
  q.options.fr = document.getElementById('edit-options-fr').value.split(',').map(item => item.trim());
  q.options.us = document.getElementById('edit-options-us').value.split(',').map(item => item.trim());
  
  // Gérer la réponse correcte : pour QCM, on peut avoir plusieurs indices
  const correctValue = document.getElementById('edit-correct').value;
  if (q.type === 'QCM') {
    q.correct = correctValue.split(',').map(i => parseInt(i.trim()));
  } else {
    q.correct = parseInt(correctValue);
  }
  
  q.lot = document.getElementById('edit-lot').value;
  q.type = document.getElementById('edit-type').value;
  editingIndex = null;
  loadQuestionList();
}

function cancelEdit() {
  editingIndex = null;
  loadQuestionList();
}

function deleteQuestion(index) {
  questions.splice(index, 1);
  loadQuestionList();
}

function addNewQuestion() {
  questions.push({
    question: { "fr": "", "us": "" },
    options: { "fr": [""], "us": [""] },
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
      <div class="question-block">
        <h3>${q.question.fr} / ${q.question.us}</h3>
        <div class="options">
          ${q.type === 'Choix simple' ? renderRadioOptions(q.options.fr, q.options.us, q.correct) : renderCheckboxOptions(q.options.fr, q.options.us, q.correct)}
        </div>
        <p>Lot: ${q.lot} | Type: ${q.type}</p>
        <div class="actions">
          <button onclick="editQuestion(${index})">Modifier</button>
          <button onclick="deleteQuestion(${index})">Supprimer</button>
        </div>
      </div>
    `;
    list.appendChild(div);
  });
}

loadQuestionList();
