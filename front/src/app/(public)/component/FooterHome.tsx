'use client'
import React from "react";
import { Layout } from "antd";

const { Footer } = Layout;

const FooterHome = () => {
    return (
        <Footer style={{ textAlign: "center", background: "#4A5558", color: "#fff" }}>
            © {new Date().getFullYear()} BEST SCHOOL COMMUNITY - VIETNAM
        </Footer>
    );
};

export default FooterHome;
