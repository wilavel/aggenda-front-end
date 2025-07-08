import React from 'react';
import { Link } from 'react-router-dom';
// Logo local
// eslint-disable-next-line import/no-webpack-loader-syntax
// Si usas Vite, reemplaza require por import logo from '../assets/logo.png';


const HomePage = () => (
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
          <button className="md:hidden">
            <span className="material-icons text-gray-600">menu</span>
          </button>
        </div>
      </div>
    </header>
    <main>
      <div id="inicio"></div>
      <section className="relative bg-light">
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 p-6 lg:p-12 text-center lg:text-left">
            <img alt="Central Dent Logo" className="mx-auto mb-8 h-64 w-auto" src={require('../assets/logo.png')} />
            <p className="mt-4 text-xl font-sans text-primary">En Central Dent, nos dedicamos a cuidar tu salud bucal con la tecnología más avanzada y un equipo de especialistas apasionados.</p>
            <div className="mt-8 flex justify-center lg:justify-start space-x-4">
              <a className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-secondary transition duration-300 font-sans" href="#">Agendar Cita</a>
              <a className="bg-light text-primary font-bold py-3 px-8 rounded-full hover:bg-secondary hover:text-white transition duration-300 font-sans" href="#">Ver Servicios</a>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent"></div>
            <img alt="Grupo de amigos sonriendo en la playa" className="w-full h-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQIEFjATJ1hEW__XoiJuyZAywtSb5A3svQWyRE5eeGyyN40INA2fZY65TYQi88GMaHNnUnibttRkBCvzztYxLEQP89yhVt-G1evcRIn-b9MhQdh7VDi5YNDmIpthJ3Ad04A93rObJfQCYNfLg7uVaTFZA-cxfMc1CRzxKFHM0IT4JmM6op7HlXEuGZutAnR5jWTPSj4cTnfDNo0HKyp5WBvwWtxIG4eLXJBx13ya-B9V5sfawUIwNtQ_tqVXlFlHiZDFwrVrWxNpI" />
            <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-4 rounded-tl-lg">
              <h2 className="text-xl font-semibold">ODONTOLOGÍA ESPECIALIZADA Y GENERAL</h2>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-6">
          <h2 id="servicios" className="text-3xl font-bold text-center text-blue-900 mb-12">Nuestros Servicios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-xl transition duration-300">
              <span className="material-icons text-blue-500 text-5xl mb-4">health_and_safety</span>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Odontología General</h3>
              <p className="text-gray-600">Desde limpiezas y revisiones hasta empastes y extracciones, mantenemos tu sonrisa saludable.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-xl transition duration-300">
              <span className="material-icons text-blue-500 text-5xl mb-4">auto_awesome</span>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Estética Dental</h3>
              <p className="text-gray-600">Blanqueamientos, carillas y diseños de sonrisa para que luzcas radiante.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-xl transition duration-300">
              <span className="material-icons text-blue-500 text-5xl mb-4">tag_faces</span>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Ortodoncia</h3>
              <p className="text-gray-600">Corrige la posición de tus dientes con brackets tradicionales o alineadores invisibles.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-xl transition duration-300">
              <span className="material-icons text-blue-500 text-5xl mb-4">child_friendly</span>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Odontopediatría</h3>
              <p className="text-gray-600">Cuidado dental especializado para los más pequeños de la casa en un ambiente amigable.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-xl transition duration-300">
              <span className="material-icons text-blue-500 text-5xl mb-4">medication</span>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Implantes Dentales</h3>
              <p className="text-gray-600">Recupera la función y estética de tus dientes perdidos con soluciones permanentes.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-xl transition duration-300">
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
                    src="https://www.google.com/maps?q=Carrera+69+A+%23+4-11+sur,+Bogot%C3%A1,+Colombia&output=embed"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold text-lg mb-4">Central Dent</h4>
            <p className="text-blue-200">Tu mejor sonrisa es posible.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Explorar</h4>
            <ul className="space-y-2">
              <li><a className="text-blue-200 hover:text-white" href="#">Servicios</a></li>
              <li><a className="text-blue-200 hover:text-white" href="#">Nosotros</a></li>
              <li><a className="text-blue-200 hover:text-white" href="#">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Contacto</h4>
            <p className="text-blue-200">Carrera 69 A # 4-11 sur</p>
            <p className="text-blue-200">contacto@centraldent.com</p>
            <p className="text-blue-200">+57 3175954012</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Síguenos</h4>
            <div className="flex space-x-4">
              <a className="text-blue-200 hover:text-white transition duration-300" href="#">
                <i className="fab fa-facebook-f fa-lg"></i>
              </a>
              <a className="text-blue-200 hover:text-white transition duration-300" href="#">
                <i className="fab fa-instagram fa-lg"></i>
              </a>
              <a className="text-blue-200 hover:text-white transition duration-300" href="#">
                <i className="fab fa-twitter fa-lg"></i>
              </a>
              <a className="text-blue-200 hover:text-white transition duration-300" href="#">
                <i className="fab fa-linkedin-in fa-lg"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-blue-800 mt-8 pt-6 text-center text-blue-300 text-sm">
          © 2024 Central Dent. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  </>
);

export default HomePage;
