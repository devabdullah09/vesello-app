"use client"

import HeroSection from "@/components/sections/HeroSection"
import TimelineSection from "@/components/sections/TimelineSection"
import CeremonySection from "@/components/sections/CeremonySection"
import CeremonyVenueSection from "@/components/sections/CeremonyVenueSection"
import SeatingChartSection from "@/components/sections/SeatingChartSection"
import MenuSection from "@/components/sections/MenuSection"
import WishesAndGiftsSection from "@/components/sections/WishesAndGiftsSection"
import TeamSection from "@/components/sections/TeamSection"
import RSVPSection from "@/components/sections/RSVPSection"
import AccommodationSection from "@/components/sections/AccommodationSection"
import TransportationSection from "@/components/sections/TransportationSection"
import AdditionalInfoSection from "@/components/sections/AdditionalInfoSection"

export default function WeddingLanding() {
  return (
    <main>
      <HeroSection />
      <TimelineSection />
      <CeremonySection />
      <CeremonyVenueSection />
      <SeatingChartSection />
      <MenuSection />
      <WishesAndGiftsSection />
      <TeamSection />
      <AccommodationSection />
      <TransportationSection />
      <AdditionalInfoSection />
    </main>
  )
}
