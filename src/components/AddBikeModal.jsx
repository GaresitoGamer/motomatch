import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AddBikeModal({ onClose, onAddBike }) {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    category: 'Naked',
    engine_cc: '',
    power_hp: '',
    torque_nm: '',
    weight_kg: '',
    seat_height_mm: '',
    fuel_capacity_l: '',
    price_new_eur: '',
    price_used_avg_eur: '',
    difficulty: 'Intermedio',
    description: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors as user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const getCategoryEmoji = (category) => {
    switch (category) {
      case 'Sport': return '🏍️';
      case 'Naked': return '⚡';
      case 'Trail': return '⛰️';
      case 'Cruiser': return '🦅';
      case 'Scooter': return '🛵';
      case 'Touring': return '🗺️';
      default: return '🏍️';
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.brand.trim()) tempErrors.brand = 'La marca es obligatoria';
    if (!formData.model.trim()) tempErrors.model = 'El modelo es obligatorio';
    
    const numFields = [
      'engine_cc', 'power_hp', 'torque_nm', 'weight_kg', 
      'seat_height_mm', 'fuel_capacity_l', 'price_new_eur', 'price_used_avg_eur'
    ];
    
    numFields.forEach(field => {
      const val = formData[field];
      if (val === '' || isNaN(val) || Number(val) <= 0) {
        tempErrors[field] = 'Debe ser un número válido';
      }
    });

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Convertir campos numéricos
    const formattedBike = {
      id: `custom-${Date.now()}`,
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      year: parseInt(formData.year),
      category: formData.category,
      engine_cc: parseInt(formData.engine_cc),
      power_hp: parseFloat(formData.power_hp),
      torque_nm: parseFloat(formData.torque_nm),
      weight_kg: parseInt(formData.weight_kg),
      seat_height_mm: parseInt(formData.seat_height_mm),
      fuel_capacity_l: parseFloat(formData.fuel_capacity_l),
      price_new_eur: parseInt(formData.price_new_eur),
      price_used_avg_eur: parseInt(formData.price_used_avg_eur),
      difficulty: formData.difficulty,
      description: formData.description.trim() || 'Moto agregada manualmente por el usuario para comparación personalizada.',
      image: getCategoryEmoji(formData.category),
      isCustom: true
    };

    onAddBike(formattedBike);
  };

  return (
    <div className="modal-overlay fade-in-anim">
      <div className="modal-content glass-panel slide-up-anim">
        <div className="modal-header">
          <h3 style={{ fontSize: '1.25rem' }}>Agregar Moto Personalizada</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Marca */}
            <div className="form-group">
              <label htmlFor="brand">Marca *</label>
              <input 
                id="brand"
                type="text" 
                name="brand" 
                value={formData.brand} 
                onChange={handleChange}
                placeholder="Ej. Suzuki, Yamaha"
              />
              {errors.brand && <span style={{ fontSize: '0.7rem', color: 'var(--accent-red)' }}>{errors.brand}</span>}
            </div>

            {/* Modelo */}
            <div className="form-group">
              <label htmlFor="model">Modelo *</label>
              <input 
                id="model"
                type="text" 
                name="model" 
                value={formData.model} 
                onChange={handleChange}
                placeholder="Ej. GSX-R 600, Hornet"
              />
              {errors.model && <span style={{ fontSize: '0.7rem', color: 'var(--accent-red)' }}>{errors.model}</span>}
            </div>

            {/* Año */}
            <div className="form-group">
              <label htmlFor="year">Año</label>
              <input 
                id="year"
                type="number" 
                name="year" 
                value={formData.year} 
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>

            {/* Categoría */}
            <div className="form-group">
              <label htmlFor="category">Categoría</label>
              <select 
                id="category"
                name="category" 
                value={formData.category} 
                onChange={handleChange}
              >
                <option value="Sport">Sport (Deportiva)</option>
                <option value="Naked">Naked</option>
                <option value="Trail">Trail (Adventure)</option>
                <option value="Cruiser">Cruiser (Custom)</option>
                <option value="Scooter">Scooter</option>
                <option value="Touring">Touring (Turismo)</option>
              </select>
            </div>

            {/* Cilindrada */}
            <div className="form-group">
              <label htmlFor="engine_cc">Cilindrada (cc) *</label>
              <input 
                id="engine_cc"
                type="number" 
                name="engine_cc" 
                value={formData.engine_cc} 
                onChange={handleChange}
                placeholder="Ej. 650"
              />
              {errors.engine_cc && <span style={{ fontSize: '0.7rem', color: 'var(--accent-red)' }}>{errors.engine_cc}</span>}
            </div>

            {/* Potencia */}
            <div className="form-group">
              <label htmlFor="power_hp">Potencia (CV) *</label>
              <input 
                id="power_hp"
                type="number" 
                name="power_hp" 
                value={formData.power_hp} 
                onChange={handleChange}
                placeholder="Ej. 72"
              />
              {errors.power_hp && <span style={{ fontSize: '0.7rem', color: 'var(--accent-red)' }}>{errors.power_hp}</span>}
            </div>

            {/* Par Motor */}
            <div className="form-group">
              <label htmlFor="torque_nm">Par Motor (Nm) *</label>
              <input 
                id="torque_nm"
                type="number" 
                name="torque_nm" 
                value={formData.torque_nm} 
                onChange={handleChange}
                placeholder="Ej. 64"
              />
              {errors.torque_nm && <span style={{ fontSize: '0.7rem', color: 'var(--accent-red)' }}>{errors.torque_nm}</span>}
            </div>

            {/* Peso */}
            <div className="form-group">
              <label htmlFor="weight_kg">Peso en Lleno (kg) *</label>
              <input 
                id="weight_kg"
                type="number" 
                name="weight_kg" 
                value={formData.weight_kg} 
                onChange={handleChange}
                placeholder="Ej. 195"
              />
              {errors.weight_kg && <span style={{ fontSize: '0.7rem', color: 'var(--accent-red)' }}>{errors.weight_kg}</span>}
            </div>

            {/* Altura del asiento */}
            <div className="form-group">
              <label htmlFor="seat_height_mm">Alt. Asiento (mm) *</label>
              <input 
                id="seat_height_mm"
                type="number" 
                name="seat_height_mm" 
                value={formData.seat_height_mm} 
                onChange={handleChange}
                placeholder="Ej. 810"
              />
              {errors.seat_height_mm && <span style={{ fontSize: '0.7rem', color: 'var(--accent-red)' }}>{errors.seat_height_mm}</span>}
            </div>

            {/* Depósito combustible */}
            <div className="form-group">
              <label htmlFor="fuel_capacity_l">Depósito (L) *</label>
              <input 
                id="fuel_capacity_l"
                type="number" 
                step="0.1"
                name="fuel_capacity_l" 
                value={formData.fuel_capacity_l} 
                onChange={handleChange}
                placeholder="Ej. 15.5"
              />
              {errors.fuel_capacity_l && <span style={{ fontSize: '0.7rem', color: 'var(--accent-red)' }}>{errors.fuel_capacity_l}</span>}
            </div>

            {/* Precio Nuevo */}
            <div className="form-group">
              <label htmlFor="price_new_eur">Precio Nuevo (€) *</label>
              <input 
                id="price_new_eur"
                type="number" 
                name="price_new_eur" 
                value={formData.price_new_eur} 
                onChange={handleChange}
                placeholder="Ej. 8500"
              />
              {errors.price_new_eur && <span style={{ fontSize: '0.7rem', color: 'var(--accent-red)' }}>{errors.price_new_eur}</span>}
            </div>

            {/* Precio Segunda Mano */}
            <div className="form-group">
              <label htmlFor="price_used_avg_eur">Precio Ocasión (€) *</label>
              <input 
                id="price_used_avg_eur"
                type="number" 
                name="price_used_avg_eur" 
                value={formData.price_used_avg_eur} 
                onChange={handleChange}
                placeholder="Ej. 5200"
              />
              {errors.price_used_avg_eur && <span style={{ fontSize: '0.7rem', color: 'var(--accent-red)' }}>{errors.price_used_avg_eur}</span>}
            </div>

            {/* Conductor */}
            <div className="form-group full-width">
              <label htmlFor="difficulty">Licencia / Conductor</label>
              <select 
                id="difficulty"
                name="difficulty" 
                value={formData.difficulty} 
                onChange={handleChange}
              >
                <option value="Principiante (B / A1)">Principiante (B / A1) - Hasta 125cc</option>
                <option value="Principiante (A2)">Principiante (A2) - Carnet Limitado</option>
                <option value="Intermedio">Intermedio (Carnet A / Experiencia moderada)</option>
                <option value="Avanzado">Avanzado (Alto rendimiento / Pesadas)</option>
                <option value="Experto">Experto (Máximo caballaje / Circuitos / Enduro técnico)</option>
              </select>
            </div>

            {/* Descripción */}
            <div className="form-group full-width">
              <label htmlFor="description">Descripción / Notas</label>
              <textarea 
                id="description"
                name="description" 
                value={formData.description} 
                onChange={handleChange}
                placeholder="Describe brevemente el estado de la moto, kilómetros o características especiales..."
                rows="2"
              />
            </div>
          </div>
          
          <button type="submit" className="form-submit-btn">
            Agregar a la Comparativa
          </button>
        </form>
      </div>
    </div>
  );
}
