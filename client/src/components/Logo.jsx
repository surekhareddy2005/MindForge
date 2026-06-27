// // import React from 'react';
// // import { useTheme } from '../utils/ThemeContext';

// // const Logo = ({ size = 60, showText = true }) => {
// //   const { isDarkMode } = useTheme();

// //   return (
// //     <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
// //       <div style={{ 
// //         height: size,
// //         width: size,
// //         overflow: 'hidden',
// //         position: 'relative',
// //         borderRadius: '50%'
// //       }}>
// //         <img 
// //           src={isDarkMode ? "/Logo Dark.png" : "/Logo light.jpeg"} 
// //           alt="MindForge Icon" 
// //           style={{ 
// //             height: size * 1.8, 
// //             position: 'absolute',
// //             top: '-10%', 
// //             left: '-35%',
// //             objectFit: 'contain'
// //           }} 
// //         />
// //       </div>

// //       {showText && (
// //         <h2 className="logo-text" style={{ fontSize: size * 0.6, margin: 0, whiteSpace: 'nowrap' }}>
// //           <span style={{ color: 'var(--text-primary)' }}>Mind</span><span>Forge</span>
// //         </h2>
// //       )}
// //     </div>
// //   );
// // };

// // export default Logo;
// import React from 'react';

// const Logo = ({ size = 60, showText = true }) => {
//   const scale = size / 60;

//   return (
//     <div style={{ display: 'flex', alignItems: 'center', gap: `${12 * scale}px` }}>
//       {/* Icon */}
//       <svg
//         width={size}
//         height={size}
//         viewBox="0 0 60 60"
//         fill="none"
//         xmlns="http://www.w3.org/2000/svg"
//       >
//         <defs>
//           <linearGradient id="mf-icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" stopColor="#4F46E5" />
//             <stop offset="100%" stopColor="#7C3AED" />
//           </linearGradient>
//         </defs>

//         {/* Outer glow ring */}
//         <circle cx="30" cy="30" r="29" fill="url(#mf-icon-grad)" opacity="0.12" />
//         <circle cx="30" cy="30" r="27" fill="none" stroke="url(#mf-icon-grad)" strokeWidth="1" opacity="0.35" />

//         {/* Anvil base */}
//         <rect x="14" y="46" width="32" height="5" rx="2" fill="url(#mf-icon-grad)" />
//         <rect x="18" y="40" width="24" height="7" rx="1.5" fill="url(#mf-icon-grad)" opacity="0.85" />

//         {/* Brain dome */}
//         <path
//           d="M20 40 C20 40 14 34 14 26 C14 18 19 12 26 11 C27.5 7 32 5 36 8 C40 5 44.5 7 46 11 C53 12 58 18 58 26 C58 34 52 40 52 40 Z"
//           transform="scale(0.55) translate(3, 2)"
//           fill="url(#mf-icon-grad)"
//           opacity="0.9"
//         />

//         {/* Simplified brain using direct coords */}
//         <path
//           d="M21 40 C21 40 15 34 15 27 C15 19 20 13 27 13 C28 9 32 7 36 9 C40 7 44 9 45 13 C52 13 57 19 57 27 C57 34 51 40 51 40 Z"
//           transform="matrix(0.52,0,0,0.52,1,1)"
//           fill="url(#mf-icon-grad)"
//           opacity="0.0"
//         />

//         {/* Brain shape direct */}
//         <path
//           d="M19.5 39 C19.5 39 13 33 13 25.5 C13 18 18 12 25 12 C26.5 8 30 6 34 8 C38 6 41.5 8 43 12 C50 12 55 18 55 25.5 C55 33 48.5 39 48.5 39 Z"
//           transform="scale(0.53) translate(3.5, 2)"
//           fill="url(#mf-icon-grad)"
//         />

//         {/* Center split */}
//         <line x1="30" y1="10" x2="30" y2="38" stroke="#0F172A" strokeWidth="1.2" opacity="0.4" />

//         {/* Brain fold accents */}
//         <path d="M18 24 C20 21 23 22 23 25" fill="none" stroke="#F8FAFC" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
//         <path d="M17 30 C19.5 27 22 29 21 32" fill="none" stroke="#F8FAFC" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
//         <path d="M42 24 C40 21 37 22 37 25" fill="none" stroke="#F8FAFC" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
//         <path d="M43 30 C40.5 27 38 29 39 32" fill="none" stroke="#F8FAFC" strokeWidth="1" strokeLinecap="round" opacity="0.45" />

//         {/* Lightning bolt (forge spark) */}
//         <path
//           d="M28 16 L23 27 L28.5 27 L24 38 L38 22 L31.5 22 L36 16 Z"
//           fill="#06B6D4"
//           opacity="0.95"
//         />

//         {/* Spark dots */}
//         <circle cx="16" cy="20" r="1.5" fill="#06B6D4" opacity="0.65" />
//         <circle cx="44" cy="20" r="1.5" fill="#7C3AED" opacity="0.65" />
//       </svg>

//       {showText && (
//         <h2
//           className="logo-text"
//           style={{ fontSize: size * 0.38, margin: 0, whiteSpace: 'nowrap', lineHeight: 1 }}
//         >
//           <span style={{ color: '#F8FAFC' }}>Mind</span>
//           <span style={{ color: '#4F46E5' }}>Forge</span>
//         </h2>
//       )}
//     </div>
//   );
// };

// export default Logo;
import React from 'react';

const Logo = ({ size = 60, showText = true }) => {
  const scale = size / 60;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: `${14 * scale}px` }}>
      {/* Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="mf-icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>

        {/* Outer glow ring */}
        <circle cx="30" cy="30" r="29" fill="url(#mf-icon-grad)" opacity="0.12" />
        <circle cx="30" cy="30" r="27" fill="none" stroke="url(#mf-icon-grad)" strokeWidth="1" opacity="0.35" />

        {/* Anvil base */}
        <rect x="14" y="46" width="32" height="5" rx="2" fill="url(#mf-icon-grad)" />
        <rect x="18" y="40" width="24" height="7" rx="1.5" fill="url(#mf-icon-grad)" opacity="0.85" />

        {/* Brain dome */}
        <path
          d="M20 40 C20 40 14 34 14 26 C14 18 19 12 26 11 C27.5 7 32 5 36 8 C40 5 44.5 7 46 11 C53 12 58 18 58 26 C58 34 52 40 52 40 Z"
          transform="scale(0.55) translate(3, 2)"
          fill="url(#mf-icon-grad)"
          opacity="0.9"
        />

        {/* Simplified brain using direct coords */}
        <path
          d="M21 40 C21 40 15 34 15 27 C15 19 20 13 27 13 C28 9 32 7 36 9 C40 7 44 9 45 13 C52 13 57 19 57 27 C57 34 51 40 51 40 Z"
          transform="matrix(0.52,0,0,0.52,1,1)"
          fill="url(#mf-icon-grad)"
          opacity="0.0"
        />

        {/* Brain shape direct */}
        <path
          d="M19.5 39 C19.5 39 13 33 13 25.5 C13 18 18 12 25 12 C26.5 8 30 6 34 8 C38 6 41.5 8 43 12 C50 12 55 18 55 25.5 C55 33 48.5 39 48.5 39 Z"
          transform="scale(0.53) translate(3.5, 2)"
          fill="url(#mf-icon-grad)"
        />

        {/* Center split */}
        <line x1="30" y1="10" x2="30" y2="38" stroke="#0F172A" strokeWidth="1.2" opacity="0.4" />

        {/* Brain fold accents */}
        <path d="M18 24 C20 21 23 22 23 25" fill="none" stroke="#F8FAFC" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
        <path d="M17 30 C19.5 27 22 29 21 32" fill="none" stroke="#F8FAFC" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
        <path d="M42 24 C40 21 37 22 37 25" fill="none" stroke="#F8FAFC" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
        <path d="M43 30 C40.5 27 38 29 39 32" fill="none" stroke="#F8FAFC" strokeWidth="1" strokeLinecap="round" opacity="0.45" />

        {/* Lightning bolt (forge spark) */}
        <path
          d="M28 16 L23 27 L28.5 27 L24 38 L38 22 L31.5 22 L36 16 Z"
          fill="#06B6D4"
          opacity="0.95"
        />

        {/* Spark dots */}
        <circle cx="16" cy="20" r="1.5" fill="#06B6D4" opacity="0.65" />
        <circle cx="44" cy="20" r="1.5" fill="#7C3AED" opacity="0.65" />
      </svg>

      {showText && (
        <h2
          className="logo-text"
          style={{ fontSize: size * 0.45, margin: 0, whiteSpace: 'nowrap', lineHeight: 1 }}
        >
          <span style={{ color: '#F8FAFC' }}>Mind</span>
          <span style={{ color: '#4F46E5' }}>Forge</span>
        </h2>
      )}
    </div>
  );
};

export default Logo;
