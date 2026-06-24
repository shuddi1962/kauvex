import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kauvex Express — Coverage Areas",
  description: "See where Kauvex Express delivers. Domestic coverage across all 36 Nigerian states and international shipping to 50+ countries.",
};

const domesticZones = [
  { region: "Lagos", cities: "Ikeja, Victoria Island, Lekki, Surulere, Yaba, Ikoyi, Ajah, Ogba, Agege, Badagry, Epe, Ikorodu", states: "Lagos State" },
  { region: "South West", cities: "Ibadan, Abeokuta, Akure, Oshogbo, Oyo, Ile-Ife, Ondo, Ado-Ekiti", states: "Oyo, Ogun, Ondo, Osun, Ekiti" },
  { region: "South East", cities: "Enugu, Onitsha, Aba, Owerri, Awka, Nnewi, Umuahia, Abakaliki", states: "Enugu, Anambra, Abia, Imo, Ebonyi" },
  { region: "South South", cities: "Port Harcourt, Uyo, Calabar, Benin City, Warri, Asaba, Yenagoa", states: "Rivers, Akwa Ibom, Cross River, Edo, Delta, Bayelsa" },
  { region: "North Central", cities: "Abuja (FCT), Lokoja, Makurdi, Ilorin, Minna, Lafia", states: "FCT, Kogi, Benue, Kwara, Niger, Nasarawa" },
  { region: "North East", cities: "Maiduguri, Yola, Bauchi, Gombe, Jalingo, Damaturu", states: "Borno, Adamawa, Bauchi, Gombe, Taraba, Yobe" },
  { region: "North West", cities: "Kano, Kaduna, Katsina, Sokoto, Zaria, Gusau, Dutse, Birnin Kebbi", states: "Kano, Kaduna, Katsina, Sokoto, Zamfara, Jigawa, Kebbi" },
];

const internationalCountries = [
  {
    continent: "Africa",
    countries: "Ghana, Kenya, South Africa, Egypt, Morocco, Tanzania, Uganda, Rwanda, Ethiopia, Cameroon, Senegal, Ivory Coast, Angola, Zambia, Botswana, Mauritius, Seychelles, Tunisia, Algeria",
  },
  {
    continent: "Europe",
    countries: "United Kingdom, Germany, France, Italy, Spain, Netherlands, Belgium, Switzerland, Sweden, Norway, Denmark, Finland, Ireland, Portugal, Austria, Poland, Czech Republic, Greece, Romania, Hungary, Luxembourg",
  },
  {
    continent: "North America",
    countries: "United States, Canada, Mexico",
  },
  {
    continent: "South America",
    countries: "Brazil, Argentina, Chile, Colombia, Peru, Ecuador",
  },
  {
    continent: "Asia",
    countries: "China, India, Japan, South Korea, UAE, Saudi Arabia, Singapore, Malaysia, Thailand, Indonesia, Vietnam, Philippines, Pakistan, Bangladesh, Qatar, Kuwait, Oman, Bahrain, Jordan, Israel, Turkey, Hong Kong, Taiwan",
  },
  {
    continent: "Oceania",
    countries: "Australia, New Zealand",
  },
];

export default function ExpressCoveragePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="w-full max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl lg:text-4xl font-bold text-[#0A1628] mb-2">Coverage Areas</h1>
        <p className="text-gray-500 mb-10">
          Kauvex Express delivers across all 36 Nigerian states (including FCT) and to 50+ countries internationally.
        </p>

        <h2 className="text-xl font-bold text-[#0A1628] mb-4">Domestic Coverage — Nigeria</h2>
        <div className="overflow-x-auto mb-12">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-[#0A1628]">Region</th>
                <th className="text-left px-4 py-3 font-semibold text-[#0A1628]">Cities</th>
                <th className="text-left px-4 py-3 font-semibold text-[#0A1628]">States</th>
              </tr>
            </thead>
            <tbody>
              {domesticZones.map((z) => (
                <tr key={z.region} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-semibold text-[#0A1628] whitespace-nowrap">{z.region}</td>
                  <td className="px-4 py-3 text-gray-600">{z.cities}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{z.states}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-bold text-[#0A1628] mb-4">International Coverage</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {internationalCountries.map((c) => (
            <div key={c.continent} className="border border-gray-200 rounded-xl p-4">
              <h3 className="font-bold text-sm text-[#0A1628] mb-2">{c.continent}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{c.countries}</p>
            </div>
          ))}
        </div>

        <div className="p-6 bg-gray-50 rounded-2xl text-center">
          <h3 className="font-bold text-[#0A1628] mb-2">Not sure if we cover your route?</h3>
          <p className="text-sm text-gray-500 mb-4">Enter your pickup and drop-off locations in the quote calculator to check coverage and get an instant price.</p>
          <Link href="/express" className="inline-flex items-center gap-2 px-6 h-10 bg-[#FF6B00] text-white text-sm font-bold rounded-xl hover:bg-[#FF6B00]/90 transition-colors">
            Get a Quote
          </Link>
        </div>
      </div>
    </div>
  );
}
