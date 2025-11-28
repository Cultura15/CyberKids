// "use client"

// import { useState, useEffect } from "react"
// import { FaGamepad, FaRobot, FaTrophy, FaChalkboardTeacher, FaBolt, FaBell } from "react-icons/fa";
// import Slider from "react-slick";

// const LandingPage = () => {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState("students")
//   const [openFAQ, setOpenFAQ] = useState(null)

//   useEffect(() => {
//     const link = document.createElement('link')
//     link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&display=swap'
//     link.rel = 'stylesheet'
//     document.head.appendChild(link)

//     // Load Slick Carousel CSS
//     const slickCSS = document.createElement('link')
//     slickCSS.href = 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css'
//     slickCSS.rel = 'stylesheet'
//     document.head.appendChild(slickCSS)

//     const slickThemeCSS = document.createElement('link')
//     slickThemeCSS.href = 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css'
//     slickThemeCSS.rel = 'stylesheet'
//     document.head.appendChild(slickThemeCSS)
//   }, [])

//   const handleGetStarted = () => {
//     window.open("/signup", "_blank")
//   }

//   const handleLogin = () => {
//     window.open("/login", "_blank")
//   }

//   const toggleFAQ = (index) => {
//     setOpenFAQ(openFAQ === index ? null : index)
//   }

//   const carouselSettings = {
//     dots: true,
//     infinite: true,
//     slidesToShow: 3,
//     slidesToScroll: 1,
//     autoplay: true,
//     speed: 2000,
//     autoplaySpeed: 2000,
//     cssEase: "linear",
//     responsive: [
//       {
//         breakpoint: 1024,
//         settings: {
//           slidesToShow: 2,
//           slidesToScroll: 1,
//         }
//       },
//       {
//         breakpoint: 640,
//         settings: {
//           slidesToShow: 1,
//           slidesToScroll: 1,
//         }
//       }
//     ]
//   };

//   const faqs = [
//     {
//       question: "What age group is CyberKids designed for?",
//       answer: "CyberKids is designed for students in grades 4-6, typically ages 9-12. The content is tailored to be engaging and educational for young learners discovering cybersecurity."
//     },
//     {
//       question: "Do students need prior cybersecurity knowledge?",
//       answer: "Not at all! CyberKids is perfect for beginners. The missions start with basic concepts and progressively introduce more advanced topics as students gain confidence."
//     },
//     {
//       question: "Can teachers track student progress?",
//       answer: "Yes! Teachers have access to a comprehensive dashboard where they can monitor student progress, view completion times, check leaderboards, and receive notifications when students complete levels."
//     },
//     {
//       question: "Is CyberKids free to use?",
//       answer: "Yes, you can sign up for free and start exploring our cybersecurity missions right away. We offer additional premium features for schools and educators."
//     },
//     {
//       question: "How do I create a classroom?",
//       answer: "Teachers can easily create and manage classrooms from the dashboard. Simply sign up as a teacher, navigate to the classroom section, and follow the step-by-step setup process."
//     }
//   ]

//   return (
// <div className="min-h-screen bg-white" style={{ fontFamily: 'Poppins, sans-serif' }}>

// <nav className="fixed top-0 w-full backdrop-blur-md bg-purple-700/80 border-b border-purple-500/30 z-50">
//   <div className="max-w-7xl mx-auto px-6">
//     <div className="flex justify-between items-center h-16">
      

//       <div className="flex items-center space-x-2">
//         <span className="text-2xl font-extrabold tracking-tight text-white">
//           CyberKids
//         </span>
//       </div>

//       <div className="hidden md:flex items-center space-x-4">
//         <button
//           onClick={handleGetStarted}
//           className="px-5 py-2 bg-white text-purple-700 font-semibold rounded-xl shadow-sm hover:bg-purple-50 transition-all text-sm"
//         >
//           Sign up
//         </button>

//         <button
//           onClick={handleLogin}
//           className="px-5 py-2 bg-transparent border border-white/70 text-white font-semibold rounded-xl hover:bg-white hover:text-purple-700 transition-all text-sm"
//         >
//           Log in
//         </button>
//       </div>


//       <button
//         className="md:hidden text-white text-2xl"
//         onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//       >
//         {mobileMenuOpen ? "✕" : "☰"}
//       </button>
//     </div>

//     {mobileMenuOpen && (
//       <div className="md:hidden py-4 space-y-3 border-t border-purple-500/40">
//         <button
//           onClick={handleGetStarted}
//           className="w-full px-4 py-2 bg-white text-purple-700 font-semibold rounded-lg shadow-sm hover:bg-purple-50 transition-all text-sm"
//         >
//           Sign up free
//         </button>

//         <button
//           onClick={handleLogin}
//           className="w-full px-4 py-2 bg-transparent border border-white/70 text-white font-semibold rounded-lg hover:bg-white hover:text-purple-700 transition-all text-sm"
//         >
//           Log in
//         </button>
//       </div>
//     )}
//   </div>
// </nav>


// <section className="relative pt-32 pb-0 px-6 overflow-hidden bg-gradient-to-b from-[#C7EBFF] via-[#ABE0F0] to-[#95D0F8]">
//   <div className="absolute inset-x-0 bottom-0 -mb-1">
//     <svg
//       className="w-full h-auto block"
//       viewBox="0 0 1440 320"
//       preserveAspectRatio="none"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <path
//         fill="#ffffff"
//         fillOpacity="1"
//         d="M0,128L60,144C120,160,240,192,360,197.3C480,203,600,181,720,154.7C840,128,960,96,1080,101.3C1200,107,1320,149,1380,170.7L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
//       ></path>
//     </svg>
//   </div>
//   <div className="max-w-7xl mx-auto text-center relative z-10">

//     <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
//       Power Up Your <br /> Learning with <span className="text-purple-700">CyberKids!</span>
//     </h1>

//     <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
//       Dive into playful quests, story-driven missions, and hands-on challenges that help young learners
//       build smart, safe, and confident online habits—all through fun, interactive experiences designed
//       just for kids.
//     </p>

//     <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
//       <button
//         className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-xl shadow-md hover:bg-purple-700 transition-all transform hover:scale-[1.03]"
//       >
//         Sign up for free
//       </button>
//     </div>
//     {/* Mockup image */}
//     <div className="relative max-w-6xl mx-auto">
//       <img
//         src="/cyberkidsimage.jpg"
//         alt="CyberKids Preview"
//         className="w-full h-auto rounded-3xl"
//       />
//     </div>
//   </div>
// </section>

// <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white -mt-20">
//   <div className="max-w-6xl mx-auto text-center mb-20">
//     <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
//       Who Is CyberKids For?
//     </h2>
//     <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//       Made for young learners who are building their digital awareness.
//     </p>
//   </div>

//   <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">

//     <div className="bg-[#F5C857] p-10 rounded-3xl shadow-lg flex flex-col items-center text-center">
//       <h3 className="text-2xl font-bold text-gray-900 mb-4">Grade 4 Learners</h3>
//       <p className="text-gray-600 mb-6">
//         Perfect for beginners discovering cybersecurity for the first time.
//         Students explore simple challenges that help them identify online risks
//         in a fun and friendly way.
//       </p>
//       <img
//         src="/studentssample.jpg"
//         alt="Grade 4 Students"
//         className="w-64 rounded-xl shadow-md"
//       />
//     </div>

//     <div className="bg-[#E6F3FF] p-10 rounded-3xl shadow-lg flex flex-col items-center text-center">
//       <h3 className="text-2xl font-bold text-gray-900 mb-4">Grade 5 Learners</h3>
//       <p className="text-gray-600 mb-6">
//         Grade 5 students engage with deeper, story-based missions that strengthen
//         their understanding of online safety and problem-solving skills.
//       </p>
//       <img
//         src="/studentssample.jpg"
//         alt="Grade 5 Students"
//         className="w-64 rounded-xl shadow-md"
//       />
//     </div>

//     <div className="bg-[#FFEE91] p-10 rounded-3xl shadow-lg flex flex-col items-center text-center">
//       <h3 className="text-2xl font-bold text-gray-900 mb-4">Grade 6 Learners</h3>
//       <p className="text-gray-600 mb-6">
//         Grade 6 learners explore more advanced missions that challenge their
//         thinking, improve decision-making skills, and prepare them for real
//         digital-world scenarios.
//       </p>
//       <img
//         src="/studentssample.jpg"
//         alt="Grade 6 Students"
//         className="w-64 rounded-xl shadow-md"
//       />
//     </div>

//   </div>
// </section>


// <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
//   <div className="max-w-7xl mx-auto">
//     <div className="grid md:grid-cols-2 gap-12 items-center">
      
//       {/* Left Content */}
//       <div className="space-y-6">
//         <h2 className="text-4xl md:text-5xl font-extrabold text-black-700 leading-tight">
//           See CyberKids in Action!
//         </h2>
        
//         <p className="text-lg text-gray-700 leading-relaxed">
//           Get a quick look at how <span className="font-semibold text-purple-700">CyberKids</span> 
//           turns cybersecurity learning into an exciting and interactive experience for students.
//         </p>
        
//         <p className="text-lg text-gray-700 leading-relaxed">
//           This demo showcases the teacher dashboard, mission challenges, leaderboard, 
//           and how the platform integrates fun Roblox gameplay to build digital safety skills.
//         </p>
//       </div>

//       {/* Right Video */}
//       <div className="relative">
//         <div className="relative rounded-2xl overflow-hidden shadow-2xl">
//           <video
//             controls
//             className="w-full h-auto"
//             poster="/video-thumbnail.jpeg"
//           >
//             <source src="/demo-video.mp4" type="video/mp4" />
//             Your browser does not support the video tag.
//           </video>
//         </div>
//       </div>
      
//     </div>
//   </div>
// </section>


// <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
//   <div className="max-w-6xl mx-auto text-center mb-12">
//     <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
//       Powerful Features for Everyone
//     </h2>
//     <p className="text-gray-600 text-lg">
//       Designed for both young learners and educators.
//     </p>
//   </div>

//   <div className="flex justify-center mb-10">
//     <div className="bg-white shadow-lg rounded-full p-2 flex space-x-2">
//       <button
//         onClick={() => setActiveTab("students")}
//         className={`px-6 py-2 rounded-full font-semibold transition ${
//           activeTab === "students"
//             ? "bg-purple-600 text-white shadow"
//             : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//         }`}
//       >
//         For Students
//       </button>

//       <button
//         onClick={() => setActiveTab("teachers")}
//         className={`px-6 py-2 rounded-full font-semibold transition ${
//           activeTab === "teachers"
//             ? "bg-purple-600 text-white shadow"
//             : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//         }`}
//       >
//         For Teachers
//       </button>
//     </div>
//   </div>

//   <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
//     {/* STUDENTS TAB */}
//     {activeTab === "students" && (
//       <>

//         <div className="w-full bg-white relative overflow-hidden shadow-[0px_0px_20px_rgba(0,0,0,0.08)] p-9 rounded-2xl space-y-4 transition duration-300 hover:-translate-y-2">
//           <div className="w-24 h-24 bg-purple-600 rounded-full absolute -right-5 -top-7 flex items-center justify-center">
//             <p className="text-white text-3xl font-bold">01</p>
//           </div>

//           <div className="fill-purple-600 w-12">
//             <FaGamepad size={48} />
//           </div>

//           <h1 className="font-bold text-xl">Roblox Game Levels</h1>
//           <p className="text-sm text-gray-500 leading-6">
//             Students play interactive Roblox levels that teach key cybersecurity topics through hands-on challenges and exploration.
//           </p>
//         </div>

//         <div className="w-full bg-white relative overflow-hidden shadow-[0px_0px_20px_rgba(0,0,0,0.08)] p-9 rounded-2xl space-y-4 transition duration-300 hover:-translate-y-2">
//           <div className="w-24 h-24 bg-purple-600 rounded-full absolute -right-5 -top-7 flex items-center justify-center">
//             <p className="text-white text-3xl font-bold">02</p>
//           </div>

//           <div className="fill-purple-600 w-12">
//             <FaRobot size={48} />
//           </div>

//           <h1 className="font-bold text-xl">AI Feedback</h1>
//           <p className="text-sm text-gray-500 leading-6">
//             Instant, personalized feedback is provided after every action or answer.
//           </p>
//         </div>

//         <div className="w-full bg-white relative overflow-hidden shadow-[0px_0px_20px_rgba(0,0,0,0.08)] p-9 rounded-2xl space-y-4 transition duration-300 hover:-translate-y-2">
//           <div className="w-24 h-24 bg-purple-600 rounded-full absolute -right-5 -top-7 flex items-center justify-center">
//             <p className="text-white text-3xl font-bold">03</p>
//           </div>

//           <div className="fill-purple-600 w-12">
//             <FaTrophy size={48} />
//           </div>

//           <h1 className="font-bold text-xl">Leaderboard</h1>
//           <p className="text-sm text-gray-500 leading-6">
//             A real-time leaderboard ranks students based on performance and completion times.
//           </p>
//         </div>
//       </>
//     )}

//     {/* TEACHERS TAB */}
//     {activeTab === "teachers" && (
//       <>
//         <div className="w-full bg-white relative overflow-hidden shadow-[0px_0px_20px_rgba(0,0,0,0.08)] p-9 rounded-2xl space-y-4 transition duration-300 hover:-translate-y-2">
//           <div className="w-24 h-24 bg-purple-600 rounded-full absolute -right-5 -top-7 flex items-center justify-center">
//             <p className="text-white text-3xl font-bold">01</p>
//           </div>

//           <div className="fill-purple-600 w-12">
//             <FaChalkboardTeacher size={48} />
//           </div>

//           <h1 className="font-bold text-xl">Classroom Creation</h1>
//           <p className="text-sm text-gray-500 leading-6">
//             Teachers can create and manage class sections from the dashboard, making organization effortless.
//           </p>
//         </div>

//         <div className="w-full bg-white relative overflow-hidden shadow-[0px_0px_20px_rgba(0,0,0,0.08)] p-9 rounded-2xl space-y-4 transition duration-300 hover:-translate-y-2">
//           <div className="w-24 h-24 bg-purple-600 rounded-full absolute -right-5 -top-7 flex items-center justify-center">
//             <p className="text-white text-3xl font-bold">02</p>
//           </div>

//           <div className="fill-purple-600 w-12">
//             <FaBolt size={48} />
//           </div>

//           <h1 className="font-bold text-xl">Dynamic Interaction</h1>
//           <p className="text-sm text-gray-500 leading-6">
//             Control student access and instantly push custom questions into Roblox.
//           </p>
//         </div>

//         <div className="w-full bg-white relative overflow-hidden shadow-[0px_0px_20px_rgba(0,0,0,0.08)] p-9 rounded-2xl space-y-4 transition duration-300 hover:-translate-y-2">
//           <div className="w-24 h-24 bg-purple-600 rounded-full absolute -right-5 -top-7 flex items-center justify-center">
//             <p className="text-white text-3xl font-bold">03</p>
//           </div>

//           <div className="fill-purple-600 w-12">
//             <FaBell size={48} />
//           </div>

//           <h1 className="font-bold text-xl">Notifications</h1>
//           <p className="text-sm text-gray-500 leading-6">
//             Real-time alerts notify teachers when a student registers or completes a level.
//           </p>
//         </div>
//       </>
//     )}
//   </div>
// </section>

// <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
//   <div className="max-w-7xl mx-auto">
//     <div className="text-center mb-12">
//       <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
//         Tech Stack Used
//       </h2>
//       <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//         The technologies powering CyberKids
//       </p>
//     </div>

//     <div className="carousel-container">
//       <Slider
//         {...carouselSettings}
//         dots={false}      
//         slidesToShow={3}      // Show 3 logos at a time
//         slidesToScroll={1}
//         autoplay={true}
//         autoplaySpeed={2000}
//         infinite={true}
//       >
//         {/* SpringBoot */}
//         <div className="px-6 flex justify-center">
//           <img
//             src="Spring Boot.png"
//             alt="SpringBoot Logo"
//             className="w-24 h-24"
//           />
//         </div>

//         {/* React */}
//         <div className="px-6 flex justify-center">
//           <img
//             src="React.png"
//             alt="React Logo"
//             className="w-24 h-24"
//           />
//         </div>

//         {/* MySQL */}
//         <div className="px-6 flex justify-center">
//           <img
//             src="mysql.png"
//             alt="MySQL Logo"
//             className="w-24 h-24"
//           />
//         </div>

//         {/* Roblox Studio */}
//         <div className="px-6 flex justify-center">
//           <img
//             src="Roblox Studio.png"
//             alt="Roblox Studio Logo"
//             className="w-24 h-24"
//           />
//         </div>

//         {/* Roblox Player */}
//         <div className="px-6 flex justify-center">
//           <img
//             src="RobloxPlayer.webp"
//             alt="Roblox Player Logo"
//             className="w-24 h-24"
//           />
//         </div>

//         {/* Azure */}
//         <div className="px-6 flex justify-center">
//           <img
//             src="Azure.png"
//             alt="Azure Logo"
//             className="w-24 h-24"
//           />
//         </div>

//         {/* Railway */}
//         <div className="px-6 flex justify-center">
//           <img
//             src="Railway.svg"
//             alt="Railway Logo"
//             className="w-24 h-24"
//           />
//         </div>

//         {/* Render */}
//         <div className="px-6 flex justify-center">
//           <img
//             src="render.svg"
//             alt="Render Logo"
//             className="w-24 h-24"
//           />
//         </div>

//         {/* Vercel */}
//         <div className="px-6 flex justify-center">
//           <img
//             src="Vercel.svg"
//             alt="Vercel Logo"
//             className="w-24 h-24"
//           />
//         </div>

//         {/* Docker */}
//         <div className="px-6 flex justify-center">
//           <img
//             src="docker.png"
//             alt="Docker Logo"
//             className="w-24 h-24"
//           />
//         </div>

//       </Slider>
//     </div>
//   </div>
// </section>


// <section className="py-20 px-6 bg-white">
//   <div className="max-w-4xl mx-auto">
//     <div className="text-center mb-12">
//       <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
//         Frequently Asked Questions
//       </h2>
//       <p className="text-lg text-gray-600">
//         Got questions? We've got answers!
//       </p>
//     </div>

//     <div className="space-y-4">
//       {faqs.map((faq, index) => (
//         <div
//           key={index}
//           className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 transition hover:shadow-md"
//         >
//           <button
//             onClick={() => toggleFAQ(index)}
//             className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-gray-100 transition"
//           >
//             <span className="font-semibold text-gray-900 text-lg pr-4">
//               {faq.question}
//             </span>
//             <span className="text-2xl text-purple-600 flex-shrink-0">
//               {openFAQ === index ? "−" : "+"}
//             </span>
//           </button>
          
//           {openFAQ === index && (
//             <div className="px-6 pb-5 text-gray-600 leading-relaxed">
//               {faq.answer}
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   </div>
// </section>

// <section className="py-16 px-6 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50">
//   <div className="max-w-2xl mx-auto text-center">
//     <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-3">
//       Ready to level up your cyber skills?
//     </h2>
//     <p className="text-base md:text-lg text-gray-600 mb-6">
//       Join young students learning cybersecurity through interactive games.
//     </p>
//     <button
//       onClick={handleGetStarted}
//       className="px-8 py-3 bg-purple-700 text-white font-bold rounded-full shadow-lg hover:bg-purple-800 transition transform hover:scale-105"
//     >
//       Sign up now
//     </button>
//   </div>
// </section>

//         <footer className="bg-gray-900 text-white py-12">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="grid md:grid-cols-3 gap-8 mb-8">
//               <div>
//                 <div className="flex items-center space-x-2 mb-4">
//                   <span className="text-2xl font-bold">CyberKids</span>
//                 </div>
//                 <p className="text-gray-400 text-sm">
//                   An interactive cybersecurity game for young learners.
//                 </p>
//               </div>

//               <div>
//                 <h3 className="text-lg font-bold mb-4">Contact Us</h3>
//                 <div className="space-y-3 text-gray-400 text-sm">
//                   <p>
//                     <span className="block font-semibold text-white">Address:</span>
//                     N. Bacalso Avenue, Cebu City, Philippines 6000.
//                   </p>
//                   <p>
//                     <span className="block font-semibold text-white">Phone:</span>
//                     +1 (555) 123-4567
//                   </p>
//                   <p>
//                     <span className="block font-semibold text-white">Email:</span>
//                     contact@cyberkids.com
//                   </p>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-lg font-bold mb-4">More Ways to Contact Us</h3>
//                 <div className="flex space-x-4">
//                   <a
//                     href="https://facebook.com"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="hover:opacity-80 transition"
//                   >
//                     <img
//                       src="/facebook.png"
//                       alt="Facebook"
//                       className="w-8 h-8"
//                     />
//                   </a>
//                   <a
//                     href="https://messenger.com"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="hover:opacity-80 transition"
//                   >
//                     <img
//                       src="/messenger.png"
//                       alt="Messenger"
//                       className="w-8 h-8"
//                     />
//                   </a>
//                 </div>
//               </div>
//             </div>

//             <div className="border-t border-gray-700 pt-8 text-center">
//               <p className="text-gray-400 text-sm">
//                 © 2025 CyberKids. All rights reserved.
//               </p>
//             </div>
//           </div>
//         </footer>

//         <style jsx>{`
//           .carousel-container .slick-slide > div {
//             display: flex;
//             justify-content: center;
//           }
          
//           .carousel-container .slick-dots {
//             bottom: -50px;
//           }
          
//           .carousel-container .slick-dots li button:before {
//             font-size: 12px;
//             color: #9333ea;
//           }
          
//           .carousel-container .slick-dots li.slick-active button:before {
//             color: #7c3aed;
//           }
//         `}</style>
//     </div>
//   )
// }

// export default LandingPage