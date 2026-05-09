import { Link } from 'react-router-dom'
import { Camera, MessageCircle, Users, Play, Mail, Phone } from 'lucide-react'

const footerLinks = {
  Company:   ['About Us', 'Careers', 'Blog', 'Press'],
  Explore:   ['Restaurants', 'Cafes', 'Sweet Shops', 'Offers'],
  Support:   ['Help Center', 'Safety', 'Terms', 'Privacy'],
}

// Using generic icons as brand icons aren't in this lucide-react version
const socials = [
  { icon: Camera,        label: 'Instagram', href: '#' },
  { icon: MessageCircle, label: 'Twitter',   href: '#' },
  { icon: Users,         label: 'Facebook',  href: '#' },
  { icon: Play,          label: 'YouTube',   href: '#' },
]

const Footer = () => (
  <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🍽️</span>
            <span className="text-xl font-extrabold text-white">FoodieHub</span>
          </div>
          <p className="text-sm leading-relaxed mb-4">
            Delivering happiness to your doorstep. Order from 500+ restaurants, cafés & sweet shops.
          </p>
          <div className="flex gap-3">
            {socials.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="p-2 rounded-lg bg-gray-800 hover:bg-red-500 hover:text-white transition-colors"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading}>
            <h3 className="text-white font-semibold mb-4">{heading}</h3>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Contact + bottom bar */}
      <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <a href="mailto:hello@foodiehub.in" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Mail size={14} /> hello@foodiehub.in
          </a>
          <a href="tel:+911800000000" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone size={14} /> 1800-000-0000
          </a>
        </div>
        <p className="text-xs text-gray-600">
          © {new Date().getFullYear()} FoodieHub. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
)

export default Footer
