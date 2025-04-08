body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f0f2f5;
  margin: 0;
  padding: 20px;
}

#quiz-container, #scores-container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 30px;
  display: none;
}

#edit-container {
  margin: 0 auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 30px;
  display: none;
  overflow-x: auto; /* Permettre le défilement horizontal si nécessaire */
}

#quiz-container {
  position: relative;
}

#header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#score-counter {
  padding: 15px;
  background-color: #3498db;
  color: white;
  border-radius: 10px;
  font-size: 1.2em;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

#timer {
  padding: 10px;
  background-color: #e74c3c;
  color: white;
  border-radius: 5px;
  font-size: 1em;
}

#save-current-score-btn {
  background-color: #2ecc71;
  color: white;
  margin: 10px 0;
}

#save-current-score-btn:hover {
  background-color: #27ae60;
}

#save-current-feedback {
  margin: 10px 0;
}

.question {
  border-bottom: 1px solid #eee;
  padding: 20px 0;
}

.question:last-child {
  border-bottom: none;
}

.question h3 {
  color: #2c3e50;
  margin: 0 0 15px 0;
  font-size: 1.2em;
}

.options {
  margin-left: 20px;
}

.option {
  margin: 10px 0;
  display: flex;
  align-items: center;
}

.option input {
  margin-right: 10px;
}

.option label {
  color: #34495e;
  font-size: 1em;
}

.question-actions {
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
}

button {
  padding: 8px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s;
  opacity: 1; /* Assurer que les boutons ne sont pas grisés par défaut */
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.validate-btn {
  background-color: #3498db;
  color: white;
}

.validate-btn:hover:not(:disabled) {
  background-color: #2980b9;
}

.validate-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.feedback {
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 3px;
  display: none;
}

.feedback.correct {
  color: #27ae60;
  background-color: #e8f5e9;
  display: inline-block;
}

.feedback.incorrect {
  color: #c0392b;
  background-color: #ffebee;
  display: inline-block;
}

#result {
  text-align: center;
  margin-top: 30px;
  padding: 20px;
  background-color: #ecf0f1;
  border-radius: 10px;
}

#result h2 {
  color: #2c3e50;
  margin: 0;
}

#start-screen {
  text-align: center;
  padding: 20px;
}

#tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tab {
  padding: 10px 20px;
  background-color: #ecf0f1;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.tab:hover {
  background-color: #dfe6e9;
}

.tab.active {
  background-color: #3498db;
  color: white;
}

#question-selection {
  margin-bottom: 20px;
}

#question-selection select {
  width: 100%;
  padding: 10px;
  margin: 8px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s;
}

#question-selection select:focus {
  border-color: #3498db;
  outline: none;
}

#question-selection button {
  margin-top: 10px;
  background-color: #2ecc71;
  color: white;
}

#question-selection button:hover {
  background-color: #27ae60;
}

#pat-section {
  margin: 20px 0;
  text-align: center;
}

#pat-section label {
  display: block;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

#github-pat {
  width: 300px;
  padding: 10px;
  margin: 8px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

#validate-pat-btn {
  background-color: #3498db;
  color: white;
  margin-left: 10px;
}

#validate-pat-btn:hover {
  background-color: #2980b9;
}

#pat-status {
  font-weight: bold;
  vertical-align: middle;
}

#pat-feedback {
  margin-top: 10px;
}

#save-questions-btn {
  position: sticky;
  top: 10px;
  z-index: 10;
  background-color: #2ecc71;
  color: white;
}

#save-questions-btn:hover {
  background-color: #27ae60;
}

#edit-filter {
  margin: 20px 0;
}

#edit-filter label {
  font-weight: bold;
  color: #2c3e50;
  margin-right: 10px;
}

#lot-filter {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

#scores-table {
  width: 100%;
  border-collapse: collapse;
}

#scores-table th, #scores-table td {
  padding: 10px;
  border: 1px solid #ccc;
  text-align: left;
}

#scores-table th {
  background-color: #3498db;
  color: white;
}

#scores-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

/* Modale */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-align: left;
  max-width: 500px;
  width: 90%;
}

#modal-message {
  display: block;
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 1.2em;
}

#modal-message h3 {
  margin: 0 0 15px;
  font-size: 1.3em;
  color: #3498db;
}

#modal-message p {
  margin: 5px 0;
}

#modal-message strong {
  color: #2c3e50;
}

#modal-close-btn {
  background-color: #3498db;
  color: white;
  padding: 10px 20px;
  display: block;
  margin: 0 auto;
}

#modal-close-btn:hover {
  background-color: #2980b9;
}

/* Bandeau de notification */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4CAF50;
  color: white;
  padding: 10px;
  border-radius: 4px;
  z-index: 1000;
}

.notification p {
  margin: 0 0 10px;
}

.notification-details {
  background: #f0f2f5;
  padding: 10px;
  border-radius: 5px;
  text-align: left;
  font-size: 0.9em;
  color: #2c3e50;
}

.notification-details p {
  margin: 5px 0;
}

.notification-details h4 {
  margin: 10px 0 5px;
  font-size: 1em;
  color: #3498db;
}

.notification-details strong {
  color: #2c3e50;
}

@keyframes slideDown {
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
}

/* Ajustements pour PAT */
#reset-pat-btn {
  background-color: #e74c3c;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

#reset-pat-btn:hover {
  background-color: #c0392b;
}

/* Styles pour les blocs de questions et l’édition */
.question-item {
  margin: 20px 0;
}

.question-block {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  animation: fadeIn 0.3s ease-in;
}

.question-block:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.question-block h3 {
  margin: 0 0 15px;
  font-size: 1.2em;
  color: #2c3e50;
}

.options {
  margin: 10px 0;
}

.options label {
  display: block;
  margin: 5px 0;
  color: #34495e;
  font-size: 1em;
}

.options input[type="radio"],
.options input[type="checkbox"] {
  margin-right: 10px;
  accent-color: #3498db;
}

.actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.actions button:first-child {
  background-color: #3498db; /* Bouton "Modifier" */
  color: white;
}

.actions button:first-child:hover {
  background-color: #2980b9;
}

.actions button:last-child {
  background-color: #e74c3c; /* Bouton "Supprimer" */
  color: white;
}

.actions button:last-child:hover {
  background-color: #c0392b;
}

/* Styles pour le formulaire d’édition */
.edit-form {
  border: 2px solid #3498db;
  padding: 20px;
  border-radius: 8px;
  background-color: #fff;
  margin-bottom: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-in;
  width: 100%; /* Prendre 100% de la largeur du conteneur parent */
  box-sizing: border-box;
  overflow-x: auto; /* Permettre le défilement horizontal si nécessaire */
}

.edit-form h3 {
  margin: 0 0 20px;
  font-size: 1.5em;
  color: #2c3e50;
  text-align: center;
}

.form-section {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  background-color: #fafafa;
  min-width: 100%; /* S'assurer que le contenu ne déborde pas */
  box-sizing: border-box;
}

.form-section h4 {
  margin: 0 0 15px;
  font-size: 1.2em;
  color: #3498db;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 5px;
}

.form-section label {
  display: block;
  margin: 10px 0 5px;
  font-weight: bold;
  color: #2c3e50;
}

.form-section input,
.form-section textarea,
.form-section select {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-section input:focus,
.form-section textarea:focus,
.form-section select:focus {
  border-color: #3498db;
  outline: none;
}

.form-section textarea {
  height: 80px;
  resize: vertical;
}

.option-field {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
  flex-wrap: wrap; /* Permettre le retour à la ligne si nécessaire */
}

.option-field input {
  flex: 1;
  min-width: 200px; /* S'assurer que les champs ne deviennent pas trop petits */
}

.option-field button {
  background-color: #e74c3c;
  color: white;
  padding: 8px 12px;
}

.option-field button:hover {
  background-color: #c0392b;
}

.options-preview {
  margin-top: 15px;
  padding: 10px;
  border: 1px dashed #ccc;
  border-radius: 5px;
  background-color: #f0f2f5;
}

.options-preview label {
  display: block;
  margin: 5px 0;
}

.options-preview input[type="radio"],
.options-preview input[type="checkbox"] {
  margin-right: 10px;
  accent-color: #3498db;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap; /* Permettre le retour à la ligne si nécessaire */
}

.form-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.form-actions button:nth-child(1) {
  background-color: #3498db; /* Bouton "Aperçu" */
  color: white;
}

.form-actions button:nth-child(1):hover {
  background-color: #2980b9;
}

.form-actions button:nth-child(2) {
  background-color: #2ecc71; /* Bouton "Sauvegarder" */
  color: white;
}

.form-actions button:nth-child(2):hover {
  background-color: #27ae60;
}

.form-actions button:last-of-type {
  background-color: #e74c3c; /* Bouton "Annuler" */
  color: white;
}

.form-actions button:last-of-type:hover {
  background-color: #c0392b;
}

.edit-content {
  display: flex;
  gap: 20px;
}

.question-list-container {
  flex: 1;
}

.sidebar {
  width: 300px;
  background-color: #f9f9f9;
  border-left: 1px solid #ddd;
  padding: 15px;
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.sidebar h3 {
  margin-top: 0;
  font-size: 1.2em;
  color: #333;
}

#pending-changes-list {
  list-style: none;
  padding: 0;
  margin: 0 0 15px 0;
}

.pending-change-item {
  padding: 8px;
  margin-bottom: 5px;
  border-radius: 4px;
  font-size: 0.9em;
}

.pending-change-item.modified {
  background-color: #e7f3fe;
  border-left: 3px solid #2196F3;
}

.pending-change-item.deleted {
  background-color: #ffebee;
  border-left: 3px solid #f44336;
}

#commit-all-changes-btn {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

#commit-all-changes-btn:hover {
  background-color: #45a049;
}

/* Mermaid Live Editor */
.mermaid-editor {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

#mermaid-input {
  width: 50%;
  height: 300px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  resize: vertical;
}

#mermaid-output {
  width: 50%;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  background-color: #f9f9f9;
  overflow: auto;
}

/* Styles pour le cheat sheet (général pour toutes les sections) */
.cheat-sheet {
  font-family: Arial, sans-serif;
  line-height: 1.5;
}

.cheat-sheet h3 {
  margin-top: 0;
}

.cheat-sheet pre {
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.cheat-sheet button.insert-example {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 5px 10px;
  margin: 5px 0;
  cursor: pointer;
  border-radius: 3px;
}

.cheat-sheet button.insert-example:hover {
  background-color: #45a049;
}

/* Style pour les boutons Afficher/Masquer (général pour toutes les sections) */
.cheat-sheet-toggle {
  background-color: #008CBA;
  color: white;
  border: none;
  padding: 8px 16px;
  margin: 10px 0;
  cursor: pointer;
  border-radius: 3px;
  opacity: 1;
}

.cheat-sheet-toggle:hover {
  background-color: #007bb5;
}

.cheat-sheet-toggle:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Spécifique à Mermaid Live Editor */
#mermaid-cheat-sheet {
  font-family: Arial, sans-serif;
  line-height: 1.5;
}

#mermaid-cheat-sheet-toggle {
  background-color: #008CBA;
  color: white;
  border: none;
  padding: 8px 16px;
  margin: 10px 0;
  cursor: pointer;
  border-radius: 3px;
  opacity: 1;
}

#mermaid-cheat-sheet-toggle:hover {
  background-color: #007bb5;
}

#mermaid-cheat-sheet-toggle:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Convertisseur de Documents */
.converter {
  margin-top: 20px;
}

#file-input {
  margin-bottom: 10px;
}

#free-text-input {
  width: 100%;
  height: 150px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
  resize: vertical;
}

.conversion-options {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
}

#convert-from, #convert-to {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

#convert-button {
  background-color: #3498db;
  color: white;
}

#convert-button:hover {
  background-color: #2980b9;
}

#convert-output {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
  max-height: 300px;
  overflow-y: auto;
}

#convert-output pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Spécifique au Convertisseur de Documents */
#converter-cheat-sheet {
  font-family: Arial, sans-serif;
  line-height: 1.5;
}

#converter-cheat-sheet-toggle {
  background-color: #008CBA;
  color: white;
  border: none;
  padding: 8px 16px;
  margin: 10px 0;
  cursor: pointer;
  border-radius: 3px;
  opacity: 1;
}

#converter-cheat-sheet-toggle:hover {
  background-color: #007bb5;
}

#converter-cheat-sheet-toggle:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Validateur JSON */
.json-validator {
  margin-top: 20px;
}

#json-input {
  width: 100%;
  height: 200px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
  resize: vertical;
}

#validate-json-button {
  background-color: #3498db;
  color: white;
}

#validate-json-button:hover {
  background-color: #2980b9;
}

#json-output {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}

#json-output pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Spécifique au Validateur JSON */
#json-validator-cheat-sheet {
  font-family: Arial, sans-serif;
  line-height: 1.5;
}

#json-validator-cheat-sheet-toggle {
  background-color: #008CBA;
  color: white;
  border: none;
  padding: 8px 16px;
  margin: 10px 0;
  cursor: pointer;
  border-radius: 3px;
  opacity: 1;
}

#json-validator-cheat-sheet-toggle:hover {
  background-color: #007bb5;
}

#json-validator-cheat-sheet-toggle:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Cours CI/CD avec style MkDocs */
.mkdocs-style {
  margin-top: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  font-family: 'Roboto', sans-serif;
}

.mkdocs-style h1 {
  color: #1976d2;
  border-bottom: 2px solid #1976d2;
  padding-bottom: 5px;
}

.mkdocs-style h2 {
  color: #424242;
  margin-top: 20px;
}

.mkdocs-style p {
  line-height: 1.6;
  color: #333;
}

.mkdocs-style ul, .mkdocs-style ol {
  margin: 10px 0;
  padding-left: 20px;
}

.mkdocs-style li {
  margin-bottom: 5px;
}

.mkdocs-style code {
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Source Code Pro', monospace;
}

.mkdocs-style pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
