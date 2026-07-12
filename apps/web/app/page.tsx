import { ExpressValuation } from "@/components/marketing/express-valuation";
import { FeaturedCategories } from "@/components/marketing/featured-categories";
import { Hero } from "@/components/marketing/hero";
import { SearchBar } from "@/components/marketing/search-bar";

export default function Home() {
  return (
    <>
      <Hero />
      <SearchBar />
      <FeaturedCategories />
      <ExpressValuation />
    </>
  );
}
