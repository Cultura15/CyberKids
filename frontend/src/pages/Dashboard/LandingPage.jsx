"use client"

import { useState, useEffect } from "react"
import Slider from "react-slick";

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("students")
  const [openFAQ, setOpenFAQ] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50); // change threshold if needed
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    // Load Slick Carousel CSS
    const slickCSS = document.createElement('link')
    slickCSS.href = 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css'
    slickCSS.rel = 'stylesheet'
    document.head.appendChild(slickCSS)

    const slickThemeCSS = document.createElement('link')
    slickThemeCSS.href = 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css'
    slickThemeCSS.rel = 'stylesheet'
    document.head.appendChild(slickThemeCSS)
  }, [])

  const handleGetStarted = () => {
  window.location.href = "/signup"; // same tab navigation
}

const handleLogin = () => {
  window.location.href = "/login"; // same tab navigation
}


  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const carouselSettings = {
    dots: true,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    speed: 2000,
    autoplaySpeed: 2000,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Nunito, sans-serif" }}>
 <nav
  className={`fixed top-0 w-full z-50 border-b transition-all duration-500 ${
    isScrolled
      ? "backdrop-blur-xl border-[#6A1FB3]/40"
      : "border-transparent"
  }`}
  style={{
    backgroundColor: isScrolled
      ? "rgba(106, 31, 179, 0.65)"  // lighter glassy purple
      : "#6A1FB3",                  // lighter solid purple
  }}
>
  <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
    <img
      src="/logo4.png"
      alt="CyberKids Logo"
      className="h-auto max-h-12 w-auto object-contain cursor-pointer"
      style={{ transform: 'scale(1.3)' }} // subtly enlarges logo without touching container
      onClick={() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }}
    />
  </div>
</nav>




<section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-[80vh] bg-[#54168C] flex items-center">
  {/* Background Image */}
  <div
    className="absolute inset-0 bg-center bg-no-repeat"
    style={{
      backgroundImage: 'url(/thumbnail2.png)',
      backgroundSize: '70%',
      backgroundPosition: 'center',
    }}
  ></div>

  {/* Buttons - Now fully responsive & stable when zooming */}
  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-row gap-4">

    {/* Start Learning */}
    <button
      onClick={handleGetStarted}
      className="px-10 py-4 bg-[#0fda45] text-white font-bold rounded-full 
      hover:bg-[#6ede8c] transition-all text-lg shadow-[0_4px_20px_rgba(0,0,0,0.4)] 
      hover:shadow-[0_6px_25px_rgba(0,0,0,0.45)] transform hover:scale-105"
    >
      GET STARTED
    </button>

    {/* Login */}
    <button
      onClick={handleLogin}
      className="px-10 py-4 bg-white border-2 border-[#54168C] text-[#54168C] 
      font-bold rounded-full hover:bg-purple-50 transition-all text-lg 
      shadow-[0_4px_20px_rgba(0,0,0,0.35)] hover:shadow-[0_6px_25px_rgba(0,0,0,0.4)]"
    >
      I Have An Account
    </button>

  </div>
</section>





      <section className="py-20 px-6 bg-white">
  <div className="max-w-7xl mx-auto">
    <div className="grid md:grid-cols-2 gap-12 items-center">
      {/* Left: Features */}
      <div className="space-y-8">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-800 leading-tight mb-8">
            <span className="text-[#54168C]">fun. </span> 
            <span className="text-blue-500">interactive. </span>
            <span className="text-[#0fda45]">engaging.</span>
          </h2>

           <div className="space-y-6">
            <div className="flex gap-4">
              <div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  CyberKids transforms cybersecurity lessons into immersive{" "}
                  <span className="text-blue-500">Roblox game levels</span>{" "}
                  that children naturally enjoy. Through playful scenarios, challenges, and instant feedback, students learn online safety concepts in a way that feels intuitive.
                </p>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Phone Mockup */}
      <div className="flex justify-center">
        <div className="relative w-64 h-96">
            <div className="bg-white rounded-2xl h-full overflow-hidden flex items-center justify-center">
              <img
                src="/gif1.1.gif"
                alt="CyberKids App"
                className="w-full h-full object-cover"
              />
            </div>
         
        </div>
      </div>

    </div>
  </div>
</section>


     <section className="py-20 px-6 bg-white">
  <div className="max-w-7xl mx-auto">
    <div className="grid md:grid-cols-2 gap-12 items-center">
      
      {/* Left: Image with yellow border */}
      <div className="flex justify-center order-2 md:order-1">
        <div className="relative w-64 h-96 rounded-3xl shadow-2xl p-3 overflow-hidden border-8 border-yellow-400">
          <div className="bg-white rounded-2xl h-full w-full flex items-center justify-center overflow-hidden">
            <img
              src="/gif2.gif"
              alt="Teacher Classroom Management"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Right: Content */}
      <div className="space-y-6 order-1 md:order-2">
        <h2 className="text-4xl md:text-5xl font-black text-gray-800">
          <span className="text-green-500">Teacher Classroom Management</span>
        </h2>

        <p className="text-lg text-gray-700 leading-relaxed">
          Teachers can create classes, manage student access, and organize learning sessions effortlessly through a dedicated web dashboard. This makes it easier to guide students, track who’s participating, and ensure that classroom activities align with lesson plans.
        </p>
      </div>

    </div>
  </div>
</section>



      <section className="py-20 px-6 bg-white">
  <div className="max-w-7xl mx-auto">
    <div className="grid md:grid-cols-2 gap-12 items-center">

      {/* Left: Features */}
      <div className="space-y-8">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-800 leading-tight mb-8">
            <span className="text-[#54168C]">Real-Time Insights</span> 
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  CyberKids provides real-time updates on student performance, activity status, and completed levels. Teachers can instantly spot who needs help and who is progressing quickly, all from one centralized view.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Right: Phone Mockup */}
      <div className="flex justify-center">
        <div className="relative w-64 h-96">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-3xl shadow-2xl p-3 overflow-hidden border-8 border-yellow-400">
            <div className="bg-white rounded-2xl h-full overflow-hidden flex items-center justify-center">
              <img
                src="/gif3.gif"
                alt="CyberKids App"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>



        <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Image */}
            <div className="flex justify-center order-2 md:order-1">
              <img
                src="/gif4.gif"
                alt="Backed by Science"
                className="w-full max-w-sm h-auto object-contain"
              />
            </div>

            {/* Right: Content */}
            <div className="space-y-6 order-1 md:order-2">
              <h2 className="text-4xl md:text-5xl font-black text-gray-800">
                <span className="text-green-500">AI-Powered Feedback</span>
              </h2>

              <p className="text-lg text-gray-700 leading-relaxed">
               An integrated AI model provides instant, personalized feedback to every answer students submit. This helps them understand mistakes faster and reinforces correct cybersecurity habits.
              </p>

            </div>
          </div>
        </div>
      </section>


 <section className="relative pt-32 pb-0 px-6 overflow-hidden bg-gradient-to-b bg-[#54168C]">
        <div className="absolute inset-x-0 bottom-0 -mb-1">
          <svg
            className="w-full h-auto block"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,128L60,144C120,160,240,192,360,197.3C480,203,600,181,720,154.7C840,128,960,96,1080,101.3C1200,107,1320,149,1380,170.7L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            ></path>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">

        <h1
  className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight"
  style={{
    background: "linear-gradient(180deg, #54168C 0%, #6A1FB3 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    display: "inline-block",
    textShadow: `
      2px 2px 0 #ffffff,
      4px 4px 0 #FFA500
    `
  }}
>
  Empower Your Students <br /> with <span className="font-extrabold">CyberKids!</span>
</h1>





          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            
          </div>
          {/* Mockup image */}
          <div className="relative max-w-6xl mx-auto">
            <img
              src="/cyberkidsimage.png"
              alt="CyberKids Preview"
              className="w-full h-auto rounded-3xl"
            />
          </div>
        </div>
      </section>


   <section className="py-6 bg-[#ffffff] rounded-xl shadow-retro-section flex justify-center">
  <div className="max-w-4xl w-full">
    <div className="carousel-container">
      <Slider
        {...carouselSettings}
        dots={false}
        slidesToShow={6}
        slidesToScroll={1}
        autoplay={true}
        autoplaySpeed={2000}
        infinite={true}
        pauseOnHover={false} // Keep sliding on hover
        responsive={[
          { breakpoint: 1024, settings: { slidesToShow: 5 } },
          { breakpoint: 768, settings: { slidesToShow: 3 } },
          { breakpoint: 480, settings: { slidesToShow: 2 } },
        ]}
      >
        {[
          { src: "springboot.png", alt: "SpringBoot Logo" },
          { src: "React.png", alt: "React Logo" },
          { src: "mysql.jpg", alt: "MySQL Logo" },
          { src: "robloxstudio.png", alt: "Roblox Studio Logo" },
          { src: "robloxplayer.webp", alt: "Roblox Player Logo" },
          { src: "azure.jpg", alt: "Azure Logo" },
          { src: "railway.png", alt: "Railway Logo" },
          { src: "render.png", alt: "Render Logo" },
          { src: "vercel.jpg", alt: "Vercel Logo" },
          { src: "java.jpg", alt: "Java Logo" },
        ].map((logo, index) => (
          <div key={index} className="px-1 flex justify-center">
            <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-2xl border border-white/30 shadow-lg transition-all duration-500 group">
              
              {/* Neon Glow */}
              <div className="absolute inset-0 rounded-2xl bg-green-400 blur-lg opacity-40 animate-pulse group-hover:opacity-70 transition-opacity duration-500"></div>
              
              <img
                src={logo.src}
                alt={logo.alt}
                className="relative max-w-full max-h-full object-contain z-10"
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  </div>
</section>

      
    <section className="relative pt-20 pb-0 px-6 bg-white overflow-hidden" style={{ minHeight: '600px' }}>
  <div className="max-w-4xl mx-auto text-center relative z-10">

    {/* Heading with retro shadows */}
    <h1
      className="text-5xl md:text-6xl font-black leading-tight mb-8"
      style={{
        color: '#54168C',
        textShadow: `
          2px 2px #FF5CA2,
          4px 4px #FF9F1C,
          6px 6px #FFD500
        `
      }}
    >
      where kids learn cyber safety
      <br />
      <span style={{
        color: '#54168C',
        textShadow: `
          2px 2px #FF5CA2,
          4px 4px #FF9F1C,
          6px 6px #FFD500
        `
      }}>through play</span>
    </h1>

    {/* Decorative Illustration - Centered */}
    <div className="mt-12 relative">
      <img
        src="/headlogo.png"
        alt="CyberKids Learning"
        className="w-full max-w-2xl mx-auto h-auto object-contain relative z-10"
        style={{ maxHeight: '400px' }}
      />
    </div>

  </div>

  {/* Purple Wave Background */}
  <div className="absolute bottom-0 left-0 right-0 z-0">
    <svg
      viewBox="0 0 1440 320"
      className="w-full"
      style={{ display: 'block' }}
      preserveAspectRatio="none"
    >
      <path
        fill="#54168C"
        fillOpacity="1"
        d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,154.7C672,149,768,171,864,186.7C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      ></path>
    </svg>
  </div>
</section>




    <footer className="py-16 px-6" style={{background: "linear-gradient(180deg, #54168C 0%, #6A1FB3 100%)"}}>
  <div className="max-w-7xl mx-auto">
    {/* Brand section */}
    <div className="mb-12">
      <h3 className="text-2xl font-bold text-white mb-2">CyberKids</h3>
    </div>

    {/* Links grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
      <div>
        <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Product</h4>
        <ul className="space-y-3">
          <li>
            <a href="#" className="text-purple-100 hover:text-white transition-colors duration-200 text-sm inline-block">
              Features
            </a>
          </li>
          <li>
            <a href="#" className="text-purple-100 hover:text-white transition-colors duration-200 text-sm inline-block">
              Pricing
            </a>
          </li>
          <li>
            <a href="#" className="text-purple-100 hover:text-white transition-colors duration-200 text-sm inline-block">
              Download
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Company</h4>
        <ul className="space-y-3">
          <li>
            <a href="#" className="text-purple-100 hover:text-white transition-colors duration-200 text-sm inline-block">
              About
            </a>
          </li>
          <li>
            <a href="#" className="text-purple-100 hover:text-white transition-colors duration-200 text-sm inline-block">
              Blog
            </a>
          </li>
          <li>
            <a href="#" className="text-purple-100 hover:text-white transition-colors duration-200 text-sm inline-block">
              Careers
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Learning</h4>
        <ul className="space-y-3">
          <li>
            <a href="#" className="text-purple-100 hover:text-white transition-colors duration-200 text-sm inline-block">
              Curriculum
            </a>
          </li>
          <li>
            <a href="#" className="text-purple-100 hover:text-white transition-colors duration-200 text-sm inline-block">
              Resources
            </a>
          </li>
          <li>
            <a href="#" className="text-purple-100 hover:text-white transition-colors duration-200 text-sm inline-block">
              Research
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Connect</h4>
        <ul className="space-y-3">
          <li>
            <a href="#" className="text-purple-100 hover:text-white transition-colors duration-200 text-sm inline-block">
              Twitter
            </a>
          </li>
          <li>
            <a href="#" className="text-purple-100 hover:text-white transition-colors duration-200 text-sm inline-block">
              Instagram
            </a>
          </li>
          <li>
            <a href="#" className="text-purple-100 hover:text-white transition-colors duration-200 text-sm inline-block">
              Facebook
            </a>
          </li>
        </ul>
      </div>
    </div>

    {/* Bottom section */}
    <div className="border-t border-white/20 pt-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-purple-100">© 2025 CyberKids. All rights reserved.</p>
        <div className="flex gap-6 text-sm">
          <a href="#" className="text-purple-100 hover:text-white transition-colors duration-200">
            Privacy Policy
          </a>
          <span className="text-purple-300">•</span>
          <a href="#" className="text-purple-100 hover:text-white transition-colors duration-200">
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  </div>
</footer>
    </div>
  )
}

export default LandingPage