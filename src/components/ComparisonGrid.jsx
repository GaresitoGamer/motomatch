import React from 'react';
import { getProxyImageUrl } from '../data/motorcycles';

export default function ComparisonGrid({ bikes }) {
  if (!bikes || bikes.length === 0) return null;

  // Encontrar valores máximos y mínimos para el cálculo de barras de progreso e iluminaciones
  const getMinMax = (key, isLowerBetter = false) => {
    const values = bikes.map(b => Number(b[key]));
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    return {
      max,
      min,
      best: isLowerBetter ? min : max
    };
  };

  // Precalculamos los campeones para destacar
  const engineStats = getMinMax('engine_cc');
  const powerStats = getMinMax('power_hp');
  const torqueStats = getMinMax('torque_nm');
  const weightStats = getMinMax('weight_kg', true); // Menor peso es mejor
  const seatStats = getMinMax('seat_height_mm', true); // Menor altura suele ser mejor/más accesible
  const fuelStats = getMinMax('fuel_capacity_l');
  const priceNewStats = getMinMax('price_new_eur', true); // Menor precio es mejor
  const priceUsedStats = getMinMax('price_used_avg_eur', true); // Menor precio es mejor

  // Para relación peso-potencia
  const p2wList = bikes.map(b => ({ id: b.id, val: b.power_hp / b.weight_kg }));
  const maxP2w = Math.max(...p2wList.map(item => item.val));

  const renderProgressBar = (value, maxVal, isHighlight = false) => {
    const pct = Math.min(100, Math.max(5, (value / maxVal) * 100));
    return (
      <div className="bar-chart-container">
        <span className="bar-val">{value.toLocaleString()}</span>
        <div className="bar-track">
          <div 
            className={`bar-fill ${isHighlight ? 'highlight' : ''}`} 
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="comparison-grid-section glass-panel slide-up-anim" style={{ animationDelay: '0.1s' }}>
      <div style={{ padding: '1.25rem 1.25rem 0.5rem 1.25rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Tabla Comparativa de Especificaciones</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Comparación directa cara a cara. Las mejores especificaciones se destacan de forma dinámica.
        </p>
      </div>

      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th className="spec-name-col">Característica</th>
              {bikes.map(bike => (
                <th key={bike.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <img 
                      src={getProxyImageUrl(bike.image_url || "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=100", 80, 80)} 
                      alt="" 
                      style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div style={{ fontWeight: 700, lineHeight: 1.1 }}>{bike.brand}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '0.1rem' }}>{bike.model}</div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Categoría */}
            <tr>
              <td className="spec-name-col">Estilo / Categoría</td>
              {bikes.map(bike => (
                <td key={bike.id} className="spec-val-col">
                  <span className={`category-badge badge-${bike.category}`}>{bike.category}</span>
                </td>
              ))}
            </tr>

            {/* Cilindrada */}
            <tr>
              <td className="spec-name-col">Cilindrada (cc)</td>
              {bikes.map(bike => {
                const isBest = Number(bike.engine_cc) === engineStats.best;
                return (
                  <td key={bike.id} className="spec-val-col" style={isBest && bikes.length > 1 ? { color: 'var(--accent-cyan)' } : {}}>
                    {renderProgressBar(bike.engine_cc, engineStats.max, isBest && bikes.length > 1)}
                  </td>
                );
              })}
            </tr>

            {/* Potencia */}
            <tr>
              <td className="spec-name-col">Potencia (CV)</td>
              {bikes.map(bike => {
                const isBest = Number(bike.power_hp) === powerStats.best;
                return (
                  <td key={bike.id} className="spec-val-col" style={isBest && bikes.length > 1 ? { color: 'var(--accent-green)' } : {}}>
                    {renderProgressBar(bike.power_hp, powerStats.max, isBest && bikes.length > 1)}
                  </td>
                );
              })}
            </tr>

            {/* Par Motor */}
            <tr>
              <td className="spec-name-col">Par Motor (Nm)</td>
              {bikes.map(bike => {
                const isBest = Number(bike.torque_nm) === torqueStats.best;
                return (
                  <td key={bike.id} className="spec-val-col">
                    {renderProgressBar(bike.torque_nm, torqueStats.max, isBest && bikes.length > 1)}
                  </td>
                );
              })}
            </tr>

            {/* Peso */}
            <tr>
              <td className="spec-name-col">Peso en Lleno (kg)</td>
              {bikes.map(bike => {
                const isBest = Number(bike.weight_kg) === weightStats.best;
                const value = Number(bike.weight_kg);
                // En el peso, menor es mejor, así que invertimos la visualización del progreso para la barra
                const maxWeight = weightStats.max;
                return (
                  <td key={bike.id} className={`spec-val-col ${isBest && bikes.length > 1 ? 'winner' : ''}`} style={isBest && bikes.length > 1 ? { color: 'var(--accent-green)' } : {}}>
                    <div className="bar-chart-container">
                      <span className="bar-val">{value} kg</span>
                      <div className="bar-track">
                        <div 
                          className={`bar-fill ${isBest && bikes.length > 1 ? 'highlight' : ''}`} 
                          style={{ width: `${(1.2 - (value / maxWeight)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Relación Peso/Potencia */}
            <tr>
              <td className="spec-name-col">Relación Peso/Potencia</td>
              {bikes.map(bike => {
                const ratio = bike.power_hp / bike.weight_kg;
                const isBest = ratio === maxP2w;
                return (
                  <td key={bike.id} className="spec-val-col" style={isBest && bikes.length > 1 ? { color: 'var(--accent-green)' } : {}}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontWeight: 700 }}>{ratio.toFixed(3)}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CV/kg</span>
                      {isBest && bikes.length > 1 && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)', marginLeft: '0.5rem', background: 'rgba(0, 255, 102, 0.1)', padding: '1px 4px', borderRadius: '4px' }}>
                          TOP
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Altura Asiento */}
            <tr>
              <td className="spec-name-col">Altura del Asiento (mm)</td>
              {bikes.map(bike => {
                const isBest = Number(bike.seat_height_mm) === seatStats.best;
                return (
                  <td key={bike.id} className="spec-val-col">
                    <span style={{ fontWeight: isBest && bikes.length > 1 ? 700 : 500, color: isBest && bikes.length > 1 ? 'var(--accent-orange)' : 'inherit' }}>
                      {bike.seat_height_mm} mm
                    </span>
                    {isBest && bikes.length > 1 && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>(Más baja)</span>}
                  </td>
                );
              })}
            </tr>

            {/* Capacidad Combustible */}
            <tr>
              <td className="spec-name-col">Depósito Gasolina (L)</td>
              {bikes.map(bike => {
                const isBest = Number(bike.fuel_capacity_l) === fuelStats.best;
                return (
                  <td key={bike.id} className="spec-val-col">
                    {bike.fuel_capacity_l} L
                  </td>
                );
              })}
            </tr>

            {/* Dificultad / Licencia */}
            <tr>
              <td className="spec-name-col">Perfil de Conductor</td>
              {bikes.map(bike => (
                <td key={bike.id} className="spec-val-col">
                  <span style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 600,
                    color: bike.difficulty.includes('A2') || bike.difficulty.includes('B') ? 'var(--accent-green)' : bike.difficulty.includes('Avanzado') ? 'var(--accent-orange)' : 'var(--accent-red)'
                  }}>
                    {bike.difficulty}
                  </span>
                </td>
              ))}
            </tr>

            {/* Precio Original (PVP) */}
            <tr>
              <td className="spec-name-col">Precio Nuevo (PVP)</td>
              {bikes.map(bike => {
                const isBest = Number(bike.price_new_eur) === priceNewStats.best;
                return (
                  <td key={bike.id} className="spec-val-col" style={isBest && bikes.length > 1 ? { color: 'var(--accent-green)' } : {}}>
                    <span style={{ fontWeight: 700 }}>{bike.price_new_eur?.toLocaleString()} €</span>
                    {isBest && bikes.length > 1 && <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)', marginLeft: '0.3rem' }}>(Ahorro)</span>}
                  </td>
                );
              })}
            </tr>

            {/* Precio Promedio Ocasión */}
            <tr>
              <td className="spec-name-col">Precio Segunda Mano (Prom.)</td>
              {bikes.map(bike => {
                const isBest = Number(bike.price_used_avg_eur) === priceUsedStats.best;
                return (
                  <td key={bike.id} className="spec-val-col" style={isBest && bikes.length > 1 ? { color: 'var(--accent-green)' } : {}}>
                    <span style={{ fontWeight: 700 }}>~{bike.price_used_avg_eur?.toLocaleString()} €</span>
                    {isBest && bikes.length > 1 && <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)', marginLeft: '0.3rem' }}>(Más económico)</span>}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
