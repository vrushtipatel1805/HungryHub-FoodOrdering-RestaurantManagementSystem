import { FiFacebook, FiInstagram, FiTwitter, FiLinkedin, FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: FiFacebook, label: 'Facebook', href: '#' },
    { icon: FiInstagram, label: 'Instagram', href: '#' },
    { icon: FiTwitter, label: 'X/Twitter', href: '#' },
    { icon: FiLinkedin, label: 'LinkedIn', href: '#' },
  ];

  return (
    <footer className="border-t-4 border-rust-600 bg-rust-500">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <span className="text-lg font-bold text-white">🍽️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Hungry Hub</h3>
                <p className="text-xs text-white/70">Since 2015</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/80">
              Crafted for memorable dining experiences. Authentic vegetarian cuisine with contemporary flair and warm hospitality.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Contact Detail</h4>
            <div className="space-y-3 text-sm text-white/90">
              <div className="flex items-start gap-3">
                <FiMapPin className="mt-0.5 flex-shrink-0 text-white" />
                <p>
                  HungryHub Restaurant,<br />
                  Ahmedabad,<br />
                  Gujarat, India
                </p>
              </div>
              <div className="flex items-center gap-3">
                <FiClock className="flex-shrink-0 text-white" />
                <p>10:00 AM - 11:00 PM</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Call Us</h4>
            <div className="space-y-3 text-sm text-white/90">
              <div className="flex items-center gap-3">
                <FiPhone className="flex-shrink-0 text-white" />
                <a href="tel:+919876543210" className="transition hover:text-white/70">
                  T: +91 9876543210
                </a>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="flex-shrink-0 text-white" />
                <a href="mailto:info@hungryhub.com" className="transition hover:text-white/70">
                  E: info@hungryhub.com
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Follow Us</h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-white transition hover:bg-white hover:text-rust-500"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t-2 border-white/20 pt-8">
          <div className="flex items-center justify-center">
            <p className="text-center text-sm text-white/70">
              © {currentYear} Hungry Hub. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
