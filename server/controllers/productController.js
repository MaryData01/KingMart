import Product from '../models/Product.js';

// @desc    Fetch all products with filtering, sorting & pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      sale,
      size,
      color,
      brand,
      minPrice,
      maxPrice,
      search,
      sort,
      page = 1,
      limit = 9
    } = req.query;

    const query = {};

    // 1. Filtering by search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Category and Sale filter
    if (category && category !== 'All') {
      if (category === 'Sale') {
        query.originalPrice = { $exists: true, $gt: 0 };
        query.$expr = { $gt: ['$originalPrice', '$price'] };
      } else {
        query.category = category;
      }
    } else if (sale === 'true') {
      query.originalPrice = { $exists: true, $gt: 0 };
      query.$expr = { $gt: ['$originalPrice', '$price'] };
    }

    // 3. Size filter
    if (size) {
      query.sizes = size;
    }

    // 4. Color filter
    if (color) {
      query.colors = color;
    }

    // 5. Brand filter
    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    // 6. Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Determine sorting criteria
    let sortOptions = {};
    if (sort === 'Newest') {
      sortOptions = { createdAt: -1 };
    } else if (sort === 'Price Low–High') {
      sortOptions = { price: 1 };
    } else if (sort === 'Price High–Low') {
      sortOptions = { price: -1 };
    } else if (sort === 'Best Rated') {
      sortOptions = { rating: -1 };
    } else {
      sortOptions = { createdAt: -1 }; // default newest
    }

    // Pagination calculations
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute queries
    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(limitNum)
      .skip(skip);

    res.json({
      products,
      page: pageNum,
      pages: Math.ceil(count / limitNum),
      totalProducts: count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};
