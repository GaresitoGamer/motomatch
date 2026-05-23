import React from 'react';
import { Trash2, ExternalLink } from 'lucide-react';
import { getProxyImageUrl } from '../data/motorcycles';

export default function BikeCard({ bike, onRemove }) {
  // Generar URL de búsqueda de motos.net y wallapop en base a la marca y modelo
  const searchQuery = encodeURIComponent(`${bike.brand} ${bike.model}`);
  const motosNetUrl = `https://www.motos.net/motos-de-segunda-mano/?key=${searchQuery}`;
  const wallapopUrl = `https://es.wallapop.com/app/search?keywords=${searchQuery}`;

  // Imagen por defecto basada en la categoría si no tiene URL
  const defaultImages = {
    Sport: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600&auto=format&fit=crop&q=60",
    Naked: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600&auto=format&fit=crop&q=60",
    Trail: "https://images.unsplash.com/photo-1591123720164-de1348028a82?w=600&auto=format&fit=crop&q=60",
    Cruiser: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=60",
    Scooter: "https://images.unsplash.com/photo-1571188654248-7a89213915f7?w=600&auto=format&fit=crop&q=60",
    Touring: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=60"
  };
  const imageUrl = bike.image_url || defaultImages[bike.category] || defaultImages.Naked;

  return (
    <div className={`slot-card filled slide-up-anim ${bike.category.toLowerCase()} brand-${bike.brand.toLowerCase().replace(/[^a-z0-9]/g, '')}`} style={{ padding: 0 }}>
      <button 
        className="remove-slot-btn" 
        onClick={() => onRemove(bike.id)}
        title="Quitar de la comparación"
        aria-label="Remove motorcycle"
        style={{ zIndex: 10, background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)' }}
      >
        <Trash2 size={14} />
      </button>

      <div className="slot-image-container" style={{ position: 'relative', height: '130px', width: '100%', overflow: 'hidden' }}>
        <img 
          src={getProxyImageUrl(imageUrl, 600, 300)} 
          alt={`${bike.brand} ${bike.model}`} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          referrerPolicy="no-referrer"
        />
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          width: '100%', 
          height: '60%', 
          background: 'linear-gradient(to top, rgba(20, 24, 38, 0.95), transparent)' 
        }} />
        <span 
          className={`category-badge badge-${bike.category}`} 
          style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 5 }}
        >
          {bike.category}
        </span>
      </div>

      <div style={{ padding: '1rem 1.25rem 1.25rem 1.25rem' }}>
        <div className="slot-header" style={{ margin: 0, paddingRight: 0, display: 'block' }}>
          <div className="slot-title-wrap">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{bike.brand} {bike.model}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.1rem' }}>Año {bike.year || 'N/A'}</p>
          </div>
        </div>

        <p className="slot-description" style={{ marginTop: '0.5rem', marginBottom: '1rem', minHeight: '3.6em' }}>{bike.description}</p>

        <div className="slot-specs-preview">
          <div className="spec-preview-item">
            <span className="spec-preview-label">Motor</span>
            <span className="spec-preview-val">{bike.engine_cc} cc</span>
          </div>
          <div className="spec-preview-item">
            <span className="spec-preview-label">Potencia</span>
            <span className="spec-preview-val">{bike.power_hp} CV</span>
          </div>
          <div className="spec-preview-item">
            <span className="spec-preview-label">Peso</span>
            <span className="spec-preview-val">{bike.weight_kg} kg</span>
          </div>
          <div className="spec-preview-item">
            <span className="spec-preview-label">Ocasión</span>
            <span className="spec-preview-val">~{bike.price_used_avg_eur?.toLocaleString()} €</span>
          </div>
        </div>

        <div className="comparison-external-links">
          <p className="external-links-title">Ver ofertas reales en:</p>
          <div className="links-row">
            <a 
              href={motosNetUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="market-link"
            >
              Motos.net <ExternalLink size={10} />
            </a>
            <a 
              href={wallapopUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="market-link wallapop"
            >
              Wallapop <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
