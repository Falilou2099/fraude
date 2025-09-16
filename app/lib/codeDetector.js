// Système d'auto-détection du langage/dialecte/framework
export class CodeDetector {
  
  // Détection du type de code basé sur le contenu
  static detectCodeType(code) {
    const trimmedCode = code.trim();
    
    // Détection React/JSX
    if (this.isReactCode(trimmedCode)) {
      return {
        language: 'javascript',
        framework: 'react',
        dialect: 'jsx',
        compilationType: 'babel-react'
      };
    }
    
    // Détection Vue.js
    if (this.isVueCode(trimmedCode)) {
      return {
        language: 'javascript',
        framework: 'vue',
        dialect: 'vue-sfc',
        compilationType: 'vue-compiler'
      };
    }
    
    // Détection Angular
    if (this.isAngularCode(trimmedCode)) {
      return {
        language: 'typescript',
        framework: 'angular',
        dialect: 'angular-component',
        compilationType: 'typescript-angular'
      };
    }
    
    // Détection Svelte
    if (this.isSvelteCode(trimmedCode)) {
      return {
        language: 'javascript',
        framework: 'svelte',
        dialect: 'svelte-component',
        compilationType: 'svelte-compiler'
      };
    }
    
    // Détection TypeScript
    if (this.isTypeScriptCode(trimmedCode)) {
      return {
        language: 'typescript',
        framework: 'vanilla',
        dialect: 'typescript',
        compilationType: 'typescript'
      };
    }
    
    // Détection JavaScript vanilla
    if (this.isJavaScriptCode(trimmedCode)) {
      return {
        language: 'javascript',
        framework: 'vanilla',
        dialect: 'es6',
        compilationType: 'javascript'
      };
    }
    
    // Détection HTML
    if (this.isHTMLCode(trimmedCode)) {
      return {
        language: 'html',
        framework: 'vanilla',
        dialect: 'html5',
        compilationType: 'html'
      };
    }
    
    // Détection CSS/SCSS/LESS
    if (this.isCSSCode(trimmedCode)) {
      const cssType = this.detectCSSType(trimmedCode);
      return {
        language: 'css',
        framework: 'vanilla',
        dialect: cssType,
        compilationType: cssType
      };
    }
    
    // Par défaut
    return {
      language: 'javascript',
      framework: 'vanilla',
      dialect: 'es6',
      compilationType: 'javascript'
    };
  }
  
  // Détection React/JSX
  static isReactCode(code) {
    const reactPatterns = [
      /import\s+React/i,
      /from\s+['"]react['"]/i,
      /React\.(Component|createElement|Fragment|useState|useEffect)/,
      /useState|useEffect|useContext|useReducer|useMemo|useCallback/,
      /export\s+default\s+function\s+[A-Z]\w*\s*\([^)]*\)\s*{[^}]*return\s*\(/,
      /function\s+[A-Z]\w*\s*\([^)]*\)\s*{[^}]*return\s*\(/,
      /const\s+[A-Z]\w*\s*=\s*\([^)]*\)\s*=>\s*{[^}]*return\s*\(/,
      /const\s+[A-Z]\w*\s*=\s*\([^)]*\)\s*=>\s*\(/,
      /<[A-Z]\w*[^>]*>/,
      /<div[^>]*className/,
      /className\s*=/,
      /onClick\s*=/,
      /onChange\s*=/,
      /onSubmit\s*=/,
      /jsx|JSX/,
      /<\/[A-Z]\w*>/,
      /return\s*\(\s*<[^>]*>/
    ];
    
    return reactPatterns.some(pattern => pattern.test(code));
  }
  
  // Détection Vue.js
  static isVueCode(code) {
    const vuePatterns = [
      /<template>/i,
      /<script>/i,
      /<style>/i,
      /export\s+default\s*{[^}]*data\s*\(/,
      /export\s+default\s*{[^}]*methods\s*:/,
      /export\s+default\s*{[^}]*computed\s*:/,
      /v-if|v-for|v-model|v-show|v-bind|v-on/,
      /@click|@input|@change/,
      /\{\{.*\}\}/,
      /Vue\.|createApp/
    ];
    
    return vuePatterns.some(pattern => pattern.test(code));
  }
  
  // Détection Angular
  static isAngularCode(code) {
    const angularPatterns = [
      /@Component\s*\(/,
      /@Injectable\s*\(/,
      /@NgModule\s*\(/,
      /@Input\s*\(/,
      /@Output\s*\(/,
      /from\s+['"]@angular\//,
      /templateUrl\s*:/,
      /styleUrls\s*:/,
      /\*ngFor|\*ngIf/,
      /\(click\)|\(input\)|\(change\)/,
      /\[\(ngModel\)\]/
    ];
    
    return angularPatterns.some(pattern => pattern.test(code));
  }
  
  // Détection Svelte
  static isSvelteCode(code) {
    const sveltePatterns = [
      /<script>/i,
      /<style>/i,
      /\{#if|\{#each|\{#await/,
      /\{\/if\}|\{\/each\}|\{\/await\}/,
      /on:click|on:input|on:change/,
      /bind:value|bind:checked/,
      /\$:/,
      /export\s+let\s+\w+/
    ];
    
    return sveltePatterns.some(pattern => pattern.test(code));
  }
  
  // Détection TypeScript
  static isTypeScriptCode(code) {
    const tsPatterns = [
      /:\s*(string|number|boolean|object|any|void|never|unknown)/,
      /interface\s+\w+/,
      /type\s+\w+\s*=/,
      /enum\s+\w+/,
      /public\s+|private\s+|protected\s+/,
      /implements\s+\w+/,
      /extends\s+\w+/,
      /<[A-Z]\w*>/,
      /as\s+\w+/,
      /\?\s*:/
    ];
    
    return tsPatterns.some(pattern => pattern.test(code));
  }
  
  // Détection JavaScript
  static isJavaScriptCode(code) {
    const jsPatterns = [
      /function\s+\w+/,
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /var\s+\w+\s*=/,
      /=>\s*{/,
      /=>\s*\(/,
      /class\s+\w+/,
      /import\s+.*from/,
      /export\s+(default\s+)?/,
      /console\.(log|error|warn)/,
      /document\.|window\./
    ];
    
    return jsPatterns.some(pattern => pattern.test(code));
  }
  
  // Détection HTML
  static isHTMLCode(code) {
    const htmlPatterns = [
      /<!DOCTYPE\s+html>/i,
      /<html[^>]*>/i,
      /<head[^>]*>/i,
      /<body[^>]*>/i,
      /<div[^>]*>/i,
      /<p[^>]*>/i,
      /<h[1-6][^>]*>/i,
      /<img[^>]*>/i,
      /<a[^>]*>/i,
      /<script[^>]*>/i,
      /<style[^>]*>/i
    ];
    
    return htmlPatterns.some(pattern => pattern.test(code));
  }
  
  // Détection CSS
  static isCSSCode(code) {
    const cssPatterns = [
      /\.[a-zA-Z][\w-]*\s*{/,
      /#[a-zA-Z][\w-]*\s*{/,
      /[a-zA-Z][\w-]*\s*{[^}]*}/,
      /color\s*:/,
      /background\s*:/,
      /margin\s*:/,
      /padding\s*:/,
      /font-size\s*:/,
      /display\s*:/,
      /position\s*:/,
      /@media\s*\(/,
      /@import\s+/
    ];
    
    return cssPatterns.some(pattern => pattern.test(code));
  }
  
  // Détection du type de CSS
  static detectCSSType(code) {
    if (/\$[\w-]+\s*:|@mixin|@include|@extend/.test(code)) {
      return 'scss';
    }
    if (/@[\w-]+\s*:|\.[\w-]+\(\)/.test(code)) {
      return 'less';
    }
    if (/:root\s*{|var\(--[\w-]+\)/.test(code)) {
      return 'css-custom-properties';
    }
    return 'css';
  }
  
  // Obtenir les dépendances nécessaires selon le type détecté
  static getDependencies(codeType) {
    const dependencies = {
      'babel-react': [
        'https://unpkg.com/@babel/standalone/babel.min.js',
        'https://unpkg.com/react@18/umd/react.development.js',
        'https://unpkg.com/react-dom@18/umd/react-dom.development.js'
      ],
      'vue-compiler': [
        'https://unpkg.com/vue@3/dist/vue.global.js'
      ],
      'typescript-angular': [
        'https://unpkg.com/typescript@latest/lib/typescript.js',
        'https://unpkg.com/@angular/core@latest/bundles/core.umd.js'
      ],
      'svelte-compiler': [
        'https://unpkg.com/svelte@3/compiler.js'
      ],
      'typescript': [
        'https://unpkg.com/typescript@latest/lib/typescript.js'
      ],
      'javascript': [],
      'html': [],
      'css': [],
      'scss': [
        'https://unpkg.com/sass@latest/sass.js'
      ],
      'less': [
        'https://unpkg.com/less@latest/dist/less.min.js'
      ]
    };
    
    return dependencies[codeType.compilationType] || [];
  }
  
  // Obtenir la configuration de l'éditeur Monaco selon le type
  static getMonacoLanguage(codeType) {
    const monacoLanguages = {
      'babel-react': 'javascript',
      'vue-compiler': 'html',
      'typescript-angular': 'typescript',
      'svelte-compiler': 'html',
      'typescript': 'typescript',
      'javascript': 'javascript',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'less': 'less'
    };
    
    return monacoLanguages[codeType.compilationType] || 'javascript';
  }
}
