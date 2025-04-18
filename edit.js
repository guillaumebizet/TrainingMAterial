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
    <div class="form-section">
      <h4>Question</h4>
      <label>Question (FR)</label>
      <input type="text" id="edit-question-fr" value="${q.question.fr}">
      <label>Question (US)</label>
      <input type="text" id="edit-question-us" value="${q.question.us}">
    </div>
    <div class="form-section">
      <h4>Options</h4>
      <div id="edit-options-list"></div>
      <button type="button" onclick="addOptionField()">Ajouter une option</button>
      <div id="options-preview" class="options-preview"></div>
    </div>
    <div class="form-section">
      <h4>Métadonnées</h4>
      <label>Lot</label>
      <input type="text" id="edit-lot" value="${q.lot}">
      <label>Type</label>
      <select id="edit-type" onchange="updateOptionsPreview()">
        <option value="Choix simple" ${q.type === 'Choix simple' ? 'selected' : ''}>Choix simple</option>
        <option value="QCM" ${q.type === 'QCM' ? 'selected' : ''}>QCM</option>
      </select>
    </div>
    <div class="form-actions">
      <button type="button" onclick="showPreviewModal()">Aperçu</button>
      <button onclick="saveQuestion()">Sauvegarder</button>
      <button onclick="cancelEdit()">Annuler</button>
    </div>
  `;
  document.getElementById('question-list').prepend(form);
  populateOptionsFields(q.options.fr, q.options.us);
  updateOptionsPreview();
}

function populateOptionsFields(optionsFr, optionsUs) {
  const optionsList = document.getElementById('edit-options-list');
  optionsList.innerHTML = '';
  optionsFr.forEach((optionFr, i) => {
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option-field';
    optionDiv.innerHTML = `
      <input type="text" class="option-fr" value="${optionFr}" placeholder="Option (FR)">
      <input type="text" class="option-us" value="${optionsUs[i]}" placeholder="Option (US)">
      <button type="button" onclick="removeOptionField(this)">Supprimer</button>
    `;
    optionsList.appendChild(optionDiv);
  });
}

function addOptionField() {
  const optionsList = document.getElementById('edit-options-list');
  const optionDiv = document.createElement('div');
  optionDiv.className = 'option-field';
  optionDiv.innerHTML = `
    <input type="text" class="option-fr" placeholder="Option (FR)">
    <input type="text" class="option-us" placeholder="Option (US)">
    <button type="button" onclick="removeOptionField(this)">Supprimer</button>
  `;
  optionsList.appendChild(optionDiv);
  updateOptionsPreview();
}

function removeOptionField(button) {
  button.parentElement.remove();
  updateOptionsPreview();
}

function updateOptionsPreview() {
  const optionsFr = Array.from(document.getElementsByClassName('option-fr')).map(input => input.value || '');
  const optionsUs = Array.from(document.getElementsByClassName('option-us')).map(input => input.value || '');
  const type = document.getElementById('edit-type').value;
  const preview = document.getElementById('options-preview');
  preview.innerHTML = type === 'Choix simple' ? renderRadioOptionsPreview(optionsFr, optionsUs) : renderCheckboxOptionsPreview(optionsFr, optionsUs);
}

function renderRadioOptionsPreview(optionsFr, optionsUs) {
  const currentCorrect = questions[editingIndex].correct;
  return optionsFr.map((option, i) => `
    <label>
      <input type="radio" name="preview-option" value="${i}" ${i === parseInt(currentCorrect) ? 'checked' : ''} onchange="updateCorrect(this)">
      ${option} / ${optionsUs[i]}
    </label><br>
  `).join('');
}

function renderCheckboxOptionsPreview(optionsFr, optionsUs) {
  const currentCorrect = Array.isArray(questions[editingIndex].correct) ? questions[editingIndex].correct : [questions[editingIndex].correct];
  return optionsFr.map((option, i) => `
    <label>
      <input type="checkbox" value="${i}" ${currentCorrect.includes(i) ? 'checked' : ''} onchange="updateCorrect(this)">
      ${option} / ${optionsUs[i]}
    </label><br>
  `).join('');
}

function updateCorrect(input) {
  const type = document.getElementById('edit-type').value;
  if (type === 'Choix simple') {
    questions[editingIndex].correct = parseInt(input.value);
  } else {
    const checkboxes = document.querySelectorAll('#options-preview input[type="checkbox"]:checked');
    questions[editingIndex].correct = Array.from(checkboxes).map(checkbox => parseInt(checkbox.value));
  }
}

function showPreviewModal() {
  const questionFr = document.getElementById('edit-question-fr').value;
  const questionUs = document.getElementById('edit-question-us').value;
  const optionsFr = Array.from(document.getElementsByClassName('option-fr')).map(input => input.value || '');
  const optionsUs = Array.from(document.getElementsByClassName('option-us')).map(input => input.value || '');
  const lot = document.getElementById('edit-lot').value;
  const type = document.getElementById('edit-type').value;
  const correct = questions[editingIndex].correct;

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span id="modal-message">
        <h3>Aperçu de la question</h3>
        <p><strong>Question (FR):</strong> ${questionFr}</p>
        <p><strong>Question (US):</strong> ${questionUs}</p>
        <h4>Options:</h4>
        ${optionsFr.map((option, i) => `
          <p>${i + 1}. ${option} / ${optionsUs[i]} ${type === 'Choix simple' ? (i === parseInt(correct) ? '(Correct)' : '') : (Array.isArray(correct) && correct.includes(i) ? '(Correct)' : '')}</p>
        `).join('')}
        <p><strong>Lot:</strong> ${lot}</p>
        <p><strong>Type:</strong> ${type}</p>
      </span>
      <button id="modal-close-btn" onclick="this.parentElement.parentElement.remove()">Fermer</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function showNotification(message, details = null) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <p>${message}</p>
    ${details ? `
      <div class="notification-details">
        <p><strong>Question (FR):</strong> ${details.question.fr}</p>
        <p><strong>Question (US):</strong> ${details.question.us}</p>
        <h4>Options:</h4>
        ${details.options.fr.map((option, i) => `
          <p>${i + 1}. ${option} / ${details.options.us[i]} ${details.type === 'Choix simple' ? (i === parseInt(details.correct) ? '(Correct)' : '') : (Array.isArray(details.correct) && details.correct.includes(i) ? '(Correct)' : '')}</p>
        `).join('')}
        <p><strong>Lot:</strong> ${details.lot}</p>
        <p><strong>Type:</strong> ${details.type}</p>
      </div>
    ` : ''}
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 5000); // Supprime la notification après 5 secondes
}

function saveQuestion() {
  const q = questions[editingIndex];
  q.question.fr = document.getElementById('edit-question-fr').value;
  q.question.us = document.getElementById('edit-question-us').value;
  q.options.fr = Array.from(document.getElementsByClassName('option-fr')).map(input => input.value || '');
  q.options.us = Array.from(document.getElementsByClassName('option-us')).map(input => input.value || '');
  q.lot = document.getElementById('edit-lot').value;
  q.type = document.getElementById('edit-type').value;

  // Afficher une notification avec les détails de la question modifiée
  showNotification("Modifications sauvegardées avec succès !", q);

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
