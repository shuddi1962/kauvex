import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import MegaMenu from "@/components/MegaMenu";
import HeroSection from "@/components/HeroSection";
import PromoStrip from "@/components/PromoStrip";
import DealOfDay from "@/components/DealOfDay";
import TopProducts from "@/components/TopProducts";
import CategoryBlock from "@/components/CategoryBlock";
import PromoBanners from "@/components/PromoBanners";
import CategoryIcons from "@/components/CategoryIcons";
import BrandSlider from "@/components/BrandSlider";
import VendorShowcase from "@/components/VendorShowcase";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { categoryBlocks } from "@/lib/data";

export default function Home() {
  return (
    <>
      <TopBar />
      <Header />
      <MegaMenu />
      <main>
        <HeroSection />
        <PromoStrip />
        <DealOfDay />
        <TopProducts />
        {categoryBlocks.map((block) => (
          <CategoryBlock
            key={block.key}
            title={block.title}
            bannerImage={block.bannerImage}
            bannerTag={block.bannerTag}
            href={block.href}
            products={block.products}
          />
        ))}
        <PromoBanners />
        <CategoryIcons />
        <BrandSlider />
        <VendorShowcase />
      </main>
      <Newsletter />
      <Footer />
    </>
  );
}