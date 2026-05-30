import HeroSlider from "../../components/Layout/BodyHome/HeroSlider/HeroSlider.jsx"
import MembershipTier from "../../components/Layout/BodyHome/MembershipTier/MembershipTier.jsx"
import ServicesSlider from "../../components/Layout/BodyHome/ServicesSlider/ServicesSlider.jsx"
import StatsSection from "../../components/Layout/BodyHome/StatsSection/StatsSection.jsx"
import CTARegister from "../../components/Layout/BodyHome/CTARegister/CTARegister.jsx"

export default function Home() {
    return (
        <>
            <HeroSlider />
            <MembershipTier />
            <ServicesSlider />
            <StatsSection />
            <CTARegister />
        </>
    )
}