import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiClock, FiMapPin, FiShoppingBag, FiStar, FiTruck } from "react-icons/fi";

import StarRating from "../components/StarRating";
import { BRAND_NAME, ROUTES } from "../constants";
import { api } from "../services/api";
import { formatCurrency } from "../utils/formatters";

const normalizeMenuResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.menuItems)) return data.menuItems;
  if (Array.isArray(data?.menu)) return data.menu;
  return [];
};

const steps = [
  {
    icon: FiShoppingBag,
    title: "Browse Menu",
    desc: "Explore our wide range of delicious meals and drinks.",
  },
  {
    icon: FiMapPin,
    title: "Place Your Order",
    desc: "Add items to cart, enter your delivery details, and confirm.",
  },
  {
    icon: FiTruck,
    title: "Fast Delivery",
    desc: "Sit back and relax. Your food arrives fresh and hot!",
  },
];

const testimonials = [
  {
    name: "Sara M.",
    text: "The food is always fresh and delivery is super quick! My go-to for weeknight dinners.",
    rating: 5,
  },
  {
    name: "Abel T.",
    text: "Best cheese pizza in Adama. The online ordering is so convenient too.",
    rating: 5,
  },
  {
    name: "Liya K.",
    text: "Love the creamy pasta! Great quality at very fair prices. Highly recommend.",
    rating: 4,
  },
];

const Home = () => {
  const [popularItems, setPopularItems] = useState([]);

  useEffect(() => {
    let cancelled = false;
    api
      .getMenu()
      .then((data) => {
        if (!cancelled) {
          const items = normalizeMenuResponse(data);
          const popular = items
            .filter((i) => i.tags?.includes("popular") || i.tags?.includes("best-seller"))
            .slice(0, 3);
          setPopularItems(popular.length > 0 ? popular : items.slice(0, 3));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092"
          alt="Food background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        <div className="relative z-10 px-4 text-center text-white sm:px-6">
          <h1 className="animate-hero mb-4 text-3xl font-extrabold leading-tight sm:text-4xl md:text-6xl">
            Delicious Food,
            <br />
            <span className="text-orange-400">Delivered Fast</span>
          </h1>
          <p className="animate-hero-delay mb-8 text-base text-gray-200 sm:text-lg md:text-xl">
            Order your favorite meals from {BRAND_NAME} with just one click
          </p>
          <div className="animate-hero-delay-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={ROUTES.MENU}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600 hover:shadow-xl sm:px-8 sm:text-lg"
            >
              <FiShoppingBag className="h-5 w-5" />
              Order Now
            </Link>
            <Link
              to={ROUTES.TRACK_ORDER}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/60 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:border-white hover:bg-white/10 sm:px-8 sm:text-lg"
            >
              Track Existing Order
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Stats Strip */}
      <section className="relative z-10 -mt-8 mx-auto max-w-4xl px-4 sm:px-6">
        <div className="grid grid-cols-3 gap-3 rounded-2xl bg-white p-4 shadow-xl sm:gap-6 sm:p-6">
          <div className="text-center">
            <p className="text-xl font-extrabold text-orange-500 sm:text-3xl">
              500+
            </p>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
              Happy Customers
            </p>
          </div>
          <div className="text-center">
            <p className="text-xl font-extrabold text-orange-500 sm:text-3xl">
              12+
            </p>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">Menu Items</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-extrabold text-orange-500 sm:text-3xl">
              30min
            </p>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
              Avg. Delivery
            </p>
          </div>
        </div>
      </section>

      {/* Popular Items */}
      {popularItems.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Popular Picks
            </h2>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Our customers&apos; most loved dishes
            </p>
          </div>
          <div className="stagger-children grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {popularItems.map((food) => (
              <Link
                key={food.id}
                to={ROUTES.MENU}
                className="group overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={food.image}
                    alt={food.name}
                    loading="lazy"
                    className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110 sm:h-52"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  {food.prepTime && (
                    <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm">
                      <FiClock className="h-3 w-3" />
                      {food.prepTime} min
                    </span>
                  )}
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                      {food.name}
                    </h3>
                    <span className="whitespace-nowrap font-bold text-orange-600">
                      {formatCurrency(food.price)}
                    </span>
                  </div>
                  {food.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-gray-500">
                      {food.description}
                    </p>
                  )}
                  {food.rating && (
                    <div className="mt-3">
                      <StarRating
                        rating={food.rating}
                        reviewCount={food.reviewCount}
                      />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              to={ROUTES.MENU}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-orange-500 px-6 py-3 text-sm font-semibold text-orange-500 transition hover:bg-orange-500 hover:text-white"
            >
              View Full Menu
            </Link>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="bg-orange-50/60 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              How It Works
            </h2>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Ordering your favorite food is easy as 1-2-3
            </p>
          </div>
          <div className="stagger-children grid gap-6 sm:gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="relative rounded-2xl bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md sm:p-8"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-500">
                  <step.icon className="h-7 w-7" />
                </div>
                <span className="absolute right-4 top-4 text-3xl font-extrabold text-orange-100">
                  {i + 1}
                </span>
                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Why Choose {BRAND_NAME}?
            </h2>
          </div>
          <div className="stagger-children grid gap-6 sm:gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md sm:p-8">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 text-xl">
                🥬
              </div>
              <h3 className="mb-2 text-lg font-bold sm:text-xl">Fresh Ingredients</h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Prepared daily with fresh, locally sourced ingredients you can trust.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md sm:p-8">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xl">
                ⚡
              </div>
              <h3 className="mb-2 text-lg font-bold sm:text-xl">Lightning Fast</h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Average delivery in 30 minutes. Your food arrives while it&apos;s still hot!
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md sm:p-8">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xl">
                💰
              </div>
              <h3 className="mb-2 text-lg font-bold sm:text-xl">Fair Prices</h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Restaurant-quality meals at prices everyone can afford. No hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-900 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              What Our Customers Say
            </h2>
            <p className="mt-2 text-sm text-gray-400 sm:text-base">
              Real reviews from our happy customers
            </p>
          </div>
          <div className="stagger-children grid gap-6 sm:gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl bg-gray-800/60 p-6 backdrop-blur-sm sm:p-8"
              >
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <FiStar
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="mb-4 text-sm leading-relaxed text-gray-300">
                  &ldquo;{t.text}&rdquo;
                </p>
                <p className="text-sm font-semibold text-white">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Hungry? We&apos;ve Got You Covered
          </h2>
          <p className="mt-3 text-sm text-gray-500 sm:text-base">
            Browse our menu and get your favorite food delivered in minutes.
          </p>
          <Link
            to={ROUTES.MENU}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600 hover:shadow-xl sm:text-lg"
          >
            <FiShoppingBag className="h-5 w-5" />
            Order Now
          </Link>
        </div>
      </section>
    </>
  );
};

export default Home;
