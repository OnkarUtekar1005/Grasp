import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from '../components';

const PublicLayout = ({ navVisible = true }) => {
  return (
    <>
      <Navbar isVisible={navVisible} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default PublicLayout;
