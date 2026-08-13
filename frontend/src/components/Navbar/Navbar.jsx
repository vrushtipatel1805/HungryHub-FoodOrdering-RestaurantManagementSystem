import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/order-now', label: 'Order Now' },
  { to: '/menu', label: 'Menu' },
  { to: '/taste-match', label: 'AI Taste Match' },
  { to: '/reserve', label: 'Reserve Table' },
  { to: '/feedback', label: 'Feedback' },
  { to: '/about', label: 'About Us' },
  { to: '/login', label: 'Sign In' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalQty } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--navbar-height', `${height}px`);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const handleMenuLinkClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const element = document.getElementById('menu-categories');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/?scroll=menu-categories');
    }
    setMobileOpen(false);
  };

  return (
    <>
      <header ref={headerRef} className="sticky top-0 z-50 border-b border-rust-100 bg-rust-500 backdrop-blur-xl shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <NavLink to="/" className="text-2xl font-bold tracking-wide text-white transition hover:scale-[1.02]">
            HungryHub
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${isActive ? 'bg-rust-600 text-white shadow-md' : 'text-white/80 hover:text-white hover:bg-rust-600'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <NavLink to="/cart" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-rust-500 transition hover:bg-rust-50 shadow-md">
              Cart ({totalQty})
            </NavLink>
            {user?.name !== 'Guest' ? (
              <button onClick={handleLogout} className="hidden rounded-full border-2 border-white px-3 py-2 text-sm text-white transition hover:bg-rust-600 md:block">
                Logout
              </button>
            ) : null}
            <button onClick={() => setMobileOpen((prev) => !prev)} className="rounded-full border-2 border-white p-2 text-white transition hover:bg-rust-600 md:hidden">
              {mobileOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="border-t border-rust-600 bg-rust-600 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {links.map((link) => {
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `rounded-2xl px-3 py-3 text-sm font-medium transition ${isActive ? 'bg-rust-700 text-white' : 'text-white/80 hover:bg-rust-700 hover:text-white'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                );
              })}
              {user?.name !== 'Guest' ? (
                <button onClick={handleLogout} className="rounded-2xl border-2 border-white px-3 py-3 text-left text-sm font-medium text-white">
                  Logout
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}
