import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FooterUserForm from './FooterUserForm';
import ServiceModal from './ServiceModal';
import logo from '../assets/logo_footer.png';
import odontologiaImg from '../assets/odontologia.jpg';
import esteticaImg from '../assets/estetica.jpg';
import ortodonciaImg from '../assets/ortodoncia.jpg';
import odontopediatriaImg from '../assets/odontopediatria.jpg';
import implantesImg from '../assets/implantes.jpg';
import endodonciaImg from '../assets/endodoncia.jpg';


const HomePage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cierra el menú móvil al hacer click en una opción
  const handleMobileMenuClick = (sectionId) => {
    setMobileMenuOpen(false);
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <> 
    {/* Header */}
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Logo eliminado del header */}
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a
  className="text-gray-600 hover:text-blue-500 transition duration-300 cursor-pointer"
  onClick={() => {
    const section = document.getElementById('inicio');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  }}
>Inicio</a>
            <a
  className="text-gray-600 hover:text-blue-500 transition duration-300 cursor-pointer"
  onClick={() => {
    const section = document.getElementById('servicios');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  }}
>Servicios</a>
            <a
  className="text-gray-600 hover:text-blue-500 transition duration-300 cursor-pointer"
  onClick={() => {
    const section = document.getElementById('nosotros');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  }}
>Nosotros</a>
            <a
  className="text-gray-600 hover:text-blue-500 transition duration-300 cursor-pointer"
  onClick={() => {
    const section = document.getElementById('blog');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  }}
>Blog</a>
            <a
  className="text-gray-600 hover:text-blue-500 transition duration-300 cursor-pointer"
  onClick={() => {
    const section = document.getElementById('contacto');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  }}
>Contacto</a>
            <Link to="/login" className="ml-6 bg-secondary text-white font-bold py-2 px-6 rounded-full hover:bg-primary transition duration-300 font-sans shadow-lg">
              Iniciar Sesión
            </Link>
          </nav>
          {/* Botón menú móvil */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Abrir menú"
          >
            <span className="material-icons text-gray-600">menu</span>
          </button>
        </div>
        {/* Menú móvil dropdown */}
        </div>
      {mobileMenuOpen && (
        <div className="md:hidden absolute left-0 right-0 mt-2 bg-white shadow-lg rounded-b-lg z-50 animate-fade-in-down">
          <nav className="flex flex-col items-center space-y-4 py-4">
            <a
              className="text-gray-600 hover:text-blue-500 transition duration-300 cursor-pointer"
              onClick={() => handleMobileMenuClick('inicio')}
            >Inicio</a>
            <a
              className="text-gray-600 hover:text-blue-500 transition duration-300 cursor-pointer"
              onClick={() => handleMobileMenuClick('servicios')}
            >Servicios</a>
            <a
              className="text-gray-600 hover:text-blue-500 transition duration-300 cursor-pointer"
              onClick={() => handleMobileMenuClick('nosotros')}
            >Nosotros</a>
            <a
              className="text-gray-600 hover:text-blue-500 transition duration-300 cursor-pointer"
              onClick={() => handleMobileMenuClick('blog')}
            >Blog</a>
            <a
              className="text-gray-600 hover:text-blue-500 transition duration-300 cursor-pointer"
              onClick={() => handleMobileMenuClick('contacto')}
            >Contacto</a>
            <Link
              to="/login"
              className="bg-secondary text-white font-bold py-2 px-6 rounded-full hover:bg-primary transition duration-300 font-sans shadow-lg w-10/12 text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Iniciar Sesión
            </Link>
          </nav>
        </div>
      )}
    </header>
    <main>
      <div id="inicio"></div>
      <section className="w-full">
  <img
    alt="Banner Central Dent - Niños y adultos sonriendo"
    src={require('../assets/banner-central-dent.png')}
    width={1066}
    height={303}
    className="mx-auto my-4 rounded-lg shadow-md"
  />
</section>
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-6">
          <h2 id="servicios" className="text-3xl font-bold text-center text-blue-900 mb-12">Nuestros Servicios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-xl transition duration-300 cursor-pointer"
  onClick={() => {
    setModalContent({
      title: 'Odontología General',
      description: 'Ofrecemos atención integral en salud oral, prevención, diagnóstico y tratamientos para toda la familia. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      image: odontologiaImg
    });
    setModalOpen(true);
  }}
>
  <span className="material-icons text-blue-500 text-5xl mb-4">health_and_safety</span>
  <h3 className="text-xl font-semibold text-gray-800 mb-2">Odontología General</h3>
  <p className="text-gray-600">Desde limpiezas y revisiones hasta empastes y extracciones, mantenemos tu sonrisa saludable.</p>
</div>
<div
  className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-xl transition duration-300 cursor-pointer"
  onClick={() => {
    setModalContent({
      title: 'Estética Dental',
      description: 'Mejora tu sonrisa con nuestros tratamientos de estética dental: blanqueamiento, carillas y más. Lorem ipsum dolor sit amet, consectetur.',
      image: esteticaImg
    });
    setModalOpen(true);
  }}
>
  <span className="material-icons text-blue-500 text-5xl mb-4">auto_awesome</span>
  <h3 className="text-xl font-semibold text-gray-800 mb-2">Estética Dental</h3>
  <p className="text-gray-600">Blanqueamientos, carillas y diseños de sonrisa para que luzcas radiante.</p>
</div>
<div
  className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-xl transition duration-300 cursor-pointer"
  onClick={() => {
    setModalContent({
      title: 'Ortodoncia',
      description: 'Corrige la posición de tus dientes con brackets tradicionales o alineadores invisibles. Tratamientos personalizados para todas las edades.',
      image: ortodonciaImg
    });
    setModalOpen(true);
  }}
>
  <span className="material-icons text-blue-500 text-5xl mb-4">tag_faces</span>
  <h3 className="text-xl font-semibold text-gray-800 mb-2">Ortodoncia</h3>
  <p className="text-gray-600">Corrige la posición de tus dientes con brackets tradicionales o alineadores invisibles.</p>
</div>
<div
  className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-xl transition duration-300 cursor-pointer"
  onClick={() => {
    setModalContent({
      title: 'Odontopediatría',
      description: 'Cuidado dental especializado para los más pequeños de la casa en un ambiente amigable y divertido. Prevención y educación desde la infancia.',
      image: odontopediatriaImg
    });
    setModalOpen(true);
  }}
>
  <span className="material-icons text-blue-500 text-5xl mb-4">child_friendly</span>
  <h3 className="text-xl font-semibold text-gray-800 mb-2">Odontopediatría</h3>
  <p className="text-gray-600">Cuidado dental especializado para los más pequeños de la casa en un ambiente amigable.</p>
</div>
<div
  className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-xl transition duration-300 cursor-pointer"
  onClick={() => {
    setModalContent({
      title: 'Implantes Dentales',
      description: 'Recupera la función y estética de tus dientes perdidos con soluciones permanentes y seguras. Implantes de alta calidad para una sonrisa natural.',
      image: implantesImg
    });
    setModalOpen(true);
  }}
>
  <span className="material-icons text-blue-500 text-5xl mb-4">medication</span>
  <h3 className="text-xl font-semibold text-gray-800 mb-2">Implantes Dentales</h3>
  <p className="text-gray-600">Recupera la función y estética de tus dientes perdidos con soluciones permanentes.</p>
</div>
<div
  className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-xl transition duration-300 cursor-pointer"
  onClick={() => {
    setModalContent({
      title: 'Endodoncia',
      description: 'Tratamientos de conducto para salvar tus dientes y aliviar el dolor. Atención experta y tecnología avanzada para tu salud dental.',
      image: endodonciaImg
    });
    setModalOpen(true);
  }}
>
  <span className="material-icons text-blue-500 text-5xl mb-4">healing</span>
  <h3 className="text-xl font-semibold text-gray-800 mb-2">Endodoncia</h3>
  <p className="text-gray-600">Tratamientos de conducto para salvar tus dientes y aliviar el dolor.</p>
</div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-white">
  <div className="container mx-auto px-6">
    <h2 id="nosotros" className="text-3xl font-bold text-center text-blue-900 mb-12">Nosotros</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Aquí van las cards de servicios, puedes conservar el contenido que ya tienes */}
    </div>
  </div>
</section>

<section className="py-16 bg-white">
  <div className="container mx-auto px-6">
    <div className="flex flex-col lg:flex-row items-center">
      <div className="lg:w-1/2">
        <img alt="Dentista mujer atendiendo a un paciente" className="rounded-lg shadow-lg w-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnWPwK38NF8CAkhczkSA-Lz7jJJTgTgmwB44UQ9_7Qwy7oHbdxw5GKDUIgDXRGlGRcS_UieH_9SY3BM23Ox6zHug--0FNi19F9SIM0Xo6-3cVoHn59E7sruuqKHeqxhHeANe2Pr5NfX8rUEB4q5XcVuZ9SFC3Y9wfUUrOJ7HMcBE9241q27XXy667SiAiumqmxrr5f6inKW5msZxiV6r0VIl1s1BhkzDViWpKgI82MGL5B8FB6K6ILlq5J1YhZ4t8mvXeE7Jpk4xs" />
      </div>
      <div className="lg:w-1/2 lg:pl-12 mt-8 lg:mt-0">
        <h2 className="text-3xl font-bold text-blue-900 mb-4">Comprometidos con tu Bienestar</h2>
        <p className="text-gray-600 mb-4">En Central Dent, combinamos la experiencia de nuestros profesionales con la calidez humana. Entendemos que cada paciente es único, por eso ofrecemos planes de tratamiento personalizados que se ajustan a tus necesidades y expectativas.</p>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-center"><span className="material-icons text-blue-500 mr-2">check_circle</span>Tecnología de punta</li>
          <li className="flex items-center"><span className="material-icons text-blue-500 mr-2">check_circle</span>Especialistas certificados</li>
          <li className="flex items-center"><span className="material-icons text-blue-500 mr-2">check_circle</span>Atención personalizada</li>
          <li className="flex items-center"><span className="material-icons text-blue-500 mr-2">check_circle</span>Ambiente cómodo y seguro</li>
        </ul>
      </div>
    </div>
  </div>
</section>

      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-6">
          <h2 id="contacto" className="text-3xl font-bold text-center text-blue-900 mb-12">Encuéntranos</h2>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/2">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Sede Americas Central</h3>
                <p className="text-gray-600 mb-4">Carrera 69 A # 4-11 sur</p>
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d994.2155034212853!2d-74.1295584!3d4.6186948999999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9f41c1fd8b23%3A0x81cfec2bb468f7f7!2sCentralDent!5e0!3m2!1ses!2sus!4v1752070085336!5m2!1ses!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Sede Iconika 68</h3>
                <p className="text-gray-600 mb-4">Avenida Carera 68 # 5-75  Local 301</p>
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">

                  <iframe
                    src="https://www.google.com/maps?q=Avenida+Carrera+68+%23+5-75+Local+301,+Bogot%C3%A1,+Colombia&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    <footer className="bg-blue-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <ServiceModal 
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  title={modalContent.title}
  description={modalContent.description}
  image={modalContent.image}
/>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-start">
  <img src={logo} alt="Central Dent Logo" className="h-16 mb-2" />
 
  <p className="text-blue-200">"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

.</p>
</div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Explorar</h4>
            <ul className="space-y-2">
  <li>
    <button
      className="text-blue-200 hover:text-white transition w-full text-left"
      onClick={() => {
        setModalContent({
          title: 'Odontología General',
          description: 'Ofrecemos atención integral en salud oral, prevención, diagnóstico y tratamientos para toda la familia. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          image: odontologiaImg
        });
        setModalOpen(true);
      }}
      type="button"
    >
      Odontología General
    </button>
  </li>
  <li>
    <button
      className="text-blue-200 hover:text-white transition w-full text-left"
      onClick={() => {
        setModalContent({
          title: 'Estética Dental',
          description: 'Mejora tu sonrisa con nuestros tratamientos de estética dental: blanqueamiento, carillas y más. Lorem ipsum dolor sit amet, consectetur.',
          image: esteticaImg
        });
        setModalOpen(true);
      }}
      type="button"
    >
      Estética Dental
    </button>
  </li>
  <li><a className="text-blue-200 hover:text-white" href="#">Blog</a></li>
</ul>
          </div>
         
          <div>
            <h4 className="font-semibold text-lg mb-4">Contacto</h4>
            <div className="flex space-x-4 mb-4">
            <FooterUserForm />
            </div>
           
          </div>
        </div>
      </div>
      <div className="border-t border-blue-800 mt-8 pt-6 text-center text-blue-300 text-sm">
        2024 Central Dent. Todos los derechos reservados.
      </div>
    </footer>
    </>
  );
}

export default HomePage;
