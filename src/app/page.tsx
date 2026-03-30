import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import RentalCategories from "@/components/RentalCategories";
import FeaturedBikes from "@/components/FeaturedBikes";
import HowItWorks from "@/components/HowItWorks";
import VideoFeature from "@/components/VideoFeature";
import PickupLocations from "@/components/PickupLocations";
import CabinBooking from "@/components/CabinBooking";
import Testimonials from "@/components/Testimonials";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";
import { getInventory, getPickupLocations } from "./_data/fleet";

export const revalidate = 300; // Revalidate every 5 minutes

export default async function Home() {
  const [inventory, locations] = await Promise.all([
    getInventory(),
    getPickupLocations(),
  ]);

  const { items, categories } = inventory;

  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <TrustBar />
        <RentalCategories categories={categories} items={items} />
        <FeaturedBikes items={items} />
        <HowItWorks />
        <VideoFeature />
        <PickupLocations locations={locations} />
        <CabinBooking />
        <Testimonials />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
