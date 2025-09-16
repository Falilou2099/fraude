import { CodeDetector } from './codeDetector';

// Système de compilation intelligent avec auto-détection
export class CodeCompiler {
  
  // Compiler le code selon le type détecté
  static async compileCode(code, detectedType = null) {
    // Auto-détection si pas de type fourni
    const codeType = detectedType || CodeDetector.detectCodeType(code);
    
    switch (codeType.compilationType) {
      case 'babel-react':
        return this.compileReact(code, codeType);
      case 'vue-compiler':
        return this.compileVue(code, codeType);
      case 'typescript-angular':
        return this.compileAngular(code, codeType);
      case 'svelte-compiler':
        return this.compileSvelte(code, codeType);
      case 'typescript':
        return this.compileTypeScript(code, codeType);
      case 'javascript':
        return this.compileJavaScript(code, codeType);
      case 'html':
        return this.compileHTML(code, codeType);
      case 'css':
      case 'scss':
      case 'less':
        return this.compileCSS(code, codeType);
      default:
        return this.compileJavaScript(code, codeType);
    }
  }
  
  // Compilation React/JSX avec Babel
  static compileReact(code, codeType) {
    const componentName = this.detectReactComponentName(code);
    const wrappedCode = this.wrapReactCode(code);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>React Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      </head>
      <body class="bg-gray-50 p-4">
        <div id="root"></div>
        <script type="text/babel">
          // Code nettoyé automatiquement
          ${wrappedCode}
          
          // Rendu automatique avec détection intelligente
          try {
            const container = document.getElementById('root');
            const root = ReactDOM.createRoot(container);
            
            // Chercher le composant à rendre
            let ComponentToRender;
            const componentName = '${componentName}';
            
            // Essayer le nom détecté
            if (componentName && componentName !== 'Component' && typeof window[componentName] !== 'undefined') {
              ComponentToRender = window[componentName];
            } else {
              // Essayer d'autres noms communs
              const possibleNames = ['MyComponent', 'LoginForm', 'Component', 'App', 'Main', 'Index'];
              for (const name of possibleNames) {
                if (typeof window[name] !== 'undefined') {
                  ComponentToRender = window[name];
                  break;
                }
              }
            }
            
            if (typeof ComponentToRender === 'undefined') {
              throw new Error('Aucun composant React trouvé. Vérifiez que votre fonction commence par une majuscule.');
            }
            
            root.render(React.createElement(ComponentToRender));
          } catch (error) {
            console.error('Erreur de compilation React:', error);
            document.getElementById('root').innerHTML = 
              '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-lg">' +
              '<strong>Erreur React:</strong> ' + error.message + 
              '<br><small class="text-xs mt-2 block text-gray-600">Code nettoyé disponible dans la console</small>' +
              '</div>';
            console.log('Code après nettoyage:', \`${wrappedCode.replace(/`/g, '\\`')}\`);
          }
        </script>
      </body>
      </html>
    `;
  }
  
  // Compilation Vue.js
  static compileVue(code, codeType) {
    const dependencies = CodeDetector.getDependencies(codeType);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vue Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
        ${dependencies.map(dep => `<script src="${dep}"></script>`).join('\n        ')}
      </head>
      <body class="bg-gray-50 p-4">
        <div id="app"></div>
        <script>
          try {
            ${this.wrapVueCode(code)}
          } catch (error) {
            console.error('Erreur de compilation Vue:', error);
            document.getElementById('app').innerHTML = 
              '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">' +
              '<strong>Erreur Vue:</strong> ' + error.message + 
              '</div>';
          }
        </script>
      </body>
      </html>
    `;
  }
  
  // Compilation TypeScript
  static compileTypeScript(code, codeType) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TypeScript Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/typescript@latest/lib/typescript.js"></script>
      </head>
      <body class="bg-gray-50 p-4">
        <div id="output"></div>
        <script>
          try {
            // Transpiler TypeScript vers JavaScript
            const tsCode = \`${code.replace(/`/g, '\\`')}\`;
            const jsCode = ts.transpile(tsCode, {
              target: ts.ScriptTarget.ES2015,
              module: ts.ModuleKind.None
            });
            
            // Exécuter le JavaScript généré
            eval(jsCode);
          } catch (error) {
            console.error('Erreur de compilation TypeScript:', error);
            document.getElementById('output').innerHTML = 
              '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">' +
              '<strong>Erreur TypeScript:</strong> ' + error.message + 
              '</div>';
          }
        </script>
      </body>
      </html>
    `;
  }
  
  // Compilation JavaScript vanilla
  static compileJavaScript(code, codeType) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>JavaScript Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-50 p-4">
        <div id="output"></div>
        <script>
          try {
            ${code}
          } catch (error) {
            console.error('Erreur JavaScript:', error);
            document.getElementById('output').innerHTML = 
              '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">' +
              '<strong>Erreur JavaScript:</strong> ' + error.message + 
              '</div>';
          }
        </script>
      </body>
      </html>
    `;
  }
  
  // Compilation HTML
  static compileHTML(code, codeType) {
    // Si c'est du HTML complet, le retourner tel quel
    if (code.includes('<!DOCTYPE') || code.includes('<html')) {
      return code;
    }
    
    // Sinon, l'envelopper dans une structure HTML
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HTML Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-50 p-4">
        ${code}
      </body>
      </html>
    `;
  }
  
  // Compilation CSS/SCSS/LESS
  static compileCSS(code, codeType) {
    let compiledCSS = code;
    
    // Pour SCSS/LESS, on pourrait ajouter la compilation ici
    // Pour l'instant, on traite comme du CSS normal
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CSS Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          ${compiledCSS}
        </style>
      </head>
      <body class="bg-gray-50 p-4">
        <div class="preview-container">
          <h2 class="text-xl font-bold mb-4">Aperçu CSS</h2>
          <div class="demo-content">
            <div class="my-component">
              <h3>Élément de démonstration</h3>
              <p>Votre CSS est appliqué à cette page.</p>
              <button class="btn">Bouton de test</button>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  // Compilation Svelte
  static compileSvelte(code, codeType) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Svelte Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-50 p-4">
        <div id="app"></div>
        <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>Info:</strong> La compilation Svelte complète nécessite un serveur de développement.
          <br>Voici le code source:
          <pre class="mt-2 text-sm bg-gray-100 p-2 rounded">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </div>
      </body>
      </html>
    `;
  }
  
  // Compilation Angular
  static compileAngular(code, codeType) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Angular Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-50 p-4">
        <div id="app"></div>
        <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>Info:</strong> La compilation Angular complète nécessite Angular CLI.
          <br>Voici le code source:
          <pre class="mt-2 text-sm bg-gray-100 p-2 rounded">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </div>
      </body>
      </html>
    `;
  }
  
  // Utilitaires pour React
  static wrapReactCode(code) {
    let wrappedCode = code;
    
    // Méthode plus agressive : supprimer TOUTES les lignes qui commencent par import
    const lines = wrappedCode.split('\n');
    const cleanedLines = lines.filter(line => {
      const trimmedLine = line.trim();
      // Supprimer toutes les lignes d'import
      return !trimmedLine.startsWith('import ') && !trimmedLine.startsWith('import\t');
    });
    
    wrappedCode = cleanedLines.join('\n');
    
    // Nettoyer les lignes vides multiples
    wrappedCode = wrappedCode.replace(/\n\s*\n\s*\n/g, '\n\n');
    wrappedCode = wrappedCode.trim();
    
    // Détecter le nom du composant
    const componentName = this.detectReactComponentName(wrappedCode);
    
    // Gérer les exports
    if (wrappedCode.includes('export default')) {
      // Remplacer export default function
      wrappedCode = wrappedCode.replace(/export\s+default\s+function\s+(\w+)/g, 'function $1');
      // Remplacer export default variable
      wrappedCode = wrappedCode.replace(/export\s+default\s+(\w+);?\s*$/gm, '');
      // Ajouter l'exposition globale à la fin
      if (componentName && componentName !== 'Component') {
        wrappedCode += `\n\n// Auto-export pour le rendu\nwindow.${componentName} = ${componentName};`;
      }
    } else if (componentName && componentName !== 'Component') {
      // Si pas d'export mais composant détecté, l'exposer
      wrappedCode += `\n\n// Auto-export pour le rendu\nwindow.${componentName} = ${componentName};`;
    }
    
    return wrappedCode;
  }
  
  static detectReactComponentName(code) {
    // Chercher les patterns de composants React
    const patterns = [
      /function\s+([A-Z]\w*)\s*\(/,
      /const\s+([A-Z]\w*)\s*=\s*\(/,
      /export\s+default\s+function\s+([A-Z]\w*)/,
      /export\s+default\s+([A-Z]\w*)/
    ];
    
    for (const pattern of patterns) {
      const match = code.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return 'Component';
  }
  
  // Utilitaires pour Vue
  static wrapVueCode(code) {
    // Si c'est un composant Vue SFC, extraire les parties
    if (code.includes('<template>')) {
      return this.parseSFC(code);
    }
    
    // Si c'est un objet de configuration Vue
    if (code.includes('export default {')) {
      return `
        const { createApp } = Vue;
        const componentConfig = ${code.replace('export default ', '')};
        createApp(componentConfig).mount('#app');
      `;
    }
    
    return code;
  }
  
  static parseSFC(code) {
    const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/);
    const scriptMatch = code.match(/<script>([\s\S]*?)<\/script>/);
    const styleMatch = code.match(/<style>([\s\S]*?)<\/style>/);
    
    const template = templateMatch ? templateMatch[1].trim() : '<div>Pas de template trouvé</div>';
    const script = scriptMatch ? scriptMatch[1].trim() : 'export default {}';
    const style = styleMatch ? styleMatch[1].trim() : '';
    
    return `
      ${style ? `<style>${style}</style>` : ''}
      const { createApp } = Vue;
      const componentConfig = ${script.replace('export default ', '')};
      componentConfig.template = \`${template}\`;
      createApp(componentConfig).mount('#app');
    `;
  }
}
