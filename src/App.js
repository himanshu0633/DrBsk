import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import HeroSection from "./components/HeroSection/HeroSection"; 
import  Features  from "./components/Features/Features";
import  Categories  from "./components/Categories/Categories";
import  CarouselBanner  from "./components/CarouselBanner/CarouselBanner";
import  PromoSection  from "./components/PromoSection/PromoSection";
import  Personal  from "./components/Personal/Personal";
import  ProductCarousel  from "./components/ProductCarousel/ProductCarousel";
import  Footer  from "./components/Footer/Footer";
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
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/success" element={<OrderSuccessModal />} />
      <Route path="/fever" element={<Fever />} />
      <Route path="/ProductPage/:id" element={<ProductPage/>} />
      <Route path="/FranchiseBanner" element={<FranchiseBanner />} />
      <Route path="/EditProfile" element={<EditProfile />} />
      <Route path="/OrderPage" element={<OrderPage /> }/>
      <Route path="/PatientsPage" element={<PatientsPage /> }/>
      <Route path="/NotificationsPage" element={<NotificationsPage /> }/>
      <Route path="/ConsultationsPage" element={<ConsultationsPage /> }/>
      <Route path="/Landing" element={<Landing /> }/>
      <Route path="/Head" element={<Head /> }/>
      <Route path="/login" element={<Cart/>}/>
      <Route path="/cart" element={<AddToCart />} />
      <Route path="/Prescription" element={<Prescription />}/>
      <Route path="/Phone" element={<Phone />}/>
      {/* {Admin Panel Routes} */}
       <Route path="/admin/AddProduct" element={<AddProduct />}/>
      <Route path="/admin/Board" element={<Board />}/>
      <Route path="/admin/Category" element={<Category />}/>
      <Route path="/admin/Settings" element={<Settings />}/>
      <Route path="/admin" element={<AdminLayout />}/>
      <Route path="/admin/login" element={<Adminlogin />}/>
      <Route path="/admin/Popup" element={<Popup />}/>
      <Route path="/admin/SubCategory" element={<SubCategory/>}/>
      <Route path="/admin/BannerCrud" element={<BannerCrud />}/>
      <Route path="/admin/User" element={<User />}/>
        {/* <Route index element={<Dashboard />} />    */}
        {/* Future pages can be added here */}
      {/* </Route> */}
    </Routes>
  );
}

export default App;
