import type { Metadata } from "next";
import { DashboardHubClient } from "./DashboardHubClient";

export const metadata: Metadata = {
  title: "Dashboards — Choose Your Account",
  description:
    "Access the traveler, visa agent, travel agency, tour guide, property host or admin dashboard.",
};

export default function DashboardHub() {
  return <DashboardHubClient />;
}
