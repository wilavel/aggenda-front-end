import React from 'react';
import banner from '../assets/banner-central-dent.png';

const ServiceModal = ({ open, onClose, title, description, image }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-blue-600 text-2xl font-bold focus:outline-none"
          aria-label="Cerrar"
        >
          &times;
        </button>
        <img src={image} alt={title} className="rounded-lg mb-4 w-full h-40 object-cover" />
        <h3 className="text-xl font-bold mb-2 text-blue-900">{title}</h3>
        <p className="text-gray-700 mb-2">{description}</p>
      </div>
    </div>
  );
};

export default ServiceModal;
