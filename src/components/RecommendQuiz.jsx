import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Award, Sparkles, AlertCircle, CheckCircle2, User, HelpCircle } from 'lucide-react';
import { calculateMatchScore } from '../utils/quizLogic'; // we will create this helper

export default function RecommendQuiz({ bikes, onAddBike, onClose }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    license: '',
    budget: 8000,
    height: '',
    usage: ''
  });
  const [results, setResults] = useState([]);

  const stepsCount = 4;

  const handleSelectOption = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < stepsCount) {
      setStep(prev => prev + 1);
    } else {
      // Calculate scores
      calculateResults();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const calculateResults = () => {
    const scoredBikes = bikes.map(bike => {
      const score = calculateMatchScore(bike, profile);
      
      // Generate match reasons
      const reasons = [];
      if (score > 0) {
        // License match description
        if (profile.license === 'B/A1') reasons.push('Ideal para carnet B o A1 (125cc).');
        else if (profile.license === 'A2') {
          if (bike.difficulty.includes('A2')) reasons.push('Diseñada específicamente para carnet A2.');
          else reasons.push('Apta o limitable para carnet A2.');
        } else reasons.push('Exprime todo el potencial con tu carnet A.');

        // Budget match description
        const bikePrice = bike.price_used_avg_eur || 0;
        if (bikePrice <= profile.budget) {
          reasons.push(`Dentro de tu presupuesto (precio promedio ~${bikePrice.toLocaleString()} €).`);
        }

        // Height match description
        const seat = bike.seat_height_mm;
        if (profile.height === 'low' && seat < 800) reasons.push(`Asiento muy accesible (${seat} mm) para tu estatura.`);
        else if (profile.height === 'tall' && seat >= 830) reasons.push(`Ergonomía espaciosa (${seat} mm) ideal para pilotos altos.`);
        else if (profile.height === 'medium') reasons.push(`Altura de asiento cómoda (${seat} mm).`);

        // Usage match description
        if (profile.usage === 'urbano') reasons.push('Excelente maniobrabilidad y consumos urbanos.');
        else if (profile.usage === 'rutas') reasons.push('Gran respuesta de motor y chasis deportivo.');
        else if (profile.usage === 'viajes') reasons.push('Excelente protección contra el viento y confort.');
        else if (profile.usage === 'aventura') reasons.push('Suspensiones de largo recorrido aptas para tierra.');
      }

      return {
        ...bike,
        score,
        reasons: reasons.slice(0, 3) // max 3 reasons
      };
    });

    // Filter out 0% match scores and sort descending
    const sorted = scoredBikes
      .filter(b => b.score > 40)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // top 3

    setResults(sorted);
    setStep(5); // Results step
  };

  const handleRestart = () => {
    setProfile({
      license: '',
      budget: 8000,
      height: '',
      usage: ''
    });
    setResults([]);
    setStep(1);
  };

  const isStepValid = () => {
    if (step === 1) return profile.license !== '';
    if (step === 2) return profile.budget > 0;
    if (step === 3) return profile.height !== '';
    if (step === 4) return profile.usage !== '';
    return true;
  };

  return (
    <div className="modal-overlay quiz-modal-overlay">
      <div className="modal-content quiz-modal-content glass-panel fade-in-anim">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close quiz">
          <X size={18} />
        </button>

        {step <= stepsCount && (
          <div className="quiz-header">
            <span className="quiz-tag">Recomendador Inteligente</span>
            <h2>Encuentra tu Moto Ideal</h2>
            <div className="quiz-progress-bar-container">
              <div className="quiz-progress-label">Paso {step} de {stepsCount}</div>
              <div className="quiz-progress-track">
                <div 
                  className="quiz-progress-fill" 
                  style={{ width: `${(step / stepsCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: License */}
        {step === 1 && (
          <div className="quiz-step-content slide-in-anim">
            <h3>¿Qué carnet de conducir tienes?</h3>
            <p className="step-desc">Esto filtrará las motos por potencia y cilindrada legal.</p>
            <div className="choice-grid">
              <button 
                className={`choice-card ${profile.license === 'B/A1' ? 'active' : ''}`}
                onClick={() => handleSelectOption('license', 'B/A1')}
              >
                <div className="choice-icon">🛵</div>
                <div className="choice-info">
                  <h4>Carnet B / A1</h4>
                  <p>Motos y Scooters hasta 125cc o 15 CV. Ideal para ciudad.</p>
                </div>
              </button>

              <button 
                className={`choice-card ${profile.license === 'A2' ? 'active' : ''}`}
                onClick={() => handleSelectOption('license', 'A2')}
              >
                <div className="choice-icon">🔰</div>
                <div className="choice-info">
                  <h4>Carnet A2</h4>
                  <p>Motos de potencia media hasta 47 CV (35 kW). Limitables a 95 CV.</p>
                </div>
              </button>

              <button 
                className={`choice-card ${profile.license === 'A' ? 'active' : ''}`}
                onClick={() => handleSelectOption('license', 'A')}
              >
                <div className="choice-icon">🏍️</div>
                <div className="choice-info">
                  <h4>Carnet A</h4>
                  <p>Cualquier motocicleta sin límite de potencia ni peso.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Budget */}
        {step === 2 && (
          <div className="quiz-step-content slide-in-anim">
            <h3>¿Cuál es tu presupuesto máximo?</h3>
            <p className="step-desc">Filtrará los precios de motos usadas de segunda mano en el mercado.</p>
            <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
              <div className="budget-slider-val">
                {profile.budget.toLocaleString()} €
              </div>
              <input 
                type="range" 
                min="2000" 
                max="25000" 
                step="500" 
                className="budget-slider"
                value={profile.budget}
                onChange={(e) => handleSelectOption('budget', Number(e.target.value))}
              />
              <div className="budget-slider-ranges">
                <span>2,000 €</span>
                <span>10,000 €</span>
                <span>20,000 €</span>
                <span>25,000 €+</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Height */}
        {step === 3 && (
          <div className="quiz-step-content slide-in-anim">
            <h3>¿Cuánto mides de altura?</h3>
            <p className="step-desc">La altura es clave para llegar cómodamente al suelo con los pies.</p>
            <div className="choice-grid">
              <button 
                className={`choice-card ${profile.height === 'low' ? 'active' : ''}`}
                onClick={() => handleSelectOption('height', 'low')}
              >
                <div className="choice-icon">📏</div>
                <div className="choice-info">
                  <h4>Menos de 1.70m</h4>
                  <p>Favorece asientos bajos (&lt; 800mm) para un apoyo firme y seguro.</p>
                </div>
              </button>

              <button 
                className={`choice-card ${profile.height === 'medium' ? 'active' : ''}`}
                onClick={() => handleSelectOption('height', 'medium')}
              >
                <div className="choice-icon">🧍</div>
                <div className="choice-info">
                  <h4>Entre 1.70m y 1.85m</h4>
                  <p>Altura estándar. Llegarás bien a la gran mayoría de motos.</p>
                </div>
              </button>

              <button 
                className={`choice-card ${profile.height === 'tall' ? 'active' : ''}`}
                onClick={() => handleSelectOption('height', 'tall')}
              >
                <div className="choice-icon">🦒</div>
                <div className="choice-info">
                  <h4>Más de 1.85m</h4>
                  <p>Favorece motos altas y trail para evitar flexionar demasiado las rodillas.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Usage */}
        {step === 4 && (
          <div className="quiz-step-content slide-in-anim">
            <h3>¿Cuál será el uso principal de la moto?</h3>
            <p className="step-desc">Determina el estilo o categoría ideal para tus trayectos.</p>
            <div className="choice-grid">
              <button 
                className={`choice-card ${profile.usage === 'urbano' ? 'active' : ''}`}
                onClick={() => handleSelectOption('usage', 'urbano')}
              >
                <div className="choice-icon">🏢</div>
                <div className="choice-info">
                  <h4>Ciudad / Diario</h4>
                  <p>Movilidad ágil, cómoda, fácil mantenimiento y bajo consumo.</p>
                </div>
              </button>

              <button 
                className={`choice-card ${profile.usage === 'rutas' ? 'active' : ''}`}
                onClick={() => handleSelectOption('usage', 'rutas')}
              >
                <div className="choice-icon">🏁</div>
                <div className="choice-info">
                  <h4>Curvas / Rutas de Fin de Semana</h4>
                  <p>Diversión, agilidad deportiva, potencia y paso por curva rápido.</p>
                </div>
              </button>

              <button 
                className={`choice-card ${profile.usage === 'viajes' ? 'active' : ''}`}
                onClick={() => handleSelectOption('usage', 'viajes')}
              >
                <div className="choice-icon">💼</div>
                <div className="choice-info">
                  <h4>Viajar / Turismo Largo</h4>
                  <p>Comodidad para el piloto y acompañante, protección al viento y equipaje.</p>
                </div>
              </button>

              <button 
                className={`choice-card ${profile.usage === 'aventura' ? 'active' : ''}`}
                onClick={() => handleSelectOption('usage', 'aventura')}
              >
                <div className="choice-icon">⛰️</div>
                <div className="choice-info">
                  <h4>Aventura Mixta (Asfalto + Tierra)</h4>
                  <p>Motos Trail polivalentes preparadas para salir a caminos de tierra.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Results */}
        {step === 5 && (
          <div className="quiz-step-content slide-in-anim results-step">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div className="choice-icon" style={{ fontSize: '2.5rem', display: 'inline-block', marginBottom: '0.5rem' }}>✨</div>
              <h2>Motos Recomendadas para ti</h2>
              <p className="step-desc" style={{ maxWidth: '450px', margin: '0 auto' }}>
                Tu perfil de conducción ha sido analizado por MotoMatch AI. Aquí tienes las mejores opciones del catálogo.
              </p>
            </div>

            {results.length === 0 ? (
              <div className="no-matches glass-panel">
                <AlertCircle size={28} color="var(--accent-orange)" />
                <h4>No se encontraron coincidencias perfectas</h4>
                <p>
                  Tu presupuesto es un poco ajustado para las motos de los perfiles elegidos. Intenta subir el presupuesto o modificar los filtros de carnet/uso.
                </p>
                <button className="restart-quiz-btn" onClick={handleRestart} style={{ marginTop: '1rem' }}>
                  Volver a Empezar
                </button>
              </div>
            ) : (
              <div className="recommendations-grid">
                {results.map(bike => (
                  <div key={bike.id} className={`recommendation-card glass-panel ${bike.category.toLowerCase()}`}>
                    <div className="recommendation-header">
                      <img 
                        src={bike.image_url} 
                        alt="" 
                        className="recommendation-thumbnail" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="recommendation-title-wrap">
                        <div className="match-score-badge">
                          <Sparkles size={10} /> {bike.score}% Coincidencia
                        </div>
                        <h4>{bike.brand} {bike.model}</h4>
                        <span className={`category-badge badge-${bike.category}`}>{bike.category}</span>
                      </div>
                    </div>

                    <div className="recommendation-reasons">
                      {bike.reasons.map((reason, index) => (
                        <div key={index} className="reason-item">
                          <CheckCircle2 size={12} color="var(--accent-green)" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>

                    <div className="recommendation-footer">
                      <div className="recommendation-price">
                        <span>Segunda Mano aprox:</span>
                        <strong>~{bike.price_used_avg_eur.toLocaleString()} €</strong>
                      </div>
                      <button 
                        className="add-recommended-btn"
                        onClick={() => onAddBike(bike)}
                      >
                        Añadir a Comparar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {results.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button className="restart-quiz-btn" onClick={handleRestart}>
                  Hacer el Test de Nuevo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Buttons Nav */}
        {step <= stepsCount && (
          <div className="quiz-footer-buttons">
            <button 
              className="quiz-nav-btn back" 
              onClick={handleBack}
              disabled={step === 1}
            >
              <ChevronLeft size={16} /> Atrás
            </button>

            <button 
              className="quiz-nav-btn next" 
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              {step === stepsCount ? 'Ver Resultados' : 'Siguiente'} <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
