import React from 'react';
import { FaWhatsapp, FaLinkedin } from 'react-icons/fa';

const socialLinks = [
  {
    href: 'https://www.facebook.com/centraldent.xavier.amazo.dominguez.od',
    icon: 'facebook',
    label: 'Facebook',
    color: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    href: 'https://www.instagram.com/central__dent/',
    icon: 'instagram',
    label: 'Instagram',
    color: 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600',
  },
  {
    href: 'https://wa.me/573175954012',
    icon: 'whatsapp',
    label: 'WhatsApp',
    color: 'bg-green-500 hover:bg-green-600',
  },
  
];

const iconMap = {
  facebook: <span className="material-icons">facebook</span>,
  instagram: <span className="material-icons">instagram</span>,
  whatsapp: <FaWhatsapp />,
  linkedin: <FaLinkedin />,
};

const FloatingSocialButtons = () => (
  <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
    {socialLinks.map((item) => (
      <a
        key={item.icon}
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={item.label}
        className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg text-white text-3xl ${item.color} transition-colors duration-300`}
      >
        {iconMap[item.icon]}
      </a>
    ))}
  </div>
);

export default FloatingSocialButtons;
