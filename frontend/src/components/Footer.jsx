import { Link } from "react-router-dom";
import { FiPhone, FiMapPin, FiMail } from "react-icons/fi";

import { BRAND_NAME, ROUTES } from "../constants";

const Footer = () => (
  <footer className="mt-auto bg-gray-900 text-gray-300">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:gap-12">
      {/* Brand */}
      <div className="md:col-span-1">
        <h2 className="mb-3 text-xl font-extrabold tracking-tight text-white">
          {BRAND_NAME}
        </h2>
        <p className="text-sm leading-relaxed text-gray-400">
          Delicious food made with love and fresh ingredients, delivered fast to
          your doorstep.
        </p>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Quick Links
        </h3>
        <ul className="space-y-2 text-sm">
          <li>
            <Link to={ROUTES.HOME} className="transition hover:text-white">
              Home
            </Link>
          </li>
          <li>
            <Link to={ROUTES.MENU} className="transition hover:text-white">
              Menu
            </Link>
          </li>
          <li>
            <Link to={ROUTES.TRACK_ORDER} className="transition hover:text-white">
              Track Order
            </Link>
          </li>
          <li>
            <Link to={ROUTES.CART} className="transition hover:text-white">
              Cart
            </Link>
          </li>
        </ul>
      </div>

      {/* Contact Info */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Contact
        </h3>
        <ul className="space-y-2.5 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
            <span>
              Adama, Ethiopia
              <br />
              Bole Sub City
            </span>
          </li>
          <li className="flex items-center gap-2">
            <FiPhone className="h-4 w-4 shrink-0 text-orange-500" />
            <span>+251 912 345 678</span>
          </li>
          <li className="flex items-center gap-2">
            <FiMail className="h-4 w-4 shrink-0 text-orange-500" />
            <span>info@mamifood.com</span>
          </li>
        </ul>
      </div>

      {/* Hours */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Working Hours
        </h3>
        <ul className="space-y-1.5 text-sm text-gray-400">
          <li className="flex justify-between">
            <span>Mon - Fri</span>
            <span className="text-gray-300">8:00 AM - 10:00 PM</span>
          </li>
          <li className="flex justify-between">
            <span>Saturday</span>
            <span className="text-gray-300">9:00 AM - 11:00 PM</span>
          </li>
          <li className="flex justify-between">
            <span>Sunday</span>
            <span className="text-gray-300">10:00 AM - 9:00 PM</span>
          </li>
        </ul>
      </div>
    </div>

    <div className="border-t border-gray-800 px-4 py-5 text-center text-sm text-gray-500 sm:px-6">
      &copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
    </div>
  </footer>
);

export default Footer;
