import { FiShoppingCart } from "react-icons/fi";

const CartIcon = ({ cartCount = 0 }) => (
  <span className="relative flex">
    <FiShoppingCart className="text-2xl text-white" aria-hidden="true" />
    {cartCount > 0 && (
      <span
        className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
        aria-hidden="true"
      >
        {cartCount > 99 ? "99+" : cartCount}
      </span>
    )}
  </span>
);

export default CartIcon;
