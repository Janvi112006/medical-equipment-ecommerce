import "./globals.css";
import Providers from "../components/Providers";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: {
    default: "MedEquip — Quality Medical Equipment Online",
    template: "%s | MedEquip",
  },
  description:
    "Shop certified medical equipment online — diagnostic devices, mobility aids, and more, delivered to your door.",
};

const RootLayout = ({ children }) => (
  <html lang="en">
    <body>
      <Providers>
        <Header />
        {children}
        <Footer />
      </Providers>
    </body>
  </html>
);

export default RootLayout;
