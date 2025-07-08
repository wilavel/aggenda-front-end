import React from 'react';

const socialLinks = [
  {
    href: 'https://facebook.com/',
    icon: 'facebook',
    label: 'Facebook',
    color: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    href: 'https://instagram.com/',
    icon: 'instagram',
    label: 'Instagram',
    color: 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600',
  },
  {
    href: 'https://wa.me/',
    icon: 'whatsapp',
    label: 'WhatsApp',
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    href: 'https://linkedin.com/',
    icon: 'linkedin',
    label: 'LinkedIn',
    color: 'bg-blue-800 hover:bg-blue-900',
  },
];

const iconMap = {
  facebook: 'facebook',
  instagram: 'instagram',
  whatsapp: 'whatsapp',
  linkedin: 'linkedin',
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
        <span className="material-icons">
          {iconMap[item.icon]}
        </span>
      </a>
    ))}
  </div>
);

export default FloatingSocialButtons;
