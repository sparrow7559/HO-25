import React, { useState } from 'react';
// Swiper component and module imports for the carousel
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import logo from '../assets/logo.png';
import pravar from "../assets/pravar.jpg";
import pranav from "../assets/pranav.jpg";
import prayatshu from "../assets/prayatshu.jpeg";
import ashwini from "../assets/ashwini.jpeg";
import abhinav from "../assets/abhinav.webp";
import sara from "../assets/sara.jpeg";
import ayati from "../assets/ayati.jpeg";
import aryadurga from "../assets/aryadurga.jpg";
import medhavi from "../assets/medhavi.jpeg";
import sumeet from "../assets/sumeet.jpg";
import arsh from "../assets/arsh.jpeg";
import advait from "../assets/advait.jpeg";
import naman from "../assets/naman.jpeg";
import reneethra from "../assets/reneethra.jpeg";
import shlok from "../assets/shlok.jpeg";
import bhuvi from "../assets/bhuvi.jpeg";
import sam from "../assets/sam.jpeg";
import arko from "../assets/arko.jpeg";
import nav from "../assets/nav.jpeg";
import yash from "../assets/yash.jpeg";
import sid from "../assets/sid.png";
import vanshika from "../assets/vanshika.jpeg";

// ---- NEW: Imports for your 12 carousel images ----
// Note: Make sure the file extension (.jpg) matches your image files.
import c1 from '../assets/c1.jpg';
import c2 from '../assets/c2.jpg';
import c3 from '../assets/c3.jpg';
import c4 from '../assets/c4.jpg';
import c5 from '../assets/c5.jpg';
import c6 from '../assets/c6.jpg';
import c7 from '../assets/c7.jpg';
import c8 from '../assets/c8.jpg';
import c10 from '../assets/c10.jpg';
import c11 from '../assets/c11.jpg';
import c12 from '../assets/c12.jpg';
import c15 from '../assets/c15.jpg';

const About = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const teamSections = {
    "Core Committee": [
      { name: "Abhinav Kumar", funnyFact: "silent but goated", img: abhinav },
      { name: "Pranav Kumar", funnyFact: "2 Senior devs", img: pranav },
      { name: "Arkadeep Ganguly", funnyFact: "I zoned out", img: arko },
      { name: "Sara Mishra", funnyFact: "What did I miss!?", img: sara },
      { name: "Navaneeth Suresh", funnyFact: "ab mai itna bhi kuch khaas nahi hu", img: nav },
    ],
    "Web Dev Team": [
      { name: "Advait Balachandar", funnyFact: "Error: C2H5OH found", img: advait },
      { name: "Ashwini Rao", funnyFact: "Seniorest Dev (Real)", img: ashwini },
      { name: "Ayati Rauthan", funnyFact: ".... still thinking", img: ayati },
      { name: "Mohammad Arsh", funnyFact: "Backend: 1, Me: 0", img: arsh },
      { name: "Pravar Singh", funnyFact: "DSA in JSON", img: pravar },
      { name: "Prayatshu Misra", funnyFact: "Works on either Caffeine or Localhost:3000", img: prayatshu },
      { name: "Sumeet", funnyFact: "Full Stack Tester", img: sumeet },
    ],
    "Story Team": [
      { name: "Shlok Kasargod", funnyFact: "Sono Pazzi Questi Romani", img: shlok },
      { name: "Medhavi Mehta", funnyFact: "MINIONS!! TONIGHT WE STEAL THE MOON !!!", img: medhavi },
      { name: "Naman Kaushik", funnyFact: "Can I still quit?", img: naman },
      { name: "Bhuvi Sanga", funnyFact: "I can finally sleep...", img: bhuvi },
    ],
    "Design Team": [
      { name: "Samyak Jain", funnyFact: "Art machine with a mouse.", img: sam },
      { name: "Aaryadurga Bhat", funnyFact: "Eat Sleep Repeat (minus eat)", img: aryadurga },
      { name: "Vanshika Agarwal", funnyFact: "Procrastinating Productively", img: vanshika },
      { name: "Siddharth Prabhu", funnyFact: "Driven by curiosity. Grounded in creation", img: sid },
      { name: "Yash Agarwal", funnyFact: "Bringing life to pixels", img: yash },
      { name: "P.V. Reneethra", funnyFact: "80% chill, 20% lowkey chaos", img: reneethra },
    ],
  };

  // ---- UPDATED: The carouselImages array now uses your 12 images ----
  const carouselImages = [
    { src: c1, alt: "Carousel Image 1" },
    { src: c2, alt: "Carousel Image 2" },
    { src: c3, alt: "Carousel Image 3" },
    { src: c4, alt: "Carousel Image 4" },
    { src: c5, alt: "Carousel Image 5" },
    { src: c6, alt: "Carousel Image 6" },
    { src: c7, alt: "Carousel Image 7" },
    { src: c8, alt: "Carousel Image 8" },
    { src: c10, alt: "Carousel Image 10" },
    { src: c11, alt: "Carousel Image 11" },
    { src: c12, alt: "Carousel Image 12" },
    { src: c15, alt: "Carousel Image 15" },
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent successfully!');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <>
      {/* Custom styles for Swiper navigation/pagination to match the site's theme */}
      <style>
        {`
          .swiper-button-next,
          .swiper-button-prev {
            color: #ef4444; /* red-500 */
          }
          .swiper-pagination-bullet-active {
            background-color: #ef4444; /* red-500 */
          }
        `}
      </style>

      <div className="bg-black pt-10 text-white min-h-screen w-full font-sans overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* What is ACUMEN Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 py-16 lg:py-20 items-center">
            <div className="w-full">
              <h2 className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-bold mb-6 lg:mb-8 leading-tight">
                WHAT IS <span className="text-red-500">ACUMEN</span>?
              </h2>
              <div className="space-y-6 text-gray-300 text-sm sm:text-base leading-relaxed">
                <p>
                  TechTatva 2025 presents Acumen - Where Strategy, Puzzles, and Possibilities Unite!
                  Step into the most exhilarating challenge of TechTatva: Acumen, a battleground of
                  intellect and imagination featuring two thrilling journeys - Tesseract and Hopeless Opus.
                </p>
                <p>
                  From mind-bending puzzles to choices that shape your destiny,
                  Acumen is not just a test - it's an adventure you won't forget.
                  Try your hand at the prize pool of a whopping Rs. 28,000!
                </p>
              </div>
            </div>
            <div className="w-full flex items-center justify-center">
              {/* --- THIS IS THE UPDATED PART --- */}
              <img
                src={c15}
                alt="Acumen Event Teaser"
                className="w-full h-48 sm:h-56 lg:h-64 xl:h-72 object-cover rounded-lg border border-gray-700"
              />
              {/* --- END OF UPDATE --- */}
            </div>
          </div>

          {/* What is Hopeless Opus Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 py-16 lg:py-20 items-center">
            <div className="w-full flex items-center justify-center">
              {/* --- CAROUSEL STARTS HERE --- */}
              <Swiper
                className="w-full h-48 sm:h-56 lg:h-64 xl:h-72 rounded-lg border border-gray-700"
                modules={[Autoplay, Pagination, Navigation]}
                spaceBetween={30}
                centeredSlides={true}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                pagination={{
                  clickable: true,
                }}
                navigation={true}
                loop={true}
              >
                {carouselImages.map((image, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
              {/* --- CAROUSEL ENDS HERE --- */}
            </div>
            <div className="w-full">
              <h2 className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-bold mb-6 lg:mb-8 leading-tight">
                WHAT IS <span className="text-red-500">Hopeless Opus</span>?
              </h2>
              <div className="space-y-6 text-gray-300 text-sm sm:text-base leading-relaxed">
                <p>
                  Hopeless Opus is an immersive online RPG and choice-based story game crafted
                  by Acumen for TechTatva. Set in a world where every decision shapes your fate,
                  it challenges players to think, adapt, and uncover the truth behind a mysterious,
                  collapsing realm. With interactive storylines, mind-bending mini-games, and
                  branching paths that test logic and emotion alike, Hopeless Opus turns every choice
                  into a consequence - and every player into the author of their own destiny.
                </p>
              </div>
            </div>
          </div>

        {/* MEET THE TEAM */}
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center mb-2">
            Meet The <span className="text-red-500">Team</span>
          </h2>
          <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto text-base px-4">
            Our dedicated team works tirelessly to create unforgettable
            experiences and challenging adventures for all participants.
          </p>

          {Object.entries(teamSections).map(([sectionTitle, members]) => (
            <div key={sectionTitle} className="mb-12">
              <h3 className="text-2xl font-semibold text-center text-red-500 mb-6">{sectionTitle}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {members.map((member, index) => (
                  <div
                    key={index}
                    className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center hover:scale-105 transition-transform duration-300"
                  >
                    <img
                      src={member.img}
                      alt={member.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto mb-3 object-cover object-center border-2 border-black hover:border-white transition-all duration-300"
                    />
                    <div className="text-base font-bold mb-1">{member.name}</div>
                    <div className="text-sm text-gray-400 mb-2">{member.designation}</div>
                    <div className="text-sm text-gray-500 italic">"{member.funnyFact}"</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default About;