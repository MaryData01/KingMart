import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Promo from '../models/Promo.js';
import { stripe, isStripeMock } from '../config/stripe.js';
import { sendEmail } from '../config/nodemailer.js';

// Helper to update stock and award loyalty points
const processPaymentSuccess = async (order) => {
  if (order.isPaid) return; // already processed

  order.isPaid = true;
  order.paidAt = new Date();

  // 1. Update product stock levels
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stock = Math.max(0, product.stock - item.qty);
      await product.save();
    }
  }

  // 2. Award loyalty points to registered user (10 points per currency unit spent)
  if (order.user) {
    const user = await User.findById(order.user);
    if (user) {
      const pointsEarned = Math.round(order.totalPrice * 10);
      user.loyaltyPoints += pointsEarned;
      order.loyaltyPointsEarned = pointsEarned;
      await user.save();
    }
  }

  // 3. Mark Promo Code as used
  if (order.promoCode && order.user) {
    const promo = await Promo.findOne({ code: order.promoCode.toUpperCase() });
    if (promo && !promo.usedBy.includes(order.user)) {
      promo.usedBy.push(order.user);
      await promo.save();
    }
  }

  await order.save();

  // 4. Send Confirmation Email
  const customerEmail = order.guestEmail || (order.user ? (await User.findById(order.user)).email : null);
  if (customerEmail) {
    const itemsHtml = order.orderItems.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #C9A84C;">${item.name} (${item.size}/${item.color})</td>
        <td style="padding: 8px; border-bottom: 1px solid #C9A84C; text-align: center;">${item.qty}</td>
        <td style="padding: 8px; border-bottom: 1px solid #C9A84C; text-align: right;">$${item.price.toFixed(2)}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; background-color: #F5F0E8;">
        <h2 style="color: #0A1628; border-bottom: 2px solid #C9A84C; padding-bottom: 10px; text-align: center;">Kings Mart - Order Confirmed!</h2>
        <p>Thank you for choosing Kings Mart! We are preparing your order to "Dress Like Royalty".</p>
        <h3 style="color: #0A1628;">Order Reference: ${order._id}</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #0A1628; color: #C9A84C;">
              <th style="padding: 8px; text-align: left;">Item</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div style="text-align: right; font-weight: bold; margin-top: 10px;">
          <p>Subtotal: $${order.itemsPrice.toFixed(2)}</p>
          ${order.discountPrice > 0 ? `<p style="color: #C9A84C;">Discount: -$${order.discountPrice.toFixed(2)}</p>` : ''}
          <p>Shipping: $${order.shippingPrice.toFixed(2)}</p>
          <p style="font-size: 18px; color: #0A1628; border-top: 2px solid #C9A84C; padding-top: 5px;">Total: $${order.totalPrice.toFixed(2)}</p>
        </div>
        <p>Your order will be shipped to: <strong>${order.shippingAddress.street}, ${order.shippingAddress.city}</strong></p>
        ${order.loyaltyPointsEarned > 0 ? `<p style="color: #0A1628; font-weight: bold;">👑 You earned ${order.loyaltyPointsEarned} Loyalty Points on this purchase!</p>` : ''}
        <hr style="border: 0; border-top: 1px solid #C9A84C; margin-top: 30px;">
        <p style="font-size: 11px; color: #666; text-align: center;">Kings Mart © 2026. Dress Like Royalty.</p>
      </div>
    `;

    await sendEmail({
      to: customerEmail,
      subject: 'Kings Mart - Order Confirmation Request',
      html: emailHtml,
      text: `Thank you for your order! Total amount: $${order.totalPrice.toFixed(2)}. Shipping address: ${order.shippingAddress.street}`
    });
  }
};

// @desc    Create new order in pending state
// @route   POST /api/orders
// @access  Private/Public (Public for guest users)
export const createOrder = async (req, res, next) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    discountPrice,
    totalPrice,
    promoCode,
    guestEmail
  } = req.body;

  try {
    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items provided');
    }

    const order = new Order({
      user: req.user ? req.user._id : undefined,
      guestEmail: req.user ? undefined : guestEmail,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      discountPrice,
      totalPrice,
      promoCode,
      isPaid: false
    });

    const createdOrder = await order.save();
    
    // For direct mock checkouts, we can immediately approve them
    if (paymentMethod === 'Mock') {
      await processPaymentSuccess(createdOrder);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private/Public (Allows guests to view their order by ID)
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Security: Check if user owns order, or is an admin, or it's a guest order matching the email/id
    if (order.user && (!req.user || (req.user._id.toString() !== order.user._id.toString() && !req.user.isAdmin))) {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Create Stripe Checkout Session
// @route   POST /api/orders/:id/pay/stripe
// @access  Private/Public
export const checkoutStripe = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Set up line items for Stripe
    const lineItems = order.orderItems.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.image]
        },
        unit_amount: Math.round(item.price * 100) // in cents
      },
      quantity: item.qty
    }));

    // Add shipping as line item if greater than 0
    if (order.shippingPrice > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping & Handling'
          },
          unit_amount: Math.round(order.shippingPrice * 100)
        },
        quantity: 1
      });
    }

    // Deduct discount if any (Stripe Coupons are complex, we'll apply it as a negative line item for reliability)
    if (order.discountPrice > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Promo Code Discount: ${order.promoCode || 'COUPON'}`
          },
          unit_amount: -Math.round(order.discountPrice * 100) // negative amount
        },
        quantity: 1
      });
    }

    const origin = req.headers.referer || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${origin}/checkout?cancelled=true&order_id=${order._id}`,
      metadata: {
        orderId: order._id.toString()
      }
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Stripe payment & update order status
// @route   POST /api/orders/:id/verify-payment
// @access  Public
export const verifyPayment = async (req, res, next) => {
  const { sessionId } = req.body;
  const orderId = req.params.id;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.isPaid) {
      return res.json({ message: 'Order is already marked as paid', order });
    }

    // Verification Logic
    let paymentVerified = false;
    let transactionId = sessionId;

    if (order.paymentMethod === 'Paystack') {
      const isMock = !process.env.PAYSTACK_SECRET_KEY || sessionId.startsWith('mock_') || sessionId.startsWith('PK_mock_');
      if (isMock) {
        paymentVerified = true;
      } else {
        try {
          const response = await fetch(`https://api.paystack.co/transaction/verify/${sessionId}`, {
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
          });
          const payData = await response.json();
          if (payData && payData.status && payData.data && payData.data.status === 'success') {
            paymentVerified = true;
            transactionId = payData.data.id ? String(payData.data.id) : sessionId;
          }
        } catch (fetchErr) {
          console.error('Paystack verification failed:', fetchErr);
        }
      }
    } else {
      if (isStripeMock || sessionId.startsWith('mock_stripe_')) {
        paymentVerified = true;
      } else {
        // Fetch session details from Stripe to verify payment state
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid') {
          paymentVerified = true;
          transactionId = session.payment_intent;
        }
      }
    }

    if (paymentVerified) {
      order.paymentResult = {
        id: transactionId,
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        email_address: order.guestEmail || (req.user ? req.user.email : '')
      };
      
      await processPaymentSuccess(order);
      res.json({ message: 'Payment verified and order updated', order });
    } else {
      res.status(400);
      throw new Error('Payment verification failed');
    }
  } catch (error) {
    next(error);
  }
};
