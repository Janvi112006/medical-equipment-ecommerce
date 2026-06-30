require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./src/models/Product");
const User = require("./src/models/User");

const products = [
  {
    name: "Digital Blood Pressure Monitor",
    description: "Automatic BP monitor with LCD display",
    category: "Diagnostic",
    price: 2499,
    stock: 25,
    images: ["/products/bp-monitor.jpg"],
  },
  {
    name: "Digital Thermometer",
    description: "Fast body temperature measurement",
    category: "Diagnostic",
    price: 499,
    stock: 50,
    images: ["/products/thermometer.jpg"],
  },
  {
    name: "Pulse Oximeter",
    description: "Measures oxygen saturation and pulse rate",
    category: "Diagnostic",
    price: 1299,
    stock: 30,
    images: ["/products/pulse-oximeter.jpg"],
  },
  {
    name: "Glucometer",
    description: "Digital blood glucose monitoring device",
    category: "Diagnostic",
    price: 899,
    stock: 40,
    images: ["/products/glucometer.jpg"],
  },
  {
    name: "Stethoscope",
    description: "Professional acoustic stethoscope",
    category: "General",
    price: 799,
    stock: 60,
    images: ["/products/stethoscope.jpg"],
  },
  {
    name: "ECG Machine",
    description: "12-channel ECG device",
    category: "Cardiology",
    price: 45000,
    stock: 5,
    images: ["/products/ecg-machine.jpg"],
  },
  {
    name: "Nebulizer",
    description: "Compressor nebulizer for respiratory therapy",
    category: "Respiratory",
    price: 1999,
    stock: 20,
    images: ["/products/nebulizer.jpg"],
  },
  {
    name: "Oxygen Concentrator",
    description: "5L oxygen concentrator",
    category: "Respiratory",
    price: 38000,
    stock: 4,
    images: ["/products/oxygen-concentrator.jpg"],
  },
  {
    name: "Wheelchair",
    description: "Foldable manual wheelchair",
    category: "Mobility",
    price: 8500,
    stock: 10,
    images: ["/products/wheelchair.jpg"],
  },
  {
    name: "Surgical Mask",
    description: "Disposable 3-ply face mask",
    category: "Safety",
    price: 250,
    stock: 500,
    images: ["/products/surgical-mask.jpg"],
  },
  {
    name: "Syringe",
    description: "Sterile disposable syringe",
    category: "Consumables",
    price: 20,
    stock: 950,
    images: ["/products/syringe.jpg"],
  },
  {
    name: "Infrared Thermometer",
    description: "Non-contact infrared thermometer",
    category: "Diagnostic",
    price: 1499,
    stock: 35,
    images: ["/products/infrared.jpg"],
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.log("No admin user found. Please create/admin role first.");
      process.exit(1);
    }

    await Product.deleteMany({});
    const productsWithAdmin = products.map((p) => ({
      ...p,
      createdBy: admin._id,
    }));

    await Product.insertMany(productsWithAdmin);
    console.log(`${products.length} products inserted successfully`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
}

seedProducts();