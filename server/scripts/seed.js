import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kingsmart';
  console.log(`Connecting to MongoDB at: ${uri}`);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log('MongoDB Connected');
  } catch (err) {
    console.log('Local MongoDB server is not running. Starting an In-Memory MongoDB Server...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create();
    const memUri = mongodInstance.getUri();
    await mongoose.connect(memUri);
    console.log(`MongoDB Connected (In-Memory Server): 127.0.0.1`);
    console.log(`Connection URI: ${memUri}`);
  }
};

const { default: User }    = await import('../models/User.js');
const { default: Product } = await import('../models/Product.js');
const { default: Review }  = await import('../models/Review.js');
const { default: Promo }   = await import('../models/Promo.js');

const products = [
  { name: "Deep V Gradient Maxi Dress", description: "Stunning burgundy-to-rose gradient maxi dress with a plunging V-neckline, bat-wing sleeves, and elasticated waist.", price: 38000, originalPrice: 50000, category: "Women", brand: "Empress Attire", sizes: ["XS","S","M","L","XL","XXL"], colors: ["Burgundy"], stock: 25, images: ["/images/burgundy-gradient-dress.jpg"], ratings: { average: 4.8, count: 34 } },
  { name: "Rust Abstract Print Wide-Leg Set", description: "Chic two-piece set featuring a sleeveless crop top and abstract flame-print wide-leg trousers in warm rust tones.", price: 45000, category: "Women", brand: "Empress Attire", sizes: ["XS","S","M","L","XL"], colors: ["Rust","Multi"], stock: 18, images: ["/images/rust-pants-set.jpg"], ratings: { average: 4.6, count: 21 } },
  { name: "Gold & Black Power Jumpsuit", description: "Bold colour-blocked jumpsuit with balloon sleeves in golden yellow and a fitted black wide-leg bottom.", price: 52000, category: "Women", brand: "Empress Attire", sizes: ["S","M","L","XL","XXL"], colors: ["Gold","Black"], stock: 15, images: ["/images/yellow-black-jumpsuit.jpg"], ratings: { average: 4.9, count: 47 } },
  { name: "Beige Wave Print Wide-Leg Jumpsuit", description: "Elegant sleeveless jumpsuit with a wave pattern in black and beige. High waist and wide-leg cut.", price: 48000, category: "Women", brand: "Empress Attire", sizes: ["XS","S","M","L","XL"], colors: ["Beige","Black"], stock: 20, images: ["/images/beige-wave-jumpsuit.jpg"], ratings: { average: 4.7, count: 29 } },
  { name: "Green Ankara Handkerchief Skirt", description: "Vibrant green Ankara print handkerchief skirt with asymmetric tiered hem.", price: 22000, originalPrice: 28000, category: "Women", brand: "Ankara Queens", sizes: ["XS","S","M","L","XL","XXL"], colors: ["Green","White"], stock: 30, images: ["/images/ankara-skirt.jpg"], ratings: { average: 4.5, count: 18 } },
  { name: "Black One-Shoulder Floral Gown", description: "Dramatic one-shoulder floor-length gown in black with stunning 3D red floral appliqués. Perfect for black-tie events.", price: 75000, category: "Women", brand: "Noir Elegance", sizes: ["S","M","L","XL"], colors: ["Black","Red"], stock: 10, images: ["/images/black-floral-gown.jpg"], ratings: { average: 5.0, count: 52 } },
  { name: "Red Floral Lace Midi Dress", description: "Classic fit-and-flare midi dress in deep red floral lace with a high neckline and cap sleeves.", price: 42000, originalPrice: 58000, category: "Women", brand: "Empress Attire", sizes: ["S","M","L","XL","XXL","3XL"], colors: ["Red"], stock: 22, images: ["/images/red-lace-dress.jpg"], ratings: { average: 4.8, count: 63 } },
  { name: "Gold & Black Asymmetric Ruffle Gown", description: "Show-stopping one-shoulder gown with layered gold and black organza ruffles and a daring high slit.", price: 95000, category: "Women", brand: "Noir Elegance", sizes: ["XS","S","M","L"], colors: ["Gold","Black"], stock: 8, images: ["/images/gold-black-gown.jpg"], ratings: { average: 4.9, count: 38 } },
  { name: "Emerald Crystal Embellished Stilettos", description: "Exquisite sheer mesh stiletto boots adorned with emerald gemstones and silver leaf embroidery.", price: 35000, category: "Accessories", brand: "Crystal Steps", sizes: ["36","37","38","39","40","41"], colors: ["Emerald","Silver"], stock: 12, images: ["/images/emerald-heels.jpg"], ratings: { average: 4.9, count: 27 } },
  { name: "Burgundy Pearl & Crystal Platform Heels", description: "Luxurious burgundy velvet platform heels adorned with pearl drops, crystal chains, and a bow detail.", price: 32000, category: "Accessories", brand: "Crystal Steps", sizes: ["36","37","38","39","40"], colors: ["Burgundy"], stock: 14, images: ["/images/burgundy-heels.jpg"], ratings: { average: 4.7, count: 19 } },
  { name: "Red 3D Floral Ankle Boots", description: "Statement ankle boots covered in intricate 3D red floral appliqués on a sheer mesh base.", price: 40000, category: "Accessories", brand: "Crystal Steps", sizes: ["36","37","38","39","40","41"], colors: ["Red"], stock: 10, images: ["/images/red-floral-boots.jpg"], ratings: { average: 4.8, count: 31 } },
  { name: "Scarlet Metallic Stilettos", description: "Ultra-glamorous scarlet metallic pointed-toe stilettos with a signature diamond buckle detail.", price: 28000, originalPrice: 38000, category: "Accessories", brand: "Crystal Steps", sizes: ["36","37","38","39","40","41"], colors: ["Red"], stock: 20, images: ["/images/red-metallic-heels.jpg"], ratings: { average: 4.6, count: 44 } },
  { name: "Rose Gold Chrome Stilettos", description: "Polished rose gold mirror-finish pointed-toe stilettos with a signature red rose charm at the heel.", price: 30000, category: "Accessories", brand: "Crystal Steps", sizes: ["36","37","38","39","40"], colors: ["Rose Gold"], stock: 16, images: ["/images/rose-gold-heels.jpg"], ratings: { average: 4.8, count: 22 } },
  { name: "Purple Luxury Structured Handbag", description: "Sophisticated plum-toned structured handbag with gold hardware, cat tassel charm, and detachable strap.", price: 55000, category: "Accessories", brand: "Maison Royale", sizes: ["One Size"], colors: ["Purple"], stock: 18, images: ["/images/purple-handbag.jpg"], ratings: { average: 4.7, count: 35 } },
  { name: "Premium Beige Luxury Tote", description: "Investment-worthy structured tote in premium pebbled leather with gold hardware and padlock accent.", price: 120000, category: "Accessories", brand: "Maison Royale", sizes: ["One Size"], colors: ["Beige"], stock: 6, images: ["/images/beige-luxury-bag.jpg"], ratings: { average: 5.0, count: 14 } },
  { name: "Dark Teal Pom-Pom Shoulder Bag", description: "Sleek dark teal structured shoulder bag with gold hardware and a playful fur pom-pom charm.", price: 35000, category: "Accessories", brand: "Maison Royale", sizes: ["One Size"], colors: ["Teal"], stock: 22, images: ["/images/teal-pompom-bag.jpg"], ratings: { average: 4.5, count: 28 } },
  { name: "White Gold-Leaf Charm Handbag", description: "Crisp white structured tote with gold hardware, a gold leaf and pearl chain charm.", price: 42000, originalPrice: 55000, category: "Accessories", brand: "Maison Royale", sizes: ["One Size"], colors: ["White","Gold"], stock: 20, images: ["/images/white-handbag.jpg"], ratings: { average: 4.6, count: 17 } },
  { name: "Silver Butterfly Charm Hand Bracelet", description: "Delicate silver hand chain bracelet with butterfly charms connecting a finger ring to a chain bracelet.", price: 12000, category: "Accessories", brand: "Luna Jewels", sizes: ["One Size"], colors: ["Silver"], stock: 35, images: ["/images/butterfly-bracelet.jpg"], ratings: { average: 4.7, count: 56 } },
  { name: "Rose Gold Red Rose Ring", description: "Adjustable rose gold ring featuring a sculpted red rose bloom with marquise crystal leaf detailing.", price: 8500, category: "Accessories", brand: "Luna Jewels", sizes: ["One Size"], colors: ["Rose Gold","Red"], stock: 40, images: ["/images/rose-ring.jpg"], ratings: { average: 4.9, count: 72 } },
  { name: "Silver Rhinestone Bridal Jewelry Set", description: "Three-piece bridal set: cascading rhinestone Y-necklace, drop earrings, and twisted infinity bracelet.", price: 18000, category: "Accessories", brand: "Luna Jewels", sizes: ["One Size"], colors: ["Silver"], stock: 28, images: ["/images/rhinestone-set.jpg"], ratings: { average: 4.8, count: 41 } },
  { name: "Black Star Dial Watch & Jewelry Set", description: "5-piece luxury set: star-dial black quartz watch with matching necklace, earrings, ring, and bracelet.", price: 25000, originalPrice: 35000, category: "Accessories", brand: "Luna Jewels", sizes: ["One Size"], colors: ["Black","Rose Gold"], stock: 20, images: ["/images/watch-jewelry-set.jpg"], ratings: { average: 4.7, count: 33 } },
  { name: "Black Floral Embroidered Bandhgala", description: "Premium black Bandhgala suit with intricate silver floral embroidery for weddings and formal events.", price: 85000, category: "Men", brand: "Kings Tailored", sizes: ["S","M","L","XL","XXL"], colors: ["Black","Silver"], stock: 12, images: ["/images/black-embroidered-suit.jpg"], ratings: { average: 4.9, count: 29 } },
  { name: "Navy Pinstripe 3-Piece Power Suit", description: "Sharp navy blue pinstripe three-piece suit. The definitive power dressing statement.", price: 120000, category: "Men", brand: "Kings Tailored", sizes: ["S","M","L","XL","XXL"], colors: ["Navy"], stock: 10, images: ["/images/navy-pinstripe-suit.jpg"], ratings: { average: 5.0, count: 18 } },
  { name: "Forest Green Gold-Button Double-Breasted Suit", description: "Commanding forest green double-breasted suit with gold military buttons.", price: 95000, category: "Men", brand: "Kings Tailored", sizes: ["S","M","L","XL","XXL"], colors: ["Green","Gold"], stock: 14, images: ["/images/green-double-breasted-suit.jpg"], ratings: { average: 4.8, count: 23 } },
  { name: "Royal Blue Double-Breasted Suit", description: "Rich royal blue double-breasted suit with gold buttons and chain detail. Celebration-ready.", price: 88000, category: "Men", brand: "Kings Tailored", sizes: ["S","M","L","XL","XXL"], colors: ["Blue","Gold"], stock: 16, images: ["/images/royal-blue-suit.jpg"], ratings: { average: 4.7, count: 31 } },
  { name: "Burgundy Silver-Button Double-Breasted Suit", description: "Refined burgundy double-breasted suit with silver crest buttons and decorative chain lapel pin.", price: 92000, category: "Men", brand: "Kings Tailored", sizes: ["S","M","L","XL"], colors: ["Burgundy","Silver"], stock: 10, images: ["/images/burgundy-suit-silver.jpg"], ratings: { average: 4.9, count: 14 } },
  { name: "Burgundy Gold-Button Street Suit", description: "Sleek slim-fit burgundy double-breasted suit with gold buttons. Street-luxe that goes anywhere.", price: 90000, originalPrice: 115000, category: "Men", brand: "Kings Tailored", sizes: ["S","M","L","XL","XXL"], colors: ["Burgundy","Gold"], stock: 12, images: ["/images/burgundy-suit-gold.jpg"], ratings: { average: 4.8, count: 26 } },
  { name: "Premium Brown Knit Sweater", description: "Essential premium ribbed-knit sweater in warm chocolate brown with a relaxed crew neck.", price: 18000, category: "Men", brand: "Kings Essentials", sizes: ["S","M","L","XL","XXL"], colors: ["Brown"], stock: 30, images: ["/images/brown-knit-sweater.jpg"], ratings: { average: 4.5, count: 42 } },
  { name: "Black & Burgundy Military Cape Coat", description: "Avant-garde black military long coat with a dramatic burgundy-lined cape and silver chain details.", price: 145000, category: "Men", brand: "Kings Tailored", sizes: ["S","M","L","XL"], colors: ["Black","Burgundy"], stock: 6, images: ["/images/black-military-coat.jpg"], ratings: { average: 4.9, count: 11 } },
  { name: "Men's Black Stealth Accessories Set", description: "6-piece all-black set: wayfarer sunglasses, leather bracelet, necklace, and three stainless rings.", price: 22000, category: "Accessories", brand: "Kings Accessories", sizes: ["One Size"], colors: ["Black"], stock: 25, images: ["/images/men-black-accessories.jpg"], ratings: { average: 4.6, count: 38 } },
  { name: "Men's Premium Leather Everyday Set", description: "Gentleman's essentials: wallet, leather belt, bracelet, cufflinks, signet ring, cologne, sunglasses.", price: 35000, category: "Accessories", brand: "Kings Accessories", sizes: ["One Size"], colors: ["Black"], stock: 18, images: ["/images/men-leather-accessories.jpg"], ratings: { average: 4.7, count: 24 } },
  { name: "Blue Rose Gold Chronograph Watch", description: "Premium chronograph in royal blue stainless steel with rose gold indices. Luminous and water-resistant.", price: 45000, category: "Accessories", brand: "Monarch Watch Co.", sizes: ["One Size"], colors: ["Blue","Rose Gold"], stock: 15, images: ["/images/blue-chronograph-watch.jpg"], ratings: { average: 4.8, count: 29 } },
  { name: "Gold Luxury Tie & Accessories Set", description: "Gold plaid silk necktie with pocket square, gold cufflinks, tie ring, and floral lapel brooch.", price: 15000, category: "Accessories", brand: "Kings Accessories", sizes: ["One Size"], colors: ["Gold","Brown"], stock: 30, images: ["/images/gold-tie-set.jpg"], ratings: { average: 4.5, count: 47 } },
  { name: "Men's Gold Cuban Link Set", description: "18K gold-plated Cuban link bracelet with textured signet ring and hexagonal band ring.", price: 28000, category: "Accessories", brand: "Kings Gold", sizes: ["One Size"], colors: ["Gold"], stock: 20, images: ["/images/men-gold-jewelry.jpg"], ratings: { average: 4.8, count: 33 } },
  { name: "Brown Leather Gentleman's Collection", description: "Complete gentleman's set: Oxford shoes, watch, sunglasses, leather wallet, cufflinks, and fountain pen.", price: 38000, originalPrice: 50000, category: "Accessories", brand: "Kings Accessories", sizes: ["One Size"], colors: ["Brown","Gold"], stock: 12, images: ["/images/men-leather-flatlay.jpg"], ratings: { average: 4.7, count: 19 } },
  { name: "Gold Chronograph Green Dial Watch", description: "Prestige gold stainless steel chronograph with rich green dial and Oyster bracelet. For those who want only the finest.", price: 350000, category: "Accessories", brand: "Monarch Watch Co.", sizes: ["One Size"], colors: ["Gold","Green"], stock: 4, images: ["/images/gold-green-watch.jpg"], ratings: { average: 5.0, count: 8 } },
];

const promos = [
  { code: 'KING20',  discountType: 'percentage', discountValue: 20,   isActive: true, expiryDate: new Date('2026-12-31'), description: '20% off your entire order' },
  { code: 'ROYAL10', discountType: 'percentage', discountValue: 10,   isActive: true, expiryDate: new Date('2026-12-31'), description: '10% off for loyal customers' },
  { code: 'NEWKING', discountType: 'fixed',       discountValue: 5000, isActive: true, expiryDate: new Date('2026-12-31'), description: '₦5,000 off for new customers' },
];

export const seedData = async () => {
  console.log('Clearing existing database records...');
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Review.deleteMany({}),
    Promo.deleteMany({}),
  ]);

  // Hash passwords
  const adminPassword    = await bcrypt.hash('AdminPassword123', 12);
  const customerPassword = await bcrypt.hash('Customer123', 12);

  // Build user docs — support both role:'admin' and isAdmin:true schemas
  const userDocs = [];
  try {
    // Try with role field first
    userDocs.push(
      { name: 'Kings Mart Admin',  email: 'admin@kingsmart.com',    password: adminPassword,    role: 'admin',    isAdmin: true,  loyaltyPoints: 0   },
      { name: 'Test Customer',     email: 'customer@kingsmart.com', password: customerPassword, role: 'customer', isAdmin: false, loyaltyPoints: 150 }
    );
  } catch(e) { /* ignore */ }

  const createdUsers = await User.insertMany(userDocs);
  // Use index-based access — admin is always first, customer always second
  const adminUser    = createdUsers[0];
  const customerUser = createdUsers[1];

  if (!adminUser || !adminUser.email) throw new Error('Admin user was not created correctly. Check the User model schema.');

  console.log(`Admin user seeded: ${adminUser.email}`);
  console.log(`Customer user seeded: ${customerUser.email}`);

  await Promo.insertMany(promos);
  console.log('Promo codes seeded: KING20, ROYAL10, NEWKING');

  const createdProducts = await Product.insertMany(products);
  console.log(`Successfully seeded ${createdProducts.length} products.`);

  // Safe review seeding — only add if product index exists
  const reviewSamples = [
   { product: createdProducts[0]?._id,  user: customerUser._id, name: 'Amaka O.',    rating: 5, comment: "Absolutely stunning! Premium quality and perfect fit. Got so many compliments.", isVerifiedPurchase: true },
{ product: createdProducts[0]?._id,  user: adminUser._id,    name: 'Chioma B.',   rating: 5, comment: "Best purchase this year. The gradient is even more beautiful in person.", isVerifiedPurchase: true },
{ product: createdProducts[5]?._id,  user: customerUser._id, name: 'Temi A.',     rating: 5, comment: "This gown is a masterpiece. Everyone at the gala stopped to stare.", isVerifiedPurchase: true },
{ product: createdProducts[21]?._id, user: customerUser._id, name: 'Emeka D.',    rating: 5, comment: "The embroidery is so detailed. Absolute fire for weddings!", isVerifiedPurchase: true },
{ product: createdProducts[21]?._id, user: adminUser._id,    name: 'Rotimi K.',   rating: 4, comment: "Great quality suit. Runs slim — order a size up if broad-shouldered.", isVerifiedPurchase: true },
{ product: createdProducts[35]?._id, user: customerUser._id, name: 'Damilola F.', rating: 5, comment: "This watch is EVERYTHING. Green dial on gold is pure luxury.", isVerifiedPurchase: true },
  ].filter(r => r.product); // remove any where product index didn't exist

  if (reviewSamples.length > 0) {
    await Review.insertMany(reviewSamples);
  }
  console.log(`Successfully seeded ${reviewSamples.length} product reviews.`);
  console.log('Database seeding finished successfully!');
};

// Standalone runner
const isMain = process.argv[1] && process.argv[1].includes('seed');
if (isMain) {
  await connectDB();
  await seedData();
  if (mongodInstance) await mongodInstance.stop();
  await mongoose.disconnect();
  process.exit(0);
}