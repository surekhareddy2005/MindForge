// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import Logo from '../components/Logo';
// import { Sparkles, LayoutGrid, ArrowRight, LogIn, Mic, BookOpen, MessageSquare, CheckSquare, ShieldCheck } from 'lucide-react';
// import { Link } from 'react-router-dom';
// import Footer from '../components/Footer';

// const Home = () => {
//   const [activeSection, setActiveSection] = useState('home');

//   // Smooth scroll to section
//   const scrollToSection = (id) => {
//     const el = document.getElementById(id);
//     if (el) {
//       el.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     }
//   };

//   // Track active section on scroll
//   useEffect(() => {
//     const sections = ['home', 'features', 'about', 'contact'];
//     const handleScroll = () => {
//       for (const id of [...sections].reverse()) {
//         const el = document.getElementById(id);
//         if (el && window.scrollY >= el.offsetTop - 120) {
//           setActiveSection(id);
//           break;
//         }
//       }
//     };
//     window.addEventListener('scroll', handleScroll, { passive: true });
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const navItems = [
//     { label: 'Home', id: 'home' },
//     { label: 'Features', id: 'features' },
//     { label: 'About', id: 'about' },
//     { label: 'Contact', id: 'contact' },
//   ];

//   return (
//     <div style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>

//       {/* ── Navbar ── */}
//       <nav style={{
//         padding: '1.5rem 6rem',
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         position: 'fixed',
//         top: 0,
//         width: '100%',
//         zIndex: 1000,
//         background: 'var(--nav-bg)',
//         backdropFilter: 'blur(10px)',
//         boxSizing: 'border-box'
//       }}>
//         <div style={{ flex: 1 }}>
//           <Logo size={40} />
//         </div>

//         <div style={{ display: 'flex', gap: '2.5rem', flex: 2, justifyContent: 'center' }}>
//           {navItems.map(({ label, id }) => (
//             <button
//               key={id}
//               onClick={() => scrollToSection(id)}
//               style={{
//                 background: 'none',
//                 border: 'none',
//                 color: activeSection === id ? 'var(--primary)' : 'var(--text-secondary)',
//                 fontSize: '0.9rem',
//                 fontWeight: activeSection === id ? 700 : 500,
//                 cursor: 'pointer',
//                 padding: '4px 0',
//                 borderBottom: activeSection === id ? '2px solid var(--primary)' : '2px solid transparent',
//                 transition: 'all 0.2s ease',
//                 fontFamily: 'inherit'
//               }}
//             >
//               {label}
//             </button>
//           ))}
//         </div>

//         <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
  
//           <Link to="/login" style={{ textDecoration: 'none' }}>
//             <button className="glow-btn" style={{ padding: '10px 24px', fontSize: '0.85rem' }}>
//               <LogIn size={16} /> Login
//             </button>
//           </Link>
//         </div>
//       </nav>

//       {/* ── Hero Section ── */}
//       <section id="home" style={{
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         textAlign: 'center',
//         paddingTop: '200px',
//         paddingBottom: '100px'
//       }}>
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
//         >
//           <div className="capsule-label">
//             <Sparkles size={14} />
//             THE ULTIMATE AI STUDY COMPANION
//           </div>

//           <h1 className="hero-title">
//             Expand your mind. <br />
//             Master your <span style={{ color: 'var(--primary)' }}>universe.</span>
//           </h1>

//           <p className="hero-subtitle">
//             MindForge harnesses advanced AI to instantly turn your lectures into interactive study guides, dynamic quizzes, and a 24/7 personal tutor. Learning has never been this seamless.
//           </p>

//           <Link to="/login" style={{ textDecoration: 'none' }}>
//             <button className="glow-btn">
//               Get Started <ArrowRight size={18} />
//             </button>
//           </Link>
//         </motion.div>
//       </section>

//       {/* ── About Section ── */}
//       <section id="about" style={{ padding: '100px 6rem', maxWidth: '1200px', margin: '0 auto' }}>
//         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>
//           <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
//             <div className="capsule-label" style={{ marginBottom: '1.5rem' }}>
//               <Sparkles size={14} /> ABOUT US
//             </div>
//             <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1.2 }}>
//               Built for the future of <span style={{ color: 'var(--primary)' }}>learning</span>
//             </h2>
//             <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
//               MindForge was founded with a singular mission: to bridge the gap between classroom lectures and deep student understanding using the power of artificial intelligence.
//             </p>
//             <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
//               Our platform empowers mentors to upload lecture content and instantly generates a full suite of study tools — transcripts, summaries, flashcards, quizzes, and an AI tutor — all tailored to the exact material taught.
//             </p>
//             <Link to="/login" style={{ textDecoration: 'none' }}>
//               <button className="glow-btn">
//                 Join MindForge <ArrowRight size={18} />
//               </button>
//             </Link>
//           </motion.div>

//           <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
//               {[
//                 { number: '10K+', label: 'Active Students' },
//                 { number: '500+', label: 'Mentors Worldwide' },
//                 { number: '98%', label: 'Accuracy Rate' },
//                 { number: '24/7', label: 'AI Support' }
//               ].map((stat, i) => (
//                 <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="feature-card" style={{ padding: '2rem', borderRadius: '20px', textAlign: 'center' }}>
//                   <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Playfair Display, serif', marginBottom: '0.5rem' }}>{stat.number}</div>
//                   <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>{stat.label}</div>
//                 </motion.div>
//               ))}
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* ── Features Section ── */}
//       <section id="features" style={{
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         padding: '100px 2rem'
//       }}>
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.6 }}
//           style={{ textAlign: 'center', maxWidth: '750px', marginBottom: '4rem' }}
//         >
//           <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
//             Everything you need to excel
//           </h2>
//           <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
//             Built for students and mentors who engage with complex coursework and need real-time, AI-driven support throughout their learning journey.
//           </p>
//         </motion.div>

//         <div style={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(3, 1fr)',
//           gap: '2rem',
//           width: '100%',
//           maxWidth: '1100px'
//         }}>
//           {[
//             { icon: <Mic size={28} />, title: 'Smart Transcription', desc: 'Real-time AI transcription for every lecture session. Never miss a crucial detail with our highly accurate speech-to-text.' },
//             { icon: <BookOpen size={28} />, title: 'AI Study Guides', desc: 'Automatically generated summaries and flashcards. Review core concepts faster with tailored learning materials.' },
//             { icon: <MessageSquare size={28} />, title: 'Interactive Chat', desc: 'Context-aware chatbot to answer any course query. Get instant, detailed explanations specific to your lecture.' },
//             { icon: <CheckSquare size={28} />, title: 'Dynamic Quizzes', desc: 'Test your knowledge with auto-generated assessments. Identify weak spots and reinforce understanding on the fly.' },
//             { icon: <LayoutGrid size={28} />, title: 'Mentor Dashboard', desc: 'Track progress and manage student interactions. Gain actionable insights into class performance and engagement.' },
//             { icon: <ShieldCheck size={28} />, title: 'Secure Storage', desc: 'All your course materials backed up reliably. Access your files anytime with enterprise-grade cloud security.' }
//           ].map((f, i) => (
//             <motion.div
//               key={i}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ delay: i * 0.1 }}
//               className="feature-card"
//               style={{ padding: '2.5rem', borderRadius: '24px', textAlign: 'left' }}
//             >
//               <div className="card-icon" style={{
//                 color: 'var(--primary)',
//                 marginBottom: '1.5rem',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 width: '60px',
//                 height: '60px',
//                 borderRadius: '16px',
//                 background: 'rgba(79, 70, 229, 0.1)',
//                 transition: 'transform 0.3s ease'
//               }}>
//                 {f.icon}
//               </div>
//               <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}>{f.title}</h3>
//               <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
//             </motion.div>
//           ))}
//         </div>

//         {/* How It Works */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           style={{ marginTop: '100px', textAlign: 'center', marginBottom: '5rem' }}
//         >
//           <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
//             How MindForge Works
//           </h2>
//           <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
//             A seamless pipeline turning raw lectures into an interactive, highly optimized learning experience.
//           </p>
//         </motion.div>

//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', width: '100%', maxWidth: '1100px' }}>
//           <div style={{ position: 'absolute', top: '40px', left: '10%', right: '10%', height: '2px', background: 'rgba(79, 70, 229, 0.2)', zIndex: 0 }} />
//           {[
//             { step: '01', title: 'Upload Media', desc: 'Mentors upload lecture audio or video files to our secure cloud storage.' },
//             { step: '02', title: 'AI Analysis', desc: 'Our AI processes the media, generating highly accurate transcripts in real-time.' },
//             { step: '03', title: 'Smart Generation', desc: 'Study guides, flashcards, and quizzes are automatically created from the transcript.' },
//             { step: '04', title: 'Interactive Learning', desc: 'Students engage with the material and ask questions via our context-aware chatbot.' }
//           ].map((item, i) => (
//             <motion.div
//               key={i}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ delay: i * 0.1 }}
//               style={{ width: '22%', textAlign: 'center', position: 'relative', zIndex: 1 }}
//             >
//               <div className="step-circle" style={{
//                 width: '80px', height: '80px', borderRadius: '50%',
//                 background: 'var(--bg-main)', border: '2px solid var(--primary)',
//                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 margin: '0 auto 1.5rem auto', color: 'var(--primary)',
//                 fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Playfair Display, serif',
//                 boxShadow: '0 0 20px rgba(79, 70, 229, 0.15)'
//               }}>
//                 {item.step}
//               </div>
//               <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', fontFamily: 'Playfair Display, serif' }}>{item.title}</h3>
//               <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</p>
//             </motion.div>
//           ))}
//         </div>

//         {/* Testimonials */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           style={{ marginTop: '120px', textAlign: 'center', marginBottom: '4rem', width: '100%' }}
//         >
//           <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
//             Trusted by Mentors &amp; Students
//           </h2>
//           <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
//             See how MindForge is transforming the educational experience.
//           </p>
//         </motion.div>

//         <div className="marquee-container" style={{ width: '100%' }}>
//           <div className="marquee-track">
//             {[
//               { name: 'Ashok Maranala', role: 'MindForge Mentor', text: 'MindForge has completely changed how I track my students. The AI summaries save me hours of prep time.' },
//               { name: 'Lova Reddy', role: 'Student', text: 'The interactive chatbot is like having a 24/7 tutor. It answers my questions based exactly on what was taught in the lecture.' },
//               { name: 'Pavan B', role: 'MindForge Mentor', text: 'The automated transcriptions and dynamic quizzes are incredible. I can instantly see where the class is struggling.' },
//               { name: 'Tulasi', role: 'Student', text: 'Having the study guides automatically generated from lectures has saved my grades. The flashcards are a game-changer.' },
//               { name: 'Nikhil', role: 'Student', text: 'The seamless integration of lecture videos and instant AI feedback makes revising for exams faster and less stressful.' },
//               { name: 'Ashok Maranala', role: 'MindForge Mentor', text: 'MindForge has completely changed how I track my students. The AI summaries save me hours of prep time.' },
//               { name: 'Lova Reddy', role: 'Student', text: 'The interactive chatbot is like having a 24/7 tutor. It answers my questions based exactly on what was taught in the lecture.' },
//               { name: 'Pavan B', role: 'MindForge Mentor', text: 'The automated transcriptions and dynamic quizzes are incredible. I can instantly see where the class is struggling.' },
//               { name: 'Tulasi', role: 'Student', text: 'Having the study guides automatically generated from lectures has saved my grades. The flashcards are a game-changer.' },
//               { name: 'Nikhil', role: 'Student', text: 'The seamless integration of lecture videos and instant AI feedback makes revising for exams faster and less stressful.' }
//             ].map((review, i) => (
//               <div key={i} className="feature-card" style={{
//                 width: '380px', flexShrink: 0, padding: '2.5rem',
//                 borderRadius: '24px', textAlign: 'left', display: 'flex',
//                 flexDirection: 'column', gap: '1.5rem', whiteSpace: 'normal'
//               }}>
//                 <div style={{ color: 'var(--primary)' }}>
//                   <svg width="30" height="24" viewBox="0 0 30 24" fill="currentColor"><path d="M13.25 0V7.5C13.25 15 8.25 21.5 0 24V16.5C4 15 6 12 6 7.5H0V0H13.25ZM30 0V7.5C30 15 25 21.5 16.75 24V16.5C20.75 15 22.75 12 22.75 7.5H16.75V0H30Z" /></svg>
//                 </div>
//                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, fontStyle: 'italic', flex: 1 }}>"{review.text}"</p>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
//                   <img src={`https://ui-avatars.com/api/?name=${review.name.replace(/ /g, '+')}&background=c5a059&color=fff`} alt={review.name} style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid rgba(79, 70, 229,0.3)' }} />
//                   <div>
//                     <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>{review.name}</h4>
//                     <span style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{review.role}</span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>



//       <div id="contact">
//         <Footer />
//       </div>
//     </div>
//   );
// };

// export default Home;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';
import { Sparkles, LayoutGrid, ArrowRight, LogIn, Mic, BookOpen, MessageSquare, CheckSquare, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const Home = () => {
  const [activeSection, setActiveSection] = useState('home');

  // Smooth scroll to section
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const sections = ['home', 'features', 'about', 'contact'];
    const handleScroll = () => {
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'Features', id: 'features' },
    { label: 'About', id: 'about' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>

      {/* ── Navbar ── */}
      <nav style={{
        padding: '1.5rem 6rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1000,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(10px)',
        boxSizing: 'border-box'
      }}>
        <div style={{ flex: 1 }}>
          <Logo size={50} />
        </div>

        <div style={{ display: 'flex', gap: '2.5rem', flex: 2, justifyContent: 'center' }}>
          {navItems.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              style={{
                background: 'none',
                border: 'none',
                color: activeSection === id ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: '0.9rem',
                fontWeight: activeSection === id ? 700 : 500,
                cursor: 'pointer',
                padding: '4px 0',
                borderBottom: activeSection === id ? '2px solid var(--primary)' : '2px solid transparent',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
  
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button className="glow-btn" style={{ padding: '10px 24px', fontSize: '0.85rem' }}>
              <LogIn size={16} /> Login
            </button>
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section id="home" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        paddingTop: '200px',
        paddingBottom: '100px'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <div className="capsule-label">
            <Sparkles size={14} />
            THE ULTIMATE AI STUDY COMPANION
          </div>

          <h1 className="hero-title">
            Expand your mind. <br />
            Master your <span style={{ color: 'var(--primary)' }}>universe.</span>
          </h1>

          <p className="hero-subtitle">
            MindForge harnesses advanced AI to instantly turn your lectures into interactive study guides, dynamic quizzes, and a 24/7 personal tutor. Learning has never been this seamless.
          </p>

          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button className="glow-btn">
              Get Started <ArrowRight size={18} />
            </button>
          </Link>
        </motion.div>
      </section>

      {/* ── About Section ── */}
      <section id="about" style={{ padding: '100px 6rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="capsule-label" style={{ marginBottom: '1.5rem' }}>
              <Sparkles size={14} /> ABOUT US
            </div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1.2 }}>
              Built for the future of <span style={{ color: 'var(--primary)' }}>learning</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              MindForge was founded with a singular mission: to bridge the gap between classroom lectures and deep student understanding using the power of artificial intelligence.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
              Our platform empowers mentors to upload lecture content and instantly generates a full suite of study tools — transcripts, summaries, flashcards, quizzes, and an AI tutor — all tailored to the exact material taught.
            </p>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button className="glow-btn">
                Join MindForge <ArrowRight size={18} />
              </button>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {[
                { number: '10K+', label: 'Active Students' },
                { number: '500+', label: 'Mentors Worldwide' },
                { number: '98%', label: 'Accuracy Rate' },
                { number: '24/7', label: 'AI Support' }
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="feature-card" style={{ padding: '2rem', borderRadius: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Playfair Display, serif', marginBottom: '0.5rem' }}>{stat.number}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '100px 2rem'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', maxWidth: '750px', marginBottom: '4rem' }}
        >
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Everything you need to excel
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Built for students and mentors who engage with complex coursework and need real-time, AI-driven support throughout their learning journey.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem',
          width: '100%',
          maxWidth: '1100px'
        }}>
          {[
            { icon: <Mic size={28} />, title: 'Smart Transcription', desc: 'Real-time AI transcription for every lecture session. Never miss a crucial detail with our highly accurate speech-to-text.' },
            { icon: <BookOpen size={28} />, title: 'AI Study Guides', desc: 'Automatically generated summaries and flashcards. Review core concepts faster with tailored learning materials.' },
            { icon: <MessageSquare size={28} />, title: 'Interactive Chat', desc: 'Context-aware chatbot to answer any course query. Get instant, detailed explanations specific to your lecture.' },
            { icon: <CheckSquare size={28} />, title: 'Dynamic Quizzes', desc: 'Test your knowledge with auto-generated assessments. Identify weak spots and reinforce understanding on the fly.' },
            { icon: <LayoutGrid size={28} />, title: 'Mentor Dashboard', desc: 'Track progress and manage student interactions. Gain actionable insights into class performance and engagement.' },
            { icon: <ShieldCheck size={28} />, title: 'Secure Storage', desc: 'All your course materials backed up reliably. Access your files anytime with enterprise-grade cloud security.' }
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="feature-card"
              style={{ padding: '2.5rem', borderRadius: '24px', textAlign: 'left' }}
            >
              <div className="card-icon" style={{
                color: 'var(--primary)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: 'rgba(79, 70, 229, 0.1)',
                transition: 'transform 0.3s ease'
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginTop: '100px', textAlign: 'center', marginBottom: '5rem' }}
        >
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            How MindForge Works
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            A seamless pipeline turning raw lectures into an interactive, highly optimized learning experience.
          </p>
        </motion.div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', width: '100%', maxWidth: '1100px' }}>
          <div style={{ position: 'absolute', top: '40px', left: '10%', right: '10%', height: '2px', background: 'rgba(79, 70, 229, 0.2)', zIndex: 0 }} />
          {[
            { step: '01', title: 'Upload Media', desc: 'Mentors upload lecture audio or video files to our secure cloud storage.' },
            { step: '02', title: 'AI Analysis', desc: 'Our AI processes the media, generating highly accurate transcripts in real-time.' },
            { step: '03', title: 'Smart Generation', desc: 'Study guides, flashcards, and quizzes are automatically created from the transcript.' },
            { step: '04', title: 'Interactive Learning', desc: 'Students engage with the material and ask questions via our context-aware chatbot.' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{ width: '22%', textAlign: 'center', position: 'relative', zIndex: 1 }}
            >
              <div className="step-circle" style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'var(--bg-main)', border: '2px solid var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem auto', color: 'var(--primary)',
                fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Playfair Display, serif',
                boxShadow: '0 0 20px rgba(79, 70, 229, 0.15)'
              }}>
                {item.step}
              </div>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', fontFamily: 'Playfair Display, serif' }}>{item.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginTop: '120px', textAlign: 'center', marginBottom: '4rem', width: '100%' }}
        >
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Trusted by Mentors &amp; Students
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            See how MindForge is transforming the educational experience.
          </p>
        </motion.div>

        <div className="marquee-container" style={{ width: '100%' }}>
          <div className="marquee-track">
            {[
              { name: 'Hannu', role: 'MindForge Mentor', text: 'MindForge has completely changed how I track my students. The AI summaries save me hours of prep time.' },
              { name: 'Anudeep', role: 'Student', text: 'The interactive chatbot is like having a 24/7 tutor. It answers my questions based exactly on what was taught in the lecture.' },
              { name: 'Pavan ', role: 'MindForge Mentor', text: 'The automated transcriptions and dynamic quizzes are incredible. I can instantly see where the class is struggling.' },
              { name: 'Surekha', role: 'Student', text: 'Having the study guides automatically generated from lectures has saved my grades. The flashcards are a game-changer.' },
              { name: 'Geetha', role: 'Student', text: 'The seamless integration of lecture videos and instant AI feedback makes revising for exams faster and less stressful.' },
              { name: 'Hannu', role: 'MindForge Mentor', text: 'MindForge has completely changed how I track my students. The AI summaries save me hours of prep time.' },
              { name: 'Krish', role: 'Student', text: 'The interactive chatbot is like having a 24/7 tutor. It answers my questions based exactly on what was taught in the lecture.' },
              { name: 'Pavan ', role: 'MindForge Mentor', text: 'The automated transcriptions and dynamic quizzes are incredible. I can instantly see where the class is struggling.' },
              { name: 'Surekha', role: 'Student', text: 'Having the study guides automatically generated from lectures has saved my grades. The flashcards are a game-changer.' },
              { name: 'Geetha', role: 'Student', text: 'The seamless integration of lecture videos and instant AI feedback makes revising for exams faster and less stressful.' }
            ].map((review, i) => (
              <div key={i} className="feature-card" style={{
                width: '380px', flexShrink: 0, padding: '2.5rem',
                borderRadius: '24px', textAlign: 'left', display: 'flex',
                flexDirection: 'column', gap: '1.5rem', whiteSpace: 'normal'
              }}>
                <div style={{ color: 'var(--primary)' }}>
                  <svg width="30" height="24" viewBox="0 0 30 24" fill="currentColor"><path d="M13.25 0V7.5C13.25 15 8.25 21.5 0 24V16.5C4 15 6 12 6 7.5H0V0H13.25ZM30 0V7.5C30 15 25 21.5 16.75 24V16.5C20.75 15 22.75 12 22.75 7.5H16.75V0H30Z" /></svg>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, fontStyle: 'italic', flex: 1 }}>"{review.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={`https://ui-avatars.com/api/?name=${review.name.replace(/ /g, '+')}&background=c5a059&color=fff`} alt={review.name} style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid rgba(79, 70, 229,0.3)' }} />
                  <div>
                    <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>{review.name}</h4>
                    <span style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{review.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      <div id="contact">
        <Footer />
      </div>
    </div>
  );
};

export default Home;

