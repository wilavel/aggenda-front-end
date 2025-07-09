import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const FooterUserForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document_number: '',
    document_type: 'C.C',
    group: 'Clients', // Paciente por defecto
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      // Validar campos requeridos
      if (!formData.name || !formData.email || !formData.document_number) {
        throw new Error('Por favor complete todos los campos requeridos.');
      }
      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Ingrese un email válido.');
      }
      // Enviar petición
      await axios.post(`${API_URL}/users`, formData);
      setSuccess('¡Usuario paciente creado exitosamente!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        document_number: '',
        document_type: 'C.C',
        group: 'Clients',
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-6 p-4 bg-blue-900 rounded-lg shadow-md" onSubmit={handleSubmit}>
      <h5 className="text-white font-bold mb-2 text-center">Crea tu cuenta de paciente</h5>
      <div className="flex flex-col md:flex-row gap-2 mb-2">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nombre completo"
          className="flex-1 px-2 py-1 rounded border border-blue-400 focus:outline-none"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Correo electrónico"
          className="flex-1 px-2 py-1 rounded border border-blue-400 focus:outline-none"
          required
        />
      </div>
      <div className="flex flex-col md:flex-row gap-2 mb-2">
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Teléfono (opcional)"
          className="flex-1 px-2 py-1 rounded border border-blue-400 focus:outline-none"
        />
        <input
          type="text"
          name="document_number"
          value={formData.document_number}
          onChange={handleChange}
          placeholder="Número de documento"
          className="flex-1 px-2 py-1 rounded border border-blue-400 focus:outline-none"
          required
        />
        <select
          name="document_type"
          value={formData.document_type}
          onChange={handleChange}
          className="flex-1 px-2 py-1 rounded border border-blue-400 focus:outline-none"
        >
          <option value="C.C">C.C</option>
          <option value="T.I">T.I</option>
          <option value="C.E">C.E</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full mt-2 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-bold transition"
        disabled={loading}
      >
        {loading ? 'Creando...' : 'Crear Paciente'}
      </button>
      {success && <div className="text-green-300 text-center mt-2">{success}</div>}
      {error && <div className="text-red-300 text-center mt-2">{error}</div>}
    </form>
  );
};

export default FooterUserForm;
