// tools.js

// Mermaid Live Editor
function initializeMermaidEditor() {
  const mermaidInput = document.getElementById('mermaid-input');
  const mermaidOutput = document.getElementById('mermaid-output');
  if (!mermaidInput || !mermaidOutput) {
    console.error("Éléments pour Mermaid Live Editor non trouvés.");
    return;
  }

  // Charger la bibliothèque Mermaid
  if (typeof mermaid === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/mermaid@10/dist/mermaid.min.js';
    script.onload = () => {
      mermaid.initialize({ startOnLoad: false, theme: 'default' });
      renderMermaid();
    };
    document.head.appendChild(script);
  } else {
    renderMermaid();
  }

  // Rendu en temps réel
  mermaidInput.addEventListener('input', renderMermaid);

  function renderMermaid() {
    const code = mermaidInput.value;
    mermaidOutput.innerHTML = '';
    try {
      mermaid.render('mermaid-diagram', code, (svgCode) => {
        mermaidOutput.innerHTML = svgCode;
      });
    } catch (error) {
      mermaidOutput.innerHTML = `<p style="color: red;">Erreur de rendu Mermaid : ${error.message}</p>`;
    }
  }
}

// Pandoc-like Document Conversion
function initializeDocumentConverter() {
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
  loadScript('https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js', () => {
    loadScript('https://cdn.jsdelivr.net/npm/showdown@2.1.0/dist/showdown.min.js', () => {
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js', () => {
        console.log("Bibliothèques de conversion chargées.");
      });
    });
  });

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
        convertOutput.innerHTML = `<p style="color: red;">Erreur lors de la lecture du fichier : ${error.message}</p>`;
        return;
      }
    }

    if (!content) {
      convertOutput.innerHTML = `<p style="color: red;">Veuillez fournir un fichier ou du texte à convertir.</p>`;
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
      downloadButton.textContent = 'Télécharger le résultat';
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
      convertOutput.innerHTML = `<p style="color: red;">Erreur lors de la conversion : ${error.message}</p>`;
    }
  });
}

// Validateur JSON
function initializeJsonValidator() {
  const jsonInput = document.getElementById('json-input');
  const validateButton = document.getElementById('validate-json-button');
  const jsonOutput = document.getElementById('json-output');

  if (!jsonInput || !validateButton || !jsonOutput) {
    console.error("Éléments pour le validateur JSON non trouvés.");
    return;
  }

  // Charger la bibliothèque AJV pour la validation JSON
  loadScript('https://cdn.jsdelivr.net/npm/ajv@8.12.0/dist/ajv.min.js', () => {
    const ajv = new Ajv();

    validateButton.addEventListener('click', () => {
      const jsonText = jsonInput.value.trim();
      if (!jsonText) {
        jsonOutput.innerHTML = `<p style="color: red;">Veuillez entrer un JSON à valider.</p>`;
        return;
      }

      try {
        const jsonData = JSON.parse(jsonText);
        jsonOutput.innerHTML = `<p style="color: green;">JSON valide !</p>`;
        jsonOutput.innerHTML += `<pre>${JSON.stringify(jsonData, null, 2)}</pre>`;
      } catch (error) {
        jsonOutput.innerHTML = `<p style="color: red;">JSON invalide : ${error.message}</p>`;
      }
    });
  });
}

// Cours CI/CD en Markdown avec rendu stylisé
function initializeCICDCourse() {
  const courseOutput = document.getElementById('cicd-course-output');
  if (!courseOutput) {
    console.error("Élément pour le cours CI/CD non trouvé.");
    return;
  }

  // Charger la bibliothèque marked pour convertir Markdown en HTML
  loadScript('https://cdn.jsdelivr.net/npm/marked@4.3.0/lib/marked.min.js', () => {
    // Exemple de cours CI/CD en Markdown
    const cicdCourseMarkdown = `
# Introduction au CI/CD

## Qu'est-ce que le CI/CD ?

Le **CI/CD** (Intégration Continue / Déploiement Continu) est une pratique DevOps qui permet d'automatiser le processus de développement logiciel. Elle se divise en deux parties principales :

- **CI (Intégration Continue)** : Les développeurs intègrent fréquemment leur code dans un dépôt partagé, et chaque intégration est vérifiée par des tests automatisés.
- **CD (Déploiement Continu)** : Le code testé est automatiquement déployé en production ou dans un environnement de staging.

## Étapes typiques d'un pipeline CI/CD

1. **Code** : Les développeurs écrivent et soumettent leur code via un système de contrôle de version (ex. Git).
2. **Build** : Le code est compilé ou préparé pour les tests.
3. **Test** : Des tests automatisés (unitaires, d'intégration, etc.) sont exécutés.
4. **Déploiement** : Le code est déployé dans un environnement (staging ou production).

## Outils populaires

- **Jenkins** : Un serveur d'automatisation open-source.
- **GitHub Actions** : Intégré à GitHub pour automatiser les workflows.
- **GitLab CI/CD** : Intégré à GitLab pour gérer les pipelines.
- **CircleCI** : Une plateforme CI/CD cloud.

## Exemple de workflow GitHub Actions

\`\`\`yaml
name: CI/CD Pipeline
on:
  push:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    - name: Install dependencies
      run: npm install
    - name: Run tests
      run: npm test
    - name: Deploy
      run: echo "Déploiement en production"
\`\`\`

## Avantages du CI/CD

- **Rapidité** : Les déploiements sont plus fréquents et rapides.
- **Qualité** : Les tests automatisés réduisent les bugs.
- **Collaboration** : Les équipes travaillent plus efficacement.
    `;

    // Convertir Markdown en HTML
    const htmlContent = marked.parse(cicdCourseMarkdown);
    courseOutput.innerHTML = htmlContent;
  });
}

// Fonction utilitaire pour charger des scripts dynamiquement
function loadScript(src, callback) {
  const script = document.createElement('script');
  script.src = src;
  script.onload = callback;
  document.head.appendChild(script);
}

// Initialisation de toutes les fonctionnalités
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('mermaid-editor-container')) {
    initializeMermaidEditor();
  }
  if (document.getElementById('converter-container')) {
    initializeDocumentConverter();
  }
  if (document.getElementById('json-validator-container')) {
    initializeJsonValidator();
  }
  if (document.getElementById('cicd-course-container')) {
    initializeCICDCourse();
  }
});
