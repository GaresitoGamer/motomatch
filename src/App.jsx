import React, { useState, useMemo } from 'react';
import { Search, Plus, Sparkles, RefreshCw, Layers, PlusCircle, HelpCircle } from 'lucide-react';
import { INITIAL_MOTORCYCLES, CATEGORIES, getProxyImageUrl } from './data/motorcycles';
import { evaluateComparison } from './utils/aiEvaluator';
import BikeCard from './components/BikeCard';
import ComparisonGrid from './components/ComparisonGrid';
import AiAssistant from './components/AiAssistant';
import AddBikeModal from './components/AddBikeModal';
import RecommendQuiz from './components/RecommendQuiz';

export default function App() {
  const [bikes, setBikes] = useState(INITIAL_MOTORCYCLES);
  const [selectedBikes, setSelectedBikes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Filtrar catálogo de motos
  const filteredBikes = useMemo(() => {
    return bikes.filter(bike => {
      const matchesSearch = 
        bike.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bike.model.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'All' || 
        bike.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [bikes, searchQuery, selectedCategory]);

  // Ejecutar el motor de IA local para las motos seleccionadas
  const aiEvaluation = useMemo(() => {
    return evaluateComparison(selectedBikes);
  }, [selectedBikes]);

  const handleSelectBike = (bike) => {
    const isSelected = selectedBikes.some(b => b.id === bike.id);
    
    if (isSelected) {
      // Si ya está seleccionada, la quitamos
      setSelectedBikes(prev => prev.filter(b => b.id !== bike.id));
    } else {
      // Si no está seleccionada, la agregamos (máximo 3)
      if (selectedBikes.length >= 3) {
        alert('Solo puedes comparar un máximo de 3 motos al mismo tiempo.');
        return;
      }
      setSelectedBikes(prev => [...prev, bike]);
    }
  };

  const handleRemoveBike = (bikeId) => {
    setSelectedBikes(prev => prev.filter(b => b.id !== bikeId));
  };

  const handleAddCustomBike = (newBike) => {
    setBikes(prev => [newBike, ...prev]);
    setIsModalOpen(false);
    
    // Auto-seleccionar la moto agregada
    if (selectedBikes.length < 3) {
      setSelectedBikes(prev => [...prev, newBike]);
    } else {
      alert(`Moto "${newBike.brand} ${newBike.model}" agregada al catálogo. Deselecciona alguna moto para poder compararla.`);
    }
  };

  const handleClearSelection = () => {
    setSelectedBikes([]);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo">
          <div className="logo-icon">🏍️</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 className="logo-text" style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>MotoMatch</h1>
              <span className="logo-tag">AI Assistant</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Comparador inteligente de características y precios de motocicletas
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button 
            className="filter-tag active" 
            onClick={() => setIsQuizOpen(true)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              borderColor: 'var(--accent-cyan)',
              color: 'var(--accent-cyan)',
              background: 'rgba(0, 240, 255, 0.05)'
            }}
          >
            <Sparkles size={12} /> ¿Cuál es mi moto ideal?
          </button>

          {selectedBikes.length > 0 && (
            <button 
              className="filter-tag" 
              onClick={handleClearSelection}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                borderColor: 'rgba(255, 46, 46, 0.3)',
                color: 'var(--accent-red)' 
              }}
            >
              <RefreshCw size={12} /> Limpiar Selección ({selectedBikes.length})
            </button>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <main className="dashboard-grid">
        {/* Sidebar: Catalogo */}
        <aside className="catalog-sidebar">
          {/* Búsqueda */}
          <div className="search-box">
            <Search className="search-icon" size={16} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Buscar marca o modelo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Categorías */}
          <div>
            <h3 className="filter-title">Estilo de Moto</h3>
            <div className="filter-tags-grid">
              <button 
                className={`filter-tag ${selectedCategory === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('All')}
              >
                Todas
              </button>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  className={`filter-tag ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Botón para añadir moto personalizada */}
          <button className="add-custom-btn" onClick={() => setIsModalOpen(true)}>
            <PlusCircle size={16} />
            <span>Añadir Moto de Segunda Mano</span>
          </button>

          {/* Listado de motos */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 className="filter-title" style={{ margin: 0 }}>Catálogo ({filteredBikes.length})</h3>
            </div>
            <div className="bike-list-container">
              {filteredBikes.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No se encontraron resultados. Pruebe otra búsqueda.
                </div>
              ) : (
                filteredBikes.map(bike => {
                  const isSelected = selectedBikes.some(b => b.id === bike.id);
                  const defaultThumbnail = "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=100";
                  return (
                    <div 
                      key={bike.id} 
                      className={`bike-sidebar-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectBike(bike)}
                      style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'flex-start' }}
                    >
                      <img 
                        src={getProxyImageUrl(bike.image_url || defaultThumbnail, 80, 80)} 
                        alt="" 
                        className="bike-thumbnail"
                        referrerPolicy="no-referrer"
                      />
                      <div className="bike-sidebar-info" style={{ flexGrow: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.25rem' }}>
                          <h4 style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {bike.brand} {bike.model}
                          </h4>
                          <span className={`category-badge badge-${bike.category}`} style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', flexShrink: 0 }}>
                            {bike.category}
                          </span>
                        </div>
                        <p style={{ margin: 0, marginTop: '0.2rem', fontSize: '0.75rem' }}>
                          {bike.engine_cc}cc • {bike.power_hp} CV • {bike.year}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* Workspace: Comparación */}
        <section className="workspace-area">
          {/* Slots de Comparación */}
          <div>
            <div className="workspace-slots-title" style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} color="var(--accent-cyan)" />
                Área de Comparación
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="gear-indicator-container" title="Indicador de Marchas (Motos Seleccionadas)">
                  <span className="gear-label">MARCHA</span>
                  <span className={`gear-digit gear-${selectedBikes.length}`}>
                    {selectedBikes.length === 0 ? 'N' : selectedBikes.length}
                  </span>
                </div>
                <span className="slots-count-text">{selectedBikes.length} de 3 motos seleccionadas</span>
              </div>
            </div>

            {selectedBikes.length === 0 ? (
              <div className="empty-workspace-banner glass-panel">
                <div className="empty-workspace-icon">🛵</div>
                <h3>¡Compara características de motos!</h3>
                <p style={{ marginBottom: '1.25rem' }}>
                  Selecciona de 1 a 3 motos del catálogo lateral para analizar sus especificaciones técnicas, precios promedio y dejar que MotoMatch AI evalúe tu combinación.
                </p>

                <button 
                  className="filter-tag active" 
                  onClick={() => setIsQuizOpen(true)}
                  style={{ 
                    padding: '0.75rem 1.25rem', 
                    fontSize: '0.9rem', 
                    borderRadius: '10px', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    cursor: 'pointer',
                    background: 'rgba(0, 240, 255, 0.08)',
                    borderColor: 'var(--accent-cyan)',
                    color: 'var(--accent-cyan)',
                    fontWeight: 600
                  }}
                >
                  <Sparkles size={14} /> ¿No sabes qué elegir? Haz el Test de Moto Ideal
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className="category-badge badge-Naked">Naked</span>
                  <span className="category-badge badge-Sport">Sport</span>
                  <span className="category-badge badge-Trail">Trail</span>
                </div>
              </div>
            ) : (
              <div className="slots-grid">
                {selectedBikes.map(bike => (
                  <BikeCard 
                    key={bike.id} 
                    bike={bike} 
                    onRemove={handleRemoveBike} 
                  />
                ))}
                {selectedBikes.length < 3 && (
                  <div className="slot-card" onClick={() => document.querySelector('.search-input')?.focus()}>
                    <Plus size={24} style={{ marginBottom: '0.5rem' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Añadir Moto</span>
                    <span style={{ fontSize: '0.75rem' }}>Selecciona del catálogo lateral</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Assistant Output */}
          {selectedBikes.length > 0 && (
            <AiAssistant evaluation={aiEvaluation} />
          )}

          {/* Specs Grid */}
          {selectedBikes.length > 0 && (
            <ComparisonGrid bikes={selectedBikes} />
          )}
        </section>
      </main>

      {/* Modal para añadir moto */}
      {isModalOpen && (
        <AddBikeModal 
          onClose={() => setIsModalOpen(false)} 
          onAddBike={handleAddCustomBike} 
        />
      )}

      {/* Quiz Modal */}
      {isQuizOpen && (
        <RecommendQuiz 
          bikes={bikes} 
          onAddBike={handleSelectBike} 
          onClose={() => setIsQuizOpen(false)} 
        />
      )}
    </div>
  );
}
