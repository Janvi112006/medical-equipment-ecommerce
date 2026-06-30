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
    images: ["https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600"],
  },
  {
    name: "Digital Thermometer",
    description: "Fast body temperature measurement",
    category: "Diagnostic",
    price: 499,
    stock: 50,
    images: ["https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600"],
  },
  {
    name: "Pulse Oximeter",
    description: "Measures oxygen saturation and pulse rate",
    category: "Diagnostic",
    price: 1299,
    stock: 30,
    images: ["https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600"],
  },
  {
    name: "Glucometer",
    description: "Digital blood glucose monitoring device",
    category: "Diagnostic",
    price: 899,
    stock: 40,
    images: ["https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600"],
  },
  {
    name: "Stethoscope",
    description: "Professional acoustic stethoscope",
    category: "General",
    price: 799,
    stock: 60,
    images: ["https://images.unsplash.com/photo-1580281658626-ee379f3cce93?w=600"],
  },
  {
    name: "ECG Machine",
    description: "12-channel ECG device",
    category: "Cardiology",
    price: 45000,
    stock: 5,
    images: ["https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600"],
  },
  {
    name: "Nebulizer",
    description: "Compressor nebulizer for respiratory therapy",
    category: "Respiratory",
    price: 1999,
    stock: 20,
    images: ["https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600"],
  },
  {
    name: "Oxygen Concentrator",
    description: "5L oxygen concentrator",
    category: "Respiratory",
    price: 38000,
    stock: 4,
    images: ["https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600"],
  },
  {
    name: "Wheelchair",
    description: "Foldable manual wheelchair",
    category: "Mobility",
    price: 8500,
    stock: 10,
    images: ["https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600"],
  },
  {
    name: "Surgical Mask",
    description: "Disposable 3-ply face mask",
    category: "Safety",
    price: 250,
    stock: 500,
    images: ["https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=600"],
  },
  {
    name: "Syringe",
    description: "Sterile disposable syringe",
    category: "Consumables",
    price: 20,
    stock: 950,
    images: ["https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600"],
  },
  {
    name: "Infrared Thermometer",
    description: "Non-contact infrared thermometer",
    category: "Diagnostic",
    price: 1499,
    stock: 35,
    images: ["https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600"],
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