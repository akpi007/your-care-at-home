import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";
import testimonial4 from "@/assets/testimonial-4.jpg";

export interface Testimonial {
  id: number;
  name: string;
  location: string;
  quote: string;
  image: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Amara Okafor",
    location: "Lagos, Nigeria",
    quote: "Rapha Telehealth brought a doctor to my doorstep in under 30 minutes. Incredible service!",
    image: testimonial1,
    rating: 5,
  },
  {
    id: 2,
    name: "David Mwanza",
    location: "Lusaka, Zambia",
    quote: "As a busy father, home visits save me hours. My family's health has never been better.",
    image: testimonial2,
    rating: 5,
  },
  {
    id: 3,
    name: "Kwame Asante",
    location: "Accra, Ghana",
    quote: "Professional, affordable, and convenient. I recommend MedHome to everyone.",
    image: testimonial3,
    rating: 4,
  },
  {
    id: 4,
    name: "Mama Nkechi",
    location: "Nairobi, Kenya",
    quote: "Getting care at home changed everything for me. The nurses are so kind and skilled.",
    image: testimonial4,
    rating: 5,
  },
];
