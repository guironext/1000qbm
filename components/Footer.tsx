import React from "react";

const Footer = () => {
  return (
    <div>
      <footer className="bg-gray-900 text-white  py-3 px-6 rounded-b-3xl text-xs ">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
          {/* Left */}
          <div className="order-1 sm:order-none">
            Concepteur: Pasteur DESSI KOFFI
          </div>

          {/* Center */}
          <div className="order-3 sm:order-none text-center">
            <p className="text-xs ">Contactez-nous : +225 0747656104</p>
            <p className="text-xs ">
              © 2025 - 1000 Questions Bibliques pour Moi
            </p>
          </div>

          {/* Right */}
          <div className="order-2 sm:order-none sm:text-right">
            Dev: Guiro G.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
