const Order = require("../models/order");
const Cart = require("../models/cartModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" });

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// =============================================
// Create New Order
// =============================================
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  try {
    const { session_id } = req.body;

    console.log("Session ID:", session_id);
    console.log("Logged User:", req.user);

    if (!session_id) {
      return next(new ErrorHandler("Session ID is missing", 400));
    }

    // Get Stripe Session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    console.log("Stripe Session Retrieved");

    // Get User Cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: "items.foodItem",
        select: "name price images",
      })
      .populate({
        path: "restaurant",
        select: "name",
      });

    console.log("Cart:", cart);

    if (!cart) {
      return next(new ErrorHandler("Cart not found", 404));
    }

    // Prepare delivery info safely
    const deliveryInfo = {
      address:
        session.customer_details?.address?.line1 || "Not Provided",
      city:
        session.customer_details?.address?.city || "Not Provided",
      postalCode:
        session.customer_details?.address?.postal_code || "",
      country:
        session.customer_details?.address?.country || "",
      phoneNo:
        session.customer_details?.phone || "",
    };

    // Order Items
    const orderItems = cart.items.map((item) => ({
      name: item.foodItem.name,
      quantity: item.quantity,
      image: item.foodItem.images[0]?.url || "",
      price: item.foodItem.price,
      fooditem: item.foodItem._id,
    }));

    const paymentInfo = {
      id: session.payment_intent,
      status: session.payment_status,
    };

    console.log("Creating Order...");

    const order = await Order.create({
      orderItems,
      deliveryInfo,
      paymentInfo,
      deliveryCharge:
        session.shipping_cost
          ? session.shipping_cost.amount_total / 100
          : 0,
      itemsPrice: session.amount_subtotal / 100,
      finalTotal: session.amount_total / 100,
      user: req.user._id,
      restaurant: cart.restaurant._id,
      paidAt: Date.now(),
    });

    console.log("Order Created:", order);

    // Delete Cart
    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    console.log("ORDER ERROR:", err);
    return next(err);
  }
});

// =============================================
// Get Single Order
// =============================================
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("restaurant");

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// =============================================
// Logged-in User Orders
// =============================================
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({
    user: req.user._id,
  })
    .populate("restaurant")
    .populate("user", "name email");

  res.status(200).json({
    success: true,
    orders,
  });
});

// =============================================
// Admin - All Orders
// =============================================
exports.allOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.finalTotal;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});