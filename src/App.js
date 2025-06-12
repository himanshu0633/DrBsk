import { Routes, Route, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import HeroSection from "./components/HeroSection/HeroSection";
import Features from "./components/Features/Features";
import Categories from "./components/Categories/Categories";
import CarouselBanner from "./components/CarouselBanner/CarouselBanner";
import PromoSection from "./components/PromoSection/PromoSection";
import Personal from "./components/Personal/Personal";
import ProductCarousel from "./components/ProductCarousel/ProductCarousel";
import Footer from "./components/Footer/Footer";
import Dashboard from "./Pages/Dashboard";
import Fever from "./Pages/Fever/Fever";
import ProductPage from "./Pages/ProductPage/ProductPage";
import FranchiseBanner from "./Pages/FranchiseBanner/FranchiseBanner";
import EditProfile from "./Pages/EditProfile/EditProfile";
import OrderPage from "./Pages/OrderPage/OrderPage";
import PatientsPage from "./Pages/PatientsPage/PatientsPage";
import NotificationsPage from "./Pages/NotificationsPage/NotificationsPage";
import ConsultationsPage from "./Pages/ConsultationsPage/ConsultationsPage";
import Landing from "./Pages/Landing/Landing";
import Head from "./Pages/Head/Head";
import Cart from "./Pages/Cart/Cart";
import Prescription from "./Pages/Prescription/Prescription";
import Phone from "./Pages/Phone/Phone";
import Settings from "./Pages/Settings/Settings";
import AddProduct from "./Pages/AddProduct/AddProduct";
import Board from "./Pages/Board/Board";
import Admin from "./components/Admin/Admin";
import AdminLayout from "./components/Layouts/AdminLayout";
import Popup from "./Pages/Popup/Popup";
import Category from "./Pages/Category/Category";
import SubCategory from "./Pages/SubCategory/SubCategory";
import BannerCrud from "./Pages/BannerCrud/BannerCrud";
import User from "./Pages/User/User";
import Adminlogin from "./Pages/Admin/login";
import AddToCart from "./components/AddToCart";
import OrderSuccessModal from "./components/success";
import { useEffect } from "react";
import { toast } from "react-toastify";
import PharmaAdmin from "./Pages/pharma-admin/page/PharmaAdmin";
import PharmaDashboard from "./Pages/pharma-admin/component/PharmaDashboard";
import PharmaCategory from "./Pages/pharma-admin/component/PharmaCategory";
import PharmaProducts from "./Pages/pharma-admin/component/PharmaProducts";
import AddNewProduct from "./Pages/pharma-admin/component/AddNewProduct";
import PharmaBanner from "./Pages/pharma-admin/component/PharmaBanner";
import PharmaUser from "./Pages/pharma-admin/component/PharmaUser";
import PharmaSetting from "./Pages/pharma-admin/component/PharmaSetting";
import PharmaSubCategory from "./Pages/pharma-admin/component/PharmaSubCategory";
import PharmaOrder from "./Pages/pharma-admin/component/PharmaOrder";
import MyChart from "./Pages/pharma-admin/component/Mychart";
import PharmaWholeSale from "./Pages/pharma-admin/component/PharmaWholeSale";
import PharmaAdminLogin from "./Pages/pharma-admin/page/PharmaAdminLogin";
import ProtectedRoute from "./Pages/pharma-admin/page/ProtectedRoute";
import PharmaPrescription from "./Pages/pharma-admin/component/PharmaPrescription";
import ScrollToTop from "./components/ScrollToTop";
import AboutUs from "./Pages/footerLinksPages/AboutUs";
import ContactusForm from "./Pages/footerLinksPages/ContactusForm";



function HomePage() {
  return (
    <>
      <HeroSection />
      <Features />
      <Categories />
      <CarouselBanner />
      <PromoSection />
      <Personal />
      <ProductCarousel />
      <Footer />
    </>
  );
}

function App() {
  //   useEffect(() => {
  //   toast.info('Test toast works!');
  // }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/homepage" element={<Dashboard />} />
        <Route path="/success" element={<OrderSuccessModal />} />
        <Route path="/fever" element={<Fever />} />
        <Route path="/fever/:id" element={<Fever />} />
        <Route path="/ProductPage/:id" element={<ProductPage />} />
        <Route path="/FranchiseBanner" element={<FranchiseBanner />} />
        <Route path="/EditProfile" element={<EditProfile />} />
        <Route path="/OrderPage" element={<OrderPage />} />
        <Route path="/PatientsPage" element={<PatientsPage />} />
        <Route path="/NotificationsPage" element={<NotificationsPage />} />
        <Route path="/ConsultationsPage" element={<ConsultationsPage />} />
        <Route path="/Head" element={<Head />} />
        <Route path="/login" element={<Cart />} />
        <Route path="/cart" element={<AddToCart />} />
        <Route path="/Prescription" element={<Prescription />} />
        <Route path="/Phone" element={<Phone />} />
        <Route path="/subcategory/:subCategoryName" element={<Fever />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/contactus" element={<ContactusForm />} />



        {/* {Admin Panel Routes} */}
        {/* <Route path="/admin/AddProduct" element={<AddProduct />} />
      <Route path="/admin/Board" element={<Board />} />
      <Route path="/admin/Category" element={<Category />} />
      <Route path="/admin/Settings" element={<Settings />} />
      <Route path="/admin" element={<AdminLayout />} />
      <Route path="/admin/login" element={<Adminlogin />} />
      <Route path="/admin/Popup" element={<Popup />} />
      <Route path="/admin/SubCategory" element={<SubCategory />} />
      <Route path="/admin/BannerCrud" element={<BannerCrud />} />
      <Route path="/admin/User" element={<User />} /> */}
        {/* <Route index element={<Dashboard />} />    */}
        {/* Future pages can be added here */}
        {/* </Route> */}

        {/* pharma admin */}
        <Route>
          <Route path="/admin-login" element={<PharmaAdminLogin />} />

          <Route
            path="/pharma-admin"
            element={
              <ProtectedRoute>
                <PharmaAdmin />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<PharmaDashboard />} />
            <Route path="category" element={<PharmaCategory />} />
            <Route path="subCategory" element={<PharmaSubCategory />} />
            <Route path="orders" element={<PharmaOrder />} />
            <Route path="products" element={<PharmaProducts />} />
            <Route path="addNewProduct" element={<AddNewProduct />} />
            <Route path="addNewProduct/:id" element={<AddNewProduct />} />
            <Route path="banner" element={<PharmaBanner />} />
            <Route path="user" element={<PharmaUser />} />
            <Route path="settings" element={<PharmaSetting />} />
            <Route path="chart" element={<MyChart />} />
            <Route path="wholesale" element={<PharmaWholeSale />} />
            <Route path="prescriptions" element={<PharmaPrescription />} />
          </Route>
        </Route>

      </Routes>
    </>
  );
}

export default App;
