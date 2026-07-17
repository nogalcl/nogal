import { ExpressValuation } from "@/components/marketing/express-valuation";
import { Hero } from "@/components/marketing/hero";
import { SearchBar } from "@/components/marketing/search-bar";

export default function Home() {
  return (
    <>
      <Hero />
      <SearchBar />
      <ExpressValuation />
    </>
  );
}
