// tools.js

// Mermaid Live Editor
function initializeMermaidEditor() {
  console.log("Initialisation de Mermaid Live Editor...");
  const mermaidInput = document.getElementById('mermaid-input');
  const mermaidOutput = document.getElementById('mermaid-output');
  const cheatSheetToggle = document.getElementById('mermaid-cheat-sheet-toggle');
  const cheatSheet = document.getElementById('mermaid-cheat-sheet');

  if (!mermaidInput || !mermaidOutput) {
    console.error("Éléments pour Mermaid Live Editor non trouvés.");
    return;
  }

  if (!cheatSheetToggle || !cheatSheet) {
    console.error("Éléments pour le cheat sheet Mermaid non trouvés.");
    return;
  }

  // Charger la bibliothèque Mermaid
  if (typeof mermaid === 'undefined') {
    console.log("Mermaid n'est pas défini, chargement de la bibliothèque...");
    const script = document.createElement('script');
    script.src = 'lib/mermaid.min.js';
    console.log("Chargement du script Mermaid depuis :", script.src);
    script.onload = () => {
      console.log("Mermaid chargé avec succès.");
      mermaid.initialize({ startOnLoad: false, theme: 'default' });
      renderMermaid();
      // Attacher l'événement après le chargement
      mermaidInput.addEventListener('input', renderMermaid);
    };
    script.onerror = () => {
      console.error("Erreur lors du chargement de Mermaid.");
      mermaidOutput.innerHTML = `<p style="color: red;">${translations[currentLang]['mermaid_load_error'] || 'Erreur : Impossible de charger Mermaid.'}</p>`;
    };
    document.head.appendChild(script);
  } else {
    console.log("Mermaid est déjà défini, rendu initial...");
    renderMermaid();
    mermaidInput.addEventListener('input', renderMermaid);
  }

  // Gestion du bouton Afficher/Masquer le cheat sheet
  cheatSheetToggle.addEventListener('click', () => {
    if (cheatSheet.style.display === 'none') {
      cheatSheet.style.display = 'block';
      cheatSheetToggle.textContent = translations[currentLang]['mermaid_cheat_sheet_hide'] || 'Masquer l’aide';
    } else {
      cheatSheet.style.display = 'none';
      cheatSheetToggle.textContent = translations[currentLang]['mermaid_cheat_sheet_show'] || 'Afficher l’aide';
    }
  });

  // Gestion des boutons d'insertion d'exemples
  const insertButtons = document.querySelectorAll('.insert-example');
  insertButtons.forEach(button => {
    button.addEventListener('click', () => {
      const exampleKey = button.getAttribute('data-example');
      const exampleCode = translations[currentLang][exampleKey] || '';
      mermaidInput.value = exampleCode;
      renderMermaid();
    });
  });

  function renderMermaid() {
    console.log("Rendu Mermaid appelé...");
    const code = mermaidInput.value;
    if (!code.trim()) {
      console.log("Code Mermaid vide.");
      mermaidOutput.innerHTML = `<p style="color: gray;">${translations[currentLang]['mermaid_empty'] || 'Entrez du code Mermaid pour voir le rendu.'}</p>`;
      return;
    }

    mermaidOutput.innerHTML = `<p>${translations[currentLang]['loading'] || 'Chargement...'}</p>`;
    try {
      console.log("Tentative de rendu Mermaid avec le code :", code);
      // Utiliser un ID unique pour éviter les conflits
      const uniqueId = `mermaid-diagram-${Date.now()}`;
      mermaid.render(uniqueId, code).then(result => {
        console.log("Rendu Mermaid réussi :", result);
        mermaidOutput.innerHTML = result.svg;
      }).catch(error => {
        console.error("Erreur lors du rendu Mermaid :", error);
        mermaidOutput.innerHTML = `<p style="color: red;">${translations[currentLang]['mermaid_render_error'] || 'Erreur de rendu Mermaid'} : ${error.message}</p>`;
      });
    } catch (error) {
      console.error("Erreur lors du rendu Mermaid (exception générale) :", error);
      mermaidOutput.innerHTML = `<p style="color: red;">${translations[currentLang]['mermaid_render_error'] || 'Erreur de rendu Mermaid'} : ${error.message}</p>`;
    }
  }
}

// Pandoc-like Document Conversion
function initializeDocumentConverter() {
  console.log("Initialisation du Convertisseur de Documents...");
  const fileInput = document.getElementById('file-input');
  const convertFrom = document.getElementById('convert-from');
  const convertTo = document.getElementById('convert-to');
  const convertButton = document.getElementById('convert-button');
  const convertOutput = document.getElementById('convert-output');
  const freeTextInput = document.getElementById('free-text-input');

  if (!fileInput || !convertFrom || !convertTo || !convertButton || !convertOutput || !freeTextInput) {
    console.error("Éléments pour le convertisseur de documents non trouvés.");
    return;
  }

  // Charger les bibliothèques nécessaires
  loadScript('lib/mammoth.browser.min.js', () => {
    loadScript('lib/showdown.min.js', () => {
      loadScript('lib/pdf.min.js', () => {
        console.log("Bibliothèques de conversion chargées.");
        // Définir le worker pour pdf.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.min.js';
        // Attacher l'événement après le chargement des bibliothèques
        attachConvertEvent();
      }, () => {
        console.error("Erreur lors du chargement de pdf.js.");
        convertOutput.innerHTML = `<p style="color: red;">${translations[currentLang]['pdfjs_load_error'] || 'Erreur : Impossible de charger pdf.js.'}</p>`;
      });
    }, () => {
      console.error("Erreur lors du chargement de Showdown.");
      convertOutput.innerHTML = `<p style="color: red;">${translations[currentLang]['showdown_load_error'] || 'Erreur : Impossible de charger Showdown.'}</p>`;
    });
  }, () => {
    console.error("Erreur lors du chargement de Mammoth.");
    convertOutput.innerHTML = `<p style="color: red;">${translations[currentLang]['mammoth_load_error'] || 'Erreur : Impossible de charger Mammoth.'}</p>`;
  });

  function attachConvertEvent() {
    convertButton.addEventListener('click', async () => {
      const fromFormat = convertFrom.value;
      const toFormat = convertTo.value;
      let content = freeTextInput.value.trim();

      // Si un fichier est sélectionné, lire son contenu
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        try {
          if (fromFormat === 'docx') {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            content = result.value;
          } else if (fromFormat === 'pdf') {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let text = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              text += textContent.items.map(item => item.str).join(' ') + '\n';
            }
            content = text;
          } else if (fromFormat === 'markdown') {
            content = await file.text();
          }
        } catch (error) {
          convertOutput.innerHTML = `<p style="color: red;">${translations[currentLang]['file_read_error'] || 'Erreur lors de la lecture du fichier'} : ${error.message}</p>`;
          return;
        }
      }

      if (!content) {
        convertOutput.innerHTML = `<p style="color: red;">${translations[currentLang]['converter_empty'] || 'Veuillez fournir un fichier ou du texte à convertir.'}</p>`;
        return;
      }

      // Conversion
      try {
        let output;
        if (toFormat === 'html') {
          if (fromFormat === 'markdown') {
            const converter = new showdown.Converter();
            output = converter.makeHtml(content);
          } else {
            output = content; // Déjà en HTML si docx, ou texte brut si pdf
          }
        } else if (toFormat === 'markdown') {
          if (fromFormat === 'docx' || fromFormat === 'pdf') {
            const converter = new showdown.Converter();
            output = converter.makeMarkdown(content);
          } else {
            output = content;
          }
        } else if (toFormat === 'text') {
          output = content.replace(/<[^>]+>/g, ''); // Supprimer les balises HTML
        }

        convertOutput.innerHTML = `<pre>${output}</pre>`;
        // Ajouter un bouton pour télécharger le résultat
        const downloadButton = document.createElement('button');
        downloadButton.textContent = translations[currentLang]['download_result'] || 'Télécharger le résultat';
        downloadButton.onclick = () => {
          const blob = new Blob([output], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `converted.${toFormat === 'html' ? 'html' : toFormat === 'markdown' ? 'md' : 'txt'}`;
          a.click();
          URL.revokeObjectURL(url);
        };
        convertOutput.appendChild(downloadButton);
      } catch (error) {
        convertOutput.innerHTML = `<p style="color: red;">${translations[currentLang]['converter_error'] || 'Erreur lors de la conversion'} : ${error.message}</p>`;
      }
    });
  }
}

// Validateur JSON
function initializeJsonValidator() {
  console.log("Initialisation du Validateur JSON...");
  const jsonInput = document.getElementById('json-input');
  const validateButton = document.getElementById('validate-json-button');
  const jsonOutput = document.getElementById('json-output');

  if (!jsonInput || !validateButton || !jsonOutput) {
    console.error("Éléments pour le validateur JSON non trouvés.");
    return;
  }

  // Charger la bibliothèque AJV pour la validation JSON
  loadScript('lib/ajv.bundle.js', () => {
    console.log("AJV chargé avec succès.");
    console.log("Ajv est défini :", typeof window.Ajv !== 'undefined');
    if (typeof window.Ajv === 'undefined') {
      console.error("Ajv n'est pas défini dans window. Vérifie que lib/ajv.bundle.js expose Ajv comme une variable globale.");
      jsonOutput.innerHTML = `<p style="color: red;">${translations[currentLang]['ajv_load_error'] || 'Erreur : Impossible de charger AJV.'}</p>`;
      return;
    }
    const ajv = new window.Ajv();
    // Attacher l'événement après le chargement
    validateButton.addEventListener('click', () => {
      const jsonText = jsonInput.value.trim();
      if (!jsonText) {
        jsonOutput.innerHTML = `<p style="color: red;">${translations[currentLang]['json_empty'] || 'Veuillez entrer un JSON à valider.'}</p>`;
        return;
      }

      try {
        const jsonData = JSON.parse(jsonText);
        jsonOutput.innerHTML = `<p style="color: green;">${translations[currentLang]['json_valid'] || 'JSON valide !'}</p>`;
        jsonOutput.innerHTML += `<pre>${JSON.stringify(jsonData, null, 2)}</pre>`;
      } catch (error) {
        jsonOutput.innerHTML = `<p style="color: red;">${translations[currentLang]['json_invalid'] || 'JSON invalide'} : ${error.message}</p>`;
      }
    });
  }, () => {
    console.error("Erreur lors du chargement de AJV.");
    jsonOutput.innerHTML = `<p style="color: red;">${translations[currentLang]['ajv_load_error'] || 'Erreur : Impossible de charger AJV.'}</p>`;
  });
}

// Cours CI/CD en Markdown avec rendu stylisé
function initializeCICDCourse() {
  console.log("Initialisation du Cours CI/CD...");
  const courseOutput = document.getElementById('cicd-course-output');
  if (!courseOutput) {
    console.error("Élément pour le cours CI/CD non trouvé.");
    return;
  }

  // Charger la bibliothèque marked pour convertir Markdown en HTML
  loadScript('lib/marked.min.js', () => {
    console.log("Marked chargé avec succès.");
    // Charger le contenu du cours depuis les traductions
    const cicdCourseMarkdown = translations[currentLang]['cicd_course_content'] || '# Error\nContent not available.';
    // Convertir Markdown en HTML
    try {
      const htmlContent = marked.parse(cicdCourseMarkdown);
      courseOutput.innerHTML = htmlContent;
    } catch (error) {
      console.error("Erreur lors du rendu du cours CI/CD :", error);
      courseOutput.innerHTML = `<p style="color: red;">${translations[currentLang]['cicd_render_error'] || 'Erreur lors du rendu du cours'} : ${error.message}</p>`;
    }
  }, () => {
    console.error("Erreur lors du chargement de Marked.");
    courseOutput.innerHTML = `<p style="color: red;">${translations[currentLang]['marked_load_error'] || 'Erreur : Impossible de charger Marked.'}</p>`;
  });
}

// Fonction utilitaire pour charger des scripts dynamiquement
function loadScript(src, callback, errorCallback) {
  const script = document.createElement('script');
  script.src = src;
  script.onload = callback;
  script.onerror = errorCallback;
  document.head.appendChild(script);
}
