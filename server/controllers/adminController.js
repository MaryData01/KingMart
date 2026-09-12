import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Promo from '../models/Promo.js';
import { uploadImage } from '../config/cloudinary.js';

// @desc    Get dashboard statistics (Sales, Orders, Stock limits)
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    // 1. Calculate Total Sales (sum of totalPrice for all paid orders)
    const paidOrders = await Order.find({ isPaid: true });
    const totalSales = paidOrders.reduce((acc, order) => acc + order.totalPrice, 0);

    // 2. Orders Counter
    const totalOrdersCount = await Order.countDocuments();
    const pendingOrdersCount = await Order.countDocuments({ isPaid: false });

    // 3. Low stock threshold alert (stock < 5)
    const lowStockProductsCount = await Product.countDocuments({ stock: { $lt: 5 } });
    const lowStockProducts = await Product.find({ stock: { $lt: 5 } }).select('name stock price');

    // 4. Products Counter
    const totalProductsCount = await Product.countDocuments();

    // 5. Customers Counter
    const totalCustomersCount = await User.countDocuments({ isAdmin: false });

    // 6. Recent Orders list
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalSales,
      totalOrdersCount,
      pendingOrdersCount,
      lowStockProductsCount,
      lowStockProducts,
      totalProductsCount,
      totalCustomersCount,
      recentOrders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order shipping/fulfillment status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  const { status } = req.body; // Processing, Shipped, Delivered, Cancelled

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.status = status;

    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    } else if (status === 'Shipped') {
      // Any additional shipped actions
    } else if (status === 'Cancelled') {
      // Revert stock levels if order is cancelled
      if (order.isPaid) {
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product);
          if (product) {
            product.stock += item.qty;
            await product.save();
          }
        }
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/admin/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  const {
    name,
    description,
    price,
    originalPrice,
    sizes,
    colors,
    categories,
    category,
    brand,
    stock,
    images
  } = req.body;

  try {
    // If files are uploaded (using Multer), we would handle them
    // For simplicity, we accept image URLs directly or handle base64
    let imageUrls = images || [];

    if (req.files && req.files.length > 0) {
      imageUrls = [];
      for (const file of req.files) {
        const uploadResult = await uploadImage(file.path, 'products');
        imageUrls.push(uploadResult.secure_url);
      }
    }

    if (imageUrls.length === 0) {
      // Ensure there is at least a default mock image
      imageUrls.push('https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80');
    }

    const parsedCategories = categories ? (Array.isArray(categories) ? categories : JSON.parse(categories)) : [];
    const singularCategory = category || (parsedCategories.length > 0 ? parsedCategories[0] : 'Men');

    const product = new Product({
      name,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      sizes: sizes ? (Array.isArray(sizes) ? sizes : JSON.parse(sizes)) : ['S', 'M', 'L', 'XL'],
      colors: colors ? (Array.isArray(colors) ? colors : JSON.parse(colors)) : ['Black', 'White', 'Navy', 'Gold'],
      category: singularCategory,
      categories: parsedCategories,
      brand: brand || 'Kings Mart',
      stock: stock ? Number(stock) : 10,
      images: imageUrls
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  const {
    name,
    description,
    price,
    originalPrice,
    sizes,
    colors,
    categories,
    category,
    brand,
    stock,
    images
  } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? Number(price) : product.price;
    product.originalPrice = originalPrice !== undefined ? Number(originalPrice) : product.originalPrice;
    product.sizes = sizes ? (Array.isArray(sizes) ? sizes : JSON.parse(sizes)) : product.sizes;
    product.colors = colors ? (Array.isArray(colors) ? colors : JSON.parse(colors)) : product.colors;
    
    if (categories) {
      const parsedCategories = Array.isArray(categories) ? categories : JSON.parse(categories);
      product.categories = parsedCategories;
      product.category = category || (parsedCategories.length > 0 ? parsedCategories[0] : product.category);
    } else if (category) {
      product.category = category;
    }

    product.brand = brand || product.brand;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    
    if (images) {
      product.images = Array.isArray(images) ? images : JSON.parse(images);
    }

    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      for (const file of req.files) {
        const uploadResult = await uploadImage(file.path, 'products');
        imageUrls.push(uploadResult.secure_url);
      }
      product.images = imageUrls;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product removed' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (customers list)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isAdmin: false }).select('-password');
    
    // Enrich with order history info
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({ user: user._id });
        const orders = await Order.find({ user: user._id }).select('totalPrice isPaid createdAt');
        const spent = orders.filter(o => o.isPaid).reduce((sum, o) => sum + o.totalPrice, 0);

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          loyaltyPoints: user.loyaltyPoints,
          orderCount,
          totalSpent: spent,
          createdAt: user.createdAt
        };
      })
    );

    res.json(enrichedUsers);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all promo codes
// @route   GET /api/admin/promos
// @access  Private/Admin
export const getPromos = async (req, res, next) => {
  try {
    const promos = await Promo.find().sort({ createdAt: -1 });
    res.json(promos);
  } catch (error) {
    next(error);
  }
};

// @desc    Create promo code
// @route   POST /api/admin/promos
// @access  Private/Admin
export const createPromoCode = async (req, res, next) => {
  const { code, discountType, discountValue, expiryDate, singleUse } = req.body;

  try {
    const promoExists = await Promo.findOne({ code: code.toUpperCase() });
    if (promoExists) {
      res.status(400);
      throw new Error('Promo code already exists');
    }

    const promo = await Promo.create({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      expiryDate: new Date(expiryDate),
      singleUse: !!singleUse
    });

    res.status(201).json(promo);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete promo code
// @route   DELETE /api/admin/promos/:id
// @access  Private/Admin
export const deletePromoCode = async (req, res, next) => {
  try {
    const promo = await Promo.findById(req.params.id);

    if (promo) {
      await Promo.findByIdAndDelete(req.params.id);
      res.json({ message: 'Promo code deleted' });
    } else {
      res.status(404);
      throw new Error('Promo code not found');
    }
  } catch (error) {
    next(error);
  }
};
