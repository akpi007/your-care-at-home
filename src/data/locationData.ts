export interface LocationEntry {
  country: string;
  regionLabel: string; // "State" or "Province"
  regions: {
    name: string;
    cities: string[];
  }[];
}

export const locationData: LocationEntry[] = [
  {
    country: "Zambia",
    regionLabel: "Province",
    regions: [
      { name: "Lusaka", cities: ["Lusaka", "Kafue", "Chongwe", "Chirundu"] },
      { name: "Copperbelt", cities: ["Kitwe", "Ndola", "Mufulira", "Luanshya", "Chingola"] },
      { name: "Southern", cities: ["Livingstone", "Choma", "Mazabuka", "Monze"] },
      { name: "Central", cities: ["Kabwe", "Kapiri Mposhi", "Mkushi"] },
      { name: "Eastern", cities: ["Chipata", "Petauke", "Katete"] },
      { name: "Northern", cities: ["Kasama", "Mpulungu", "Mbala"] },
      { name: "Luapula", cities: ["Mansa", "Nchelenge", "Samfya"] },
      { name: "North-Western", cities: ["Solwezi", "Kasempa", "Mwinilunga"] },
      { name: "Western", cities: ["Mongu", "Senanga", "Kaoma"] },
      { name: "Muchinga", cities: ["Mpika", "Chinsali", "Isoka"] },
    ],
  },
  {
    country: "South Africa",
    regionLabel: "Province",
    regions: [
      { name: "Gauteng", cities: ["Johannesburg", "Pretoria", "Sandton", "Soweto"] },
      { name: "Western Cape", cities: ["Cape Town", "Stellenbosch", "Paarl"] },
      { name: "KwaZulu-Natal", cities: ["Durban", "Pietermaritzburg", "Richards Bay"] },
      { name: "Eastern Cape", cities: ["Port Elizabeth", "East London"] },
      { name: "Limpopo", cities: ["Polokwane", "Thohoyandou"] },
      { name: "Mpumalanga", cities: ["Nelspruit", "Witbank"] },
      { name: "Free State", cities: ["Bloemfontein", "Welkom"] },
      { name: "North West", cities: ["Rustenburg", "Mahikeng"] },
      { name: "Northern Cape", cities: ["Kimberley", "Upington"] },
    ],
  },
  {
    country: "Kenya",
    regionLabel: "County",
    regions: [
      { name: "Nairobi", cities: ["Nairobi"] },
      { name: "Mombasa", cities: ["Mombasa"] },
      { name: "Kisumu", cities: ["Kisumu"] },
      { name: "Nakuru", cities: ["Nakuru"] },
      { name: "Kiambu", cities: ["Thika", "Kiambu"] },
    ],
  },
  {
    country: "Nigeria",
    regionLabel: "State",
    regions: [
      { name: "Lagos", cities: ["Lagos", "Ikeja", "Victoria Island"] },
      { name: "Abuja FCT", cities: ["Abuja"] },
      { name: "Rivers", cities: ["Port Harcourt"] },
      { name: "Kano", cities: ["Kano"] },
      { name: "Oyo", cities: ["Ibadan"] },
    ],
  },
  {
    country: "Tanzania",
    regionLabel: "Region",
    regions: [
      { name: "Dar es Salaam", cities: ["Dar es Salaam"] },
      { name: "Arusha", cities: ["Arusha"] },
      { name: "Mwanza", cities: ["Mwanza"] },
      { name: "Dodoma", cities: ["Dodoma"] },
    ],
  },
  {
    country: "Zimbabwe",
    regionLabel: "Province",
    regions: [
      { name: "Harare", cities: ["Harare"] },
      { name: "Bulawayo", cities: ["Bulawayo"] },
      { name: "Manicaland", cities: ["Mutare"] },
      { name: "Mashonaland West", cities: ["Chinhoyi"] },
    ],
  },
  {
    country: "United States",
    regionLabel: "State",
    regions: [
      { name: "California", cities: ["Los Angeles", "San Francisco", "San Diego"] },
      { name: "New York", cities: ["New York City", "Buffalo", "Albany"] },
      { name: "Texas", cities: ["Houston", "Dallas", "Austin"] },
      { name: "Florida", cities: ["Miami", "Orlando", "Tampa"] },
    ],
  },
  {
    country: "United Kingdom",
    regionLabel: "Region",
    regions: [
      { name: "England", cities: ["London", "Manchester", "Birmingham", "Liverpool"] },
      { name: "Scotland", cities: ["Edinburgh", "Glasgow"] },
      { name: "Wales", cities: ["Cardiff", "Swansea"] },
      { name: "Northern Ireland", cities: ["Belfast"] },
    ],
  },
  {
    country: "Canada",
    regionLabel: "Province",
    regions: [
      { name: "Ontario", cities: ["Toronto", "Ottawa", "Hamilton"] },
      { name: "Quebec", cities: ["Montreal", "Quebec City"] },
      { name: "British Columbia", cities: ["Vancouver", "Victoria"] },
      { name: "Alberta", cities: ["Calgary", "Edmonton"] },
    ],
  },
  {
    country: "India",
    regionLabel: "State",
    regions: [
      { name: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur"] },
      { name: "Delhi", cities: ["New Delhi"] },
      { name: "Karnataka", cities: ["Bangalore", "Mysore"] },
      { name: "Tamil Nadu", cities: ["Chennai", "Coimbatore"] },
    ],
  },
];
