import BookingForm from "../../components/Layout/Body/BookingForm/BookingForm.jsx"
import HeroSlider from "../../components/Layout/Body/HeroSlider/HeroSlider.jsx"
import MembershipTier from "../../components/Layout/Body/MembershipTier/MembershipTier.jsx"
import ServicesSlider from "../../components/Layout/Body/ServicesSlider/ServicesSlider.jsx"
import Footer from "../../components/Layout/Footer/Footer.jsx"
import Navbar from "../../components/Layout/Header/Navbar.jsx"

export default function Home() {
    return (
        <>
            <Navbar></Navbar>
            <HeroSlider></HeroSlider>
            <MembershipTier></MembershipTier>
            <ServicesSlider></ServicesSlider>
            <BookingForm></BookingForm>
            <Footer></Footer>
        </>
    )
}