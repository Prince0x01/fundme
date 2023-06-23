import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

import Link from "next/link";


const CampaignPage = () => {
  return (
    <div className="flex flex-col justify-between min-h-screen">
      {/* Nav and Hero Section */}
      <div className="bg-[url('/hero.webp')] h-[180px] lg:h-[300px] border-red-100 bg-no-repeat bg-cover bg-center flex relative">
        <Navbar />

        <div className="flex-1 bg-[#233989e6] clip-fund"></div>
        <div className="flex-1"></div>

        <div className="absolute inset-0 m-auto capitalize text-white text-center max-w-[600px] flex items-end justify-center p-4">
          <div>
            <h1 className="text-3xl lg:text-5xl lg:leading-tight font-bold mt-2 mb-3 font-playfair">
              Our campaigns
            </h1>
          </div>
        </div>
      </div>

      {/* Campaigns Section */}
      <section className="w-11/12 xl:w-4/5 max-w-7xl mx-auto my-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 10 }).map((_, idx) => (
          <Link href={`/campaign/${idx}`} key={idx}>
            <div className="shadow-[0px_10px_25px_rgba(37,42,52,0.08)] rounded-xl bg-white min-w-[220px]">
              <div>
                <img
                  src="/image.webp"
                  alt=""
                  className="w-full h-full"
                />
              </div>
              <div className="p-2">
                <h4 className="font-semibold text-sm">Technology</h4>
                <h3 className="my-2 xl:text-lg font-bold font-playfair">
                  Donate for poor peoples treatment and medicine.
                </h3>
                <p className="text-sm">
                  Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                </p>
                <div className="my-3 text-sm">
                  <div className="flex justify-between">
                    <p>Donated</p>
                    <p>60%</p>
                  </div>
                  <div className="rounded-sm overflow-hidden bg-[#B9BFD3] mb-1">
                    <div className="w-[50%] h-1 bg-[#3C4A79]"></div>
                  </div>
                  <div className="flex justify-between">
                    <p>Raised: $600</p>
                    <p>Goal: $1,000</p>
                  </div>
                </div>
                <button className="bg-[#3C4A79] px-3 py-2 rounded-lg text-white text-sm">
                  Donate Now
                </button>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default CampaignPage;
