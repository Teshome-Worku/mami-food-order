import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiMenu, FiX, FiShoppingCart } from "react-icons/fi";

import useBodyScrollLock from "../hooks/useBodyScrollLock";
import { BRAND_NAME, ROUTES } from "../constants";
import { useCart } from "../context/cartContext";

const navLinks = [
  { to: ROUTES.HOME, label: "Home", end: true },
  { to: ROUTES.MENU, label: "Menu" },
  { to: ROUTES.TRACK_ORDER, label: "Track Order" },
];

const navItemClass = ({ isActive }) =>
  [
    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "font-semibold text-orange-500"
      : "text-gray-600 hover:text-orange-500",
  ].join(" ");

const mobileNavItemClass = ({ isActive }) =>
  [
    "block rounded-lg px-4 py-3 text-base font-medium transition-colors",
    isActive
      ? "bg-orange-50 font-semibold text-orange-500"
      : "text-gray-700 hover:bg-gray-50 hover:text-orange-500",
  ].join(" ");

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount, openCart } = useCart();

  useBodyScrollLock(isMenuOpen);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <NavLink
          to={ROUTES.HOME}
          className="text-xl font-extrabold tracking-tight text-orange-500 sm:text-2xl"
          onClick={closeMenu}
        >
          {BRAND_NAME}
        </NavLink>

        <div className="flex items-center gap-2">
          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={navItemClass}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Cart button */}
          <button
            type="button"
            onClick={openCart}
            className="relative ml-1 flex items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-orange-600 active:scale-95"
            aria-label={`Cart with ${cartCount} items`}
          >
            <FiShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-orange-500">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="ml-1 inline-flex items-center justify-center rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? (
              <FiX className="h-5 w-5" />
            ) : (
              <FiMenu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t border-gray-100 bg-white transition-all duration-300 ease-out md:hidden ${
          isMenuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl space-y-1 px-4 py-3">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={mobileNavItemClass}
              onClick={closeMenu}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
