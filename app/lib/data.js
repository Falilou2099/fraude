// Stockage en mémoire temporaire pour les données
let fraudeCases = [];
let components = [];
let nextId = 1;

// Fonction utilitaire pour générer un ID
const generateId = () => `id_${nextId++}`;

// API pour les cas de fraude
export const fraudeCaseAPI = {
  getAll: (filters = {}) => {
    let filtered = [...fraudeCases];
    
    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }
    
    if (filters.priority) {
      filtered = filtered.filter(c => c.priority === filters.priority);
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  
  getById: (id) => {
    return fraudeCases.find(c => c.id === id);
  },
  
  create: (data) => {
    const newCase = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    fraudeCases.push(newCase);
    return newCase;
  },
  
  update: (id, data) => {
    const index = fraudeCases.findIndex(c => c.id === id);
    if (index !== -1) {
      fraudeCases[index] = {
        ...fraudeCases[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return fraudeCases[index];
    }
    return null;
  },
  
  delete: (id) => {
    const index = fraudeCases.findIndex(c => c.id === id);
    if (index !== -1) {
      fraudeCases.splice(index, 1);
      return true;
    }
    return false;
  }
};

// API pour les composants
export const componentAPI = {
  getAll: (filters = {}) => {
    let filtered = [...components];
    
    if (filters.category) {
      filtered = filtered.filter(c => c.category === filters.category);
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(search) ||
        (c.description && c.description.toLowerCase().includes(search)) ||
        (c.tags && c.tags.some(tag => tag.toLowerCase().includes(search)))
      );
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  
  getById: (id) => {
    return components.find(c => c.id === id);
  },
  
  create: (data) => {
    const newComponent = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    components.push(newComponent);
    return newComponent;
  },
  
  update: (id, data) => {
    const index = components.findIndex(c => c.id === id);
    if (index !== -1) {
      components[index] = {
        ...components[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return components[index];
    }
    return null;
  },
  
  delete: (id) => {
    const index = components.findIndex(c => c.id === id);
    if (index !== -1) {
      components.splice(index, 1);
      return true;
    }
    return false;
  },
  
  seed: () => {
    const sampleComponents = [
      {
        name: 'ButtonPrimary',
        description: 'Bouton principal avec style moderne et états hover/focus',
        code: `export default function ButtonPrimary({ children, onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
    >
      {children}
    </button>
  );
}`,
        image: 'https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Button+Primary',
        category: 'UI',
        tags: ['button', 'primary', 'ui', 'interactive'],
        createdBy: 'system'
      },
      {
        name: 'CardProduct',
        description: 'Carte produit avec image, titre, description et prix',
        code: `export default function CardProduct({ image, title, description, price }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-3">{description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-blue-600">{price}€</span>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}`,
        image: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Card+Product',
        category: 'UI',
        tags: ['card', 'product', 'ecommerce', 'ui'],
        createdBy: 'system'
      }
    ];
    
    // Ajouter les composants d'exemple
    sampleComponents.forEach(comp => {
      componentAPI.create(comp);
    });
    
    return sampleComponents.length;
  }
};

export default { fraudeCaseAPI, componentAPI };
