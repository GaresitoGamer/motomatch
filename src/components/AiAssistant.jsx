import React, { useState, useEffect, useRef } from 'react';
import { Cpu, AlertTriangle, AlertCircle, Award, CheckCircle } from 'lucide-react';

export default function AiAssistant({ evaluation }) {
  const { title, mismatches, analysis, verdict, keyComparisons, status } = evaluation;
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  // Efecto de Typewriter al cambiar el análisis
  useEffect(() => {
    if (!analysis) return;
    
    // Detener animación previa
    if (timerRef.current) clearInterval(timerRef.current);
    
    setTypedText('');
    setIsTyping(true);
    indexRef.current = 0;
    
    const textToType = analysis;
    const speed = textToType.length > 500 ? 5 : 12; // Acelerar si el texto es muy largo
    
    timerRef.current = setInterval(() => {
      if (indexRef.current < textToType.length) {
        // Añadir de 2 en 2 caracteres para que no tarde demasiado en textos largos
        const increment = textToType.length > 500 ? 3 : 1;
        const nextIndex = Math.min(textToType.length, indexRef.current + increment);
        const chunk = textToType.slice(0, nextIndex);
        
        setTypedText(chunk);
        indexRef.current = nextIndex;
      } else {
        clearInterval(timerRef.current);
        setIsTyping(false);
      }
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [analysis]);

  // Formateador simple de markdown básico
  const formatMarkdown = (text) => {
    if (!text) return '';
    
    let html = text;
    
    // Reemplazar encabezados ###
    html = html.replace(/^### (.*$)/gim, '<h3 class="ai-heading">$1</h3>');
    
    // Reemplazar negrita **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Reemplazar viñetas * text
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    
    // Reemplazar saltos de línea por <br/>
    html = html.replace(/\n/g, '<br/>');
    
    // Envolver bloques de viñetas <li> en <ul>
    // Nota: Esto es un formateador básico para que no rompa el diseño
    if (html.includes('<li>')) {
      // Un hack simple para envolver elementos contiguos de listas
      html = html.replace(/(<li>.*<\/li>)/g, '<ul class="ai-list">$1</ul>');
    }
    
    return html;
  };

  return (
    <div className="ai-section">
      <div className="ai-card glass-panel slide-up-anim">
        <div className="ai-header">
          <div className="ai-title">
            <Cpu size={18} className="fade-in-anim" style={{ color: 'var(--accent-cyan)' }} />
            <span>MotoMatch AI</span>
          </div>
          <div className="ai-status-badge">
            <span className="ai-pulse-dot" style={{ backgroundColor: isTyping ? 'var(--accent-orange)' : 'var(--accent-green)' }}></span>
            <span>{isTyping ? 'Analizando...' : 'Online'}</span>
          </div>
        </div>

        {/* Banderas de Alerta / Incompatibilidades */}
        {mismatches && mismatches.length > 0 && (
          <div className="ai-mismatches-container">
            {mismatches.map((mismatch, idx) => (
              <div key={idx} className={`ai-warning-box ${mismatch.severity}`} style={{ animationDelay: `${idx * 0.1}s` }}>
                <span className="ai-warning-icon">
                  {mismatch.severity === 'danger' ? <AlertCircle color="var(--accent-red)" size={18} /> : <AlertTriangle color="var(--accent-orange)" size={18} />}
                </span>
                <div className="ai-warning-content">
                  <h4>{mismatch.title}</h4>
                  <p>{mismatch.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tarjetas rápidas de especificaciones destacadas si está comparando */}
        {status === 'compared' && keyComparisons && keyComparisons.length > 0 && (
          <div className="key-metrics-banner slide-up-anim">
            {keyComparisons.map((metric, idx) => (
              <div key={idx} className="key-metric-badge">
                <div className="key-metric-label">{metric.label}</div>
                <div className="key-metric-value">{metric.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Texto del informe con efecto typewriter */}
        <div className="ai-analysis-text">
          <div dangerouslySetInnerHTML={{ __html: formatMarkdown(typedText) }} />
          {isTyping && <span className="typing-cursor"></span>}
        </div>

        {/* Tarjetas de Recomendaciones del Veredicto */}
        {verdict && !isTyping && (
          <div className="verdict-box fade-in-anim">
            <h4 className="verdict-title">Veredicto de MotoMatch AI</h4>
            <div className="verdict-grid">
              {verdict.options ? (
                verdict.options.map((opt, idx) => (
                  <div key={idx} className="verdict-card">
                    <div className="verdict-profile">{opt.profile}</div>
                    <div className="verdict-choice">{opt.choice}</div>
                    <div className="verdict-reason">{opt.reason}</div>
                  </div>
                ))
              ) : (
                <div className="verdict-card" style={{ gridColumn: 'span 2' }}>
                  <div className="verdict-profile">Recomendación</div>
                  <div className="verdict-choice">Información de la Unidad</div>
                  <div className="verdict-reason">{verdict.recommendation}</div>
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {verdict.pros.map((p, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <CheckCircle size={12} color="var(--accent-green)" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
