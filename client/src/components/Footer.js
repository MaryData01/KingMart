import Link from 'next/link';
import { Crown, Mail, Phone, MapPin, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-jet text-brand-sand border-t border-brand-gold/20 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Footgrid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-6 w-6 text-brand-gold" />
              <span className="font-serif text-xl font-bold tracking-widest text-brand-gold uppercase">
                Kings Mart
              </span>
            </div>
            <p className="font-serif italic text-sm text-brand-sand/60 mb-6">
              "Dress Like Royalty"
            </p>
            <p className="text-sm text-brand-sand/70 leading-relaxed">
              Curating the finest global fashion apparel for modern kings and queens. Experience premium materials and timeless bespoke styling.
            </p>
          </div>

          {/* Collections links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-brand-gold mb-6 pb-2 border-b border-brand-gold/10 inline-block">
              Collections
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link href="/shop" className="hover:text-brand-gold transition-colors text-brand-sand/80">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Men" className="hover:text-brand-gold transition-colors text-brand-sand/80">
                  Bespoke Men's Suitings
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Women" className="hover:text-brand-gold transition-colors text-brand-sand/80">
                  Elegant Women's Gowns
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Accessories" className="hover:text-brand-gold transition-colors text-brand-sand/80">
                  Premium Accessories
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Sale" className="hover:text-brand-gold transition-colors text-brand-sand/80 text-brand-gold/90 font-medium">
                  Exclusive Royal Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Loyalty Program Section */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-brand-gold mb-6 pb-2 border-b border-brand-gold/10 inline-block">
              Loyalty Program
            </h4>
            <div className="bg-brand-navy/60 border border-brand-gold/20 p-4 rounded-none mb-4">
              <div className="flex items-center gap-2 mb-2 text-brand-gold">
                <Award className="h-5 w-5" />
                <span className="font-bold text-xs uppercase tracking-wider">Royal Loyalty Club</span>
              </div>
              <p className="text-xs text-brand-sand/70 leading-relaxed">
                Earn <strong>10 points for every ₦1</strong> spent! Points can be redeemed for exclusive discounts on your future bespoke collections.
              </p>
            </div>
            <p className="text-xs text-brand-sand/50">
              *Membership is automatic upon checkout registration.
            </p>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-brand-gold mb-6 pb-2 border-b border-brand-gold/10 inline-block">
              The Palace Concierge
            </h4>
            <ul className="space-y-4 text-sm text-brand-sand/80">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
                <span>5 Admiralty Way, Lekki Phase 1,<br />Lagos, Nigeria</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-brand-gold shrink-0" />
                <a href="mailto:support@kingsmart.com" className="hover:text-brand-gold transition-colors">
                  support@kingsmart.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-brand-gold shrink-0" />
                <span>+234 801 234 5678</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Separator */}
        <hr className="border-brand-gold/15 mb-8" />

        {/* Copywrite */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-sand/50">
          <p>&copy; {new Date().getFullYear()} Kings Mart Ltd. All rights reserved. Created with absolute attention to detail.</p>
          <div className="flex space-x-6">
            <Link href="#" className="hover:text-brand-gold transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-brand-gold transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-brand-gold transition-colors">Sitemap</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
