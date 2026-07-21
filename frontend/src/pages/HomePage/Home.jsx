import { useEffect, useState } from "react";
import { notification, Button } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import HeroSlider from "../../components/Layout/BodyHome/HeroSlider/HeroSlider.jsx"
import MembershipTier from "../../components/Layout/BodyHome/MembershipTier/MembershipTier.jsx"
import ServicesSlider from "../../components/Layout/BodyHome/ServicesSlider/ServicesSlider.jsx"
import StatsSection from "../../components/Layout/BodyHome/StatsSection/StatsSection.jsx"
import CTARegister from "../../components/Layout/BodyHome/CTARegister/CTARegister.jsx"
import PolicyModal from "../CustomerPage/components/PolicyModal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const DURATION = 8;

const PolicyNotificationContent = () => (
    <div>
        <style>{`
            @keyframes policy-bar-shrink {
                from { transform: scaleX(1); }
                to   { transform: scaleX(0); }
            }
        `}</style>
        <p style={{ margin: "0 0 10px 0" }}>
            Vui lòng đọc chính sách đặt lịch và hoàn cọc trước khi sử dụng dịch vụ.
        </p>
        <div style={{ height: 4, background: "#e6f0ff", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
                height: "100%",
                background: "#1677ff",
                borderRadius: 2,
                transformOrigin: "left center",
                animation: `policy-bar-shrink ${DURATION}s linear forwards`,
            }} />
        </div>
    </div>
);

let _policyNotifFired = false;

export default function Home() {
    const { user, loading } = useAuth();
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

    useEffect(() => {
        console.log("[PolicyNotif] useEffect triggered:", {
            loading,
            user: user ? { role: user.role, id: user.id } : null,
            just_logged_in: sessionStorage.getItem("just_logged_in"),
            _policyNotifFired,
        });

        if (loading || !user) {
            if (!loading && !user) {
                console.log("[PolicyNotif] User logged out, resetting guard");
                _policyNotifFired = false;
            }
            return;
        }

        if (user.role?.toUpperCase() !== "CUSTOMER") {
            console.log("[PolicyNotif] Not a customer, skip");
            return;
        }

        if (!sessionStorage.getItem("just_logged_in")) {
            console.log("[PolicyNotif] No just_logged_in flag, skip");
            return;
        }

        if (_policyNotifFired) {
            console.log("[PolicyNotif] Already fired this session, skip");
            return;
        }

        console.log("[PolicyNotif] ✅ Showing notification!");
        _policyNotifFired = true;
        sessionStorage.removeItem("just_logged_in");

        notification.info({
            key: "policy-notice",
            message: "Chính sách & Quy định",
            description: <PolicyNotificationContent />,
            icon: <FileTextOutlined style={{ color: "#1677ff" }} />,
            duration: DURATION,
            btn: (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => {
                        setIsPolicyModalOpen(true);
                        notification.destroy("policy-notice");
                    }}
                >
                    Xem ngay
                </Button>
            ),
            placement: "topRight",
        });
    }, [user, loading]);

    return (
        <>
            <HeroSlider />
            <MembershipTier />
            <ServicesSlider />
            <StatsSection />
            <CTARegister />
            <PolicyModal
                isOpen={isPolicyModalOpen}
                onClose={() => setIsPolicyModalOpen(false)}
            />
        </>
    );
}