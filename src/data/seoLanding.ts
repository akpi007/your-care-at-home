import { locationData } from "@/data/locationData";

export interface SeoService {
  slug: string;
  label: string;
  plural: string;
  description: string;
}

export const SEO_SERVICES: SeoService[] = [
  {
    slug: "doctor",
    label: "Doctor",
    plural: "Doctors",
    description:
      "Consult a licensed doctor in the comfort of your home — general check-ups, acute illness, chronic care reviews and prescriptions.",
  },
  {
    slug: "nurse",
    label: "Nurse",
    plural: "Nurses",
    description:
      "Home nursing for wound care, injections, drips, post-operative recovery and elderly care, delivered by verified nurses.",
  },
  {
    slug: "midwife",
    label: "Midwife",
    plural: "Midwives",
    description:
      "Antenatal and postnatal midwifery care at home, including checks for mother and baby, breastfeeding support and newborn care.",
  },
  {
    slug: "physiotherapist",
    label: "Physiotherapist",
    plural: "Physiotherapists",
    description:
      "Home physiotherapy for injury rehabilitation, stroke recovery, back pain and mobility support.",
  },
  {
    slug: "paediatrician",
    label: "Paediatrician",
    plural: "Paediatricians",
    description:
      "Child health consultations at home — growth checks, immunisation advice, fevers and childhood illnesses.",
  },
  {
    slug: "psychiatrist",
    label: "Psychiatrist",
    plural: "Psychiatrists",
    description:
      "Confidential mental health consultations at home or online with qualified psychiatrists.",
  },
  {
    slug: "dentist",
    label: "Dentist",
    plural: "Dentists",
    description: "Dental consultations, screening and follow-up care arranged around your schedule.",
  },
  {
    slug: "lab-technician",
    label: "Lab Technician",
    plural: "Lab Technicians",
    description:
      "Home sample collection for blood tests, malaria screening and routine laboratory work, with results delivered digitally.",
  },
];

export const SEO_CITIES: string[] = Array.from(
  new Set(
    locationData
      .filter((c) => ["Zambia", "South Africa", "Kenya", "Nigeria"].includes(c.country))
      .flatMap((c) => c.regions.flatMap((r) => r.cities)),
  ),
);

export const citySlug = (city: string) => city.toLowerCase().replace(/\s+/g, "-");

export const cityFromSlug = (slug: string) =>
  SEO_CITIES.find((c) => citySlug(c) === slug.toLowerCase()) ?? null;

export const serviceFromSlug = (slug: string) =>
  SEO_SERVICES.find((s) => s.slug === slug.toLowerCase()) ?? null;
