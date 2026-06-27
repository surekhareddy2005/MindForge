// import React, { useState, useEffect } from 'react';
// import { 
//   LayoutDashboard, 
//   BookOpen, 
//   FileText, 
//   Settings, 
//   LogOut,
//   MessageSquare,
//   Users
// } from 'lucide-react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import Logo from './Logo';

// const Sidebar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isOpen, setIsOpen] = useState(false);
  
//   useEffect(() => {
//     const handleToggle = () => setIsOpen(prev => !prev);
//     const handleClose = () => setIsOpen(false);
    
//     window.addEventListener('toggleSidebar', handleToggle);
//     window.addEventListener('closeSidebar', handleClose);
    
//     return () => {
//       window.removeEventListener('toggleSidebar', handleToggle);
//       window.removeEventListener('closeSidebar', handleClose);
//     };
//   }, []);

//   // Close sidebar on navigation
//   useEffect(() => {
//     setIsOpen(false);
//   }, [location.pathname]);

//   let user = {};
//   try {
//     user = JSON.parse(localStorage.getItem('user') || '{}') || {};
//   } catch (e) {
//     console.error('Error parsing user from localStorage', e);
//   }

//   const handleLogout = () => {
//     localStorage.clear();
//     navigate('/login');
//   };

//   const isAdmin = user.role === 'admin';
//   const isStudent = user.role === 'student';
//   const isMentor = user.role === 'mentor';

//   const dashboardPath = isAdmin ? '/admin/dashboard' : (isStudent ? '/student/dashboard' : '/dashboard');
//   const settingsPath = isStudent ? '/student/settings' : '/settings';
//   const feedbackPath = isStudent ? '/student/feedback' : '/feedback';

//   const navItems = [
//     { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: dashboardPath },
//   ];

//   if (isAdmin) {
//     navItems.push({ icon: <Users size={20} />, label: 'Users', path: '/admin/users' });
//     navItems.push({ icon: <BookOpen size={20} />, label: 'Courses', path: '/admin/courses' });
//   } else {
//     const coursesPath = isStudent ? '/student/courses' : '/courses';
//     const guidesPath = isStudent ? '/student/materials' : '/guides';
    
//     navItems.push({ icon: <BookOpen size={20} />, label: 'Courses', path: coursesPath });
//     navItems.push({ icon: <FileText size={20} />, label: 'Study Guides', path: guidesPath });

//     if (isMentor) {
//       navItems.push({ icon: <Users size={20} />, label: 'Students', path: '/students' });
//       navItems.push({ icon: <MessageSquare size={20} />, label: 'Student Feedback', path: feedbackPath });
//     } else if (isStudent) {
//       navItems.push({ icon: <MessageSquare size={20} />, label: 'Feedback', path: feedbackPath });
//     }
//   }

//   navItems.push({ icon: <Settings size={20} />, label: 'Settings', path: settingsPath });

//   return (
//     <>
//       <div 
//         className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
//         onClick={() => setIsOpen(false)}
//       />
//       <aside className={`glass sidebar-container ${isOpen ? 'open' : ''}`} style={{ 
//         width: '280px', 
//         padding: '2rem 1.5rem', 
//         display: 'flex', 
//         flexDirection: 'column',
//         borderRight: '1px solid var(--border)',
//         height: '100vh',
//         position: 'sticky',
//         top: 0
//       }}>
//       <div style={{ marginBottom: '3rem', cursor: 'pointer' }} onClick={() => navigate(dashboardPath)}>
//         <Logo size={35} />
//       </div>

//       <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
//         {navItems.map((item, i) => {
//           const isActive = location.pathname === item.path;
//           return (
//             <div 
//               key={i} 
//               onClick={() => navigate(item.path)}
//               style={{ 
//                 display: 'flex', 
//                 alignItems: 'center', 
//                 gap: '12px', 
//                 padding: '12px 16px', 
//                 borderRadius: '12px',
//                 color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
//                 background: isActive ? 'var(--primary-surface)' : 'transparent',
//                 cursor: 'pointer',
//                 transition: 'var(--transition)',
//                 fontWeight: isActive ? 600 : 400
//               }}
//             >
//               {item.icon}
//               <span>{item.label}</span>
//             </div>
//           );
//         })}
//       </nav>

//       <button 
//         onClick={handleLogout}
//         className="nav-item-logout"
//         style={{ 
//           display: 'flex', 
//           alignItems: 'center', 
//           gap: '12px', 
//           padding: '12px 16px', 
//           borderRadius: '12px',
//           color: 'var(--text-secondary)',
//           background: 'transparent',
//           border: '1px solid transparent',
//           cursor: 'pointer',
//           marginTop: 'auto',
//           transition: 'all 0.3s ease',
//           fontWeight: 400,
//           fontFamily: 'inherit',
//           fontSize: '1rem'
//         }}
//         onMouseEnter={(e) => {
//           e.currentTarget.style.color = 'var(--primary)';
//           e.currentTarget.style.background = 'var(--primary-surface)';
//           e.currentTarget.style.border = '1px solid var(--border)';
//         }}
//         onMouseLeave={(e) => {
//           e.currentTarget.style.color = 'var(--text-secondary)';
//           e.currentTarget.style.background = 'transparent';
//           e.currentTarget.style.border = '1px solid transparent';
//         }}
//       >
//         <LogOut size={20} />
//         <span>Logout</span>
//       </button>
//       </aside>
//     </>
//   );
// };

// export default Sidebar;
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Settings, 
  LogOut,
  MessageSquare,
  Users
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    const handleClose = () => setIsOpen(false);
    
    window.addEventListener('toggleSidebar', handleToggle);
    window.addEventListener('closeSidebar', handleClose);
    
    return () => {
      window.removeEventListener('toggleSidebar', handleToggle);
      window.removeEventListener('closeSidebar', handleClose);
    };
  }, []);

  // Close sidebar on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}') || {};
  } catch (e) {
    console.error('Error parsing user from localStorage', e);
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isAdmin = user.role === 'admin';
  const isStudent = user.role === 'student';
  const isMentor = user.role === 'mentor';

  const dashboardPath = isAdmin ? '/admin/dashboard' : (isStudent ? '/student/dashboard' : '/dashboard');
  const settingsPath = isStudent ? '/student/settings' : '/settings';
  const feedbackPath = isStudent ? '/student/feedback' : '/feedback';

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: dashboardPath },
  ];

  if (isAdmin) {
    navItems.push({ icon: <Users size={20} />, label: 'Users', path: '/admin/users' });
    navItems.push({ icon: <BookOpen size={20} />, label: 'Courses', path: '/admin/courses' });
  } else {
    const coursesPath = isStudent ? '/student/courses' : '/courses';
    const guidesPath = isStudent ? '/student/materials' : '/guides';
    
    navItems.push({ icon: <BookOpen size={20} />, label: 'Courses', path: coursesPath });
    navItems.push({ icon: <FileText size={20} />, label: 'Study Guides', path: guidesPath });

    if (isMentor) {
      navItems.push({ icon: <Users size={20} />, label: 'Students', path: '/students' });
      navItems.push({ icon: <MessageSquare size={20} />, label: 'Student Feedback', path: feedbackPath });
    } else if (isStudent) {
      navItems.push({ icon: <MessageSquare size={20} />, label: 'Feedback', path: feedbackPath });
    }
  }

  navItems.push({ icon: <Settings size={20} />, label: 'Settings', path: settingsPath });

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(false)}
      />
      <aside className={`glass sidebar-container ${isOpen ? 'open' : ''}`} style={{ 
        width: '280px', 
        padding: '2rem 1.5rem', 
        display: 'flex', 
        flexDirection: 'column',
        borderRight: '1px solid var(--border)',
        height: '100vh',
        position: 'sticky',
        top: 0
      }}>
      <div style={{ marginBottom: '3rem', cursor: 'pointer' }} onClick={() => navigate(dashboardPath)}>
        <Logo size={48} />
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <div 
              key={i} 
              onClick={() => navigate(item.path)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px 16px', 
                borderRadius: '12px',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--primary-surface)' : 'transparent',
                cursor: 'pointer',
                transition: 'var(--transition)',
                fontWeight: isActive ? 600 : 400
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <button 
        onClick={handleLogout}
        className="nav-item-logout"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          padding: '12px 16px', 
          borderRadius: '12px',
          color: 'var(--text-secondary)',
          background: 'transparent',
          border: '1px solid transparent',
          cursor: 'pointer',
          marginTop: 'auto',
          transition: 'all 0.3s ease',
          fontWeight: 400,
          fontFamily: 'inherit',
          fontSize: '1rem'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--primary)';
          e.currentTarget.style.background = 'var(--primary-surface)';
          e.currentTarget.style.border = '1px solid var(--border)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.border = '1px solid transparent';
        }}
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
      </aside>
    </>
  );
};

export default Sidebar;

