import React from 'react';
import { NavLink } from 'react-router-dom';


const Icon = ({ path }) => (
  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path}></path>
  </svg>
);

const Sidebar = () => {
  const activeLinkStyle = {
    backgroundColor: '#e0f2fe', 
    color: '#0284c7', 
    fontWeight: '600',
  };

  const linkClass = "flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200";

  return (
    <aside className="w-64 min-h-screen bg-white shadow-md flex-shrink-0">
      <div className="p-4">
        <h2 className="text-xl font-bold text-center text-blue-600">Menu Insight</h2>
      </div>
      <nav className="p-4">
        <ul>
          <li className="mb-2">
            <NavLink to="/" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)} className={linkClass}>
              <Icon path="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              Keuangan
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink to="/volume" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)} className={linkClass}>
              <Icon path="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
              Volume
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink to="/peta" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)} className={linkClass}>
              <Icon path="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 13v-6m6 10V7" />
              Peta Sebaran
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink to="/armada" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)} className={linkClass}>
              <Icon path="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0117.657 18.657z" />
              Armada
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink to="/sopir" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)} className={linkClass}>
              <Icon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              Kinerja Sopir
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink to="/harian" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)} className={linkClass}>
              <Icon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              Kinerja Harian
            </NavLink>
          </li>
           <li className="mb-2">
            <NavLink to="/peringatan" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)} className={linkClass}>
              <Icon path="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              Peringatan
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
