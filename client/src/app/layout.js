import './globals.css';
import Header from '../components/Header.js';
import Footer from '../components/Footer.js';
import ReduxProvider from '../store/ReduxProvider.js';

export const metadata = {
  title: 'Kings Mart | Luxury Fashion & Bespoke Apparel',
  description: 'Dress Like Royalty. Curating the finest premium apparel, silks, velvet tailoring, and luxury accessories.',
  keywords: 'luxury fashion, premium apparel, bespoke suits, designer clothes, silk gowns, velvet blazers',
  authors: [{ name: 'Kings Mart Team' }],
  viewport: 'width=device-width, initial-scale=1.0'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link 
        href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"
         rel="stylesheet" /> 
      </head>
      <body className="min-h-full flex flex-col bg-brand-sand text-brand-jet antialiased selection:bg-brand-gold/30 selection:text-brand-navy">
        <ReduxProvider>
          <Header />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}
