import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-logo">AI BlogForge</div>
      <p>&copy; {new Date().getFullYear()} AI BlogForge. Powered by Gemini AI & MERN Stack.</p>
    </footer>
  );
};

export default Footer;
