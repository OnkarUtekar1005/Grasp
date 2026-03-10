import {
  Navbar,
  Hero,
  ProductCategories,
  TrustedClients,
  Industries,
  FAQ,
  Footer
} from '../components';

const Home = () => {
  return (
    <>
      <Navbar isVisible />

      <Hero visible />

      <ProductCategories />

      <TrustedClients />

      <Industries />

      <FAQ />

      <Footer />
    </>
  );
};

export default Home;
