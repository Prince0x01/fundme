import Footer from "@/components/footer";
import CalendarIcon from "@/components/icons/calendaricon";
import UserIcon from "@/components/icons/usericon";
import Navbar from "@/components/navbar";

const CampaignPage = () => {
  return (
    <div className="flex flex-col justify-between min-h-screen">
      {/* Nav and Hero Section */}
      <div className="bg-[url('/hero.webp')] h-[180px] lg:h-[300px] border-red-100 bg-no-repeat bg-cover bg-center flex relative">
        <Navbar />

        <div className="flex-1 bg-[#233989e6] clip-fund"></div>
        <div className="flex-1"></div>
      </div>

      {/* Campaign Section */}
      <main className="w-11/12 xl:w-4/5 max-w-7xl mx-auto my-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold font-playfair">
          Donate for poor peoples treatment and medicine.
        </h1>
        <article className="flex flex-col sm:flex-row gap-4 lg:gap-8 mt-6">
          <div className="flex-[5] lg:pr-8">
            <div className="rounded-md overflow-hidden">
              <img src="/image.webp" alt="" />
            </div>
            <div className="flex gap-8 my-4 text-sm">
              <div className="flex gap-2 items-center">
                <UserIcon />
                <p>Prince Ogolo</p>
              </div>
              <div className="flex gap-2 items-center">
                <CalendarIcon />
                <p>12 Sep 2023</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Molestiae, maiores quas. Perferendis assumenda cupiditate
                consequatur culpa alias. Sint sequi consequuntur unde dolorem,
                nostrum deserunt nihil minus? Sed ad eaque eligendi.
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cum
                natus in minima rem illum porro at eum harum officiis accusamus
                modi ad assumenda, neque, fuga eos nisi! Odio, totam eveniet!
              </p>
            </div>
          </div>
          <section className="flex-[3]">
            <aside className="rounded-lg bg-[#E0E7FF] h-max px-4 pt-6 pb-2">
              <div className="mb-3 text-sm">
                <div className="flex justify-between">
                  <p>Donations</p>
                  <p>60%</p>
                </div>
                <div className="rounded-sm overflow-hidden bg-[#B9BFD3] mt-1 mb-2">
                  <div className="w-[50%] h-1 bg-[#3C4A79]"></div>
                </div>
                <div className="flex justify-between">
                  <p>Raised: $600</p>
                  <p>Goal: $1,000</p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 mt-8">
                <button className="text-[#3C4A79] px-3 py-2 rounded-lg bg-white text-sm border border-[#3C4A79]">
                  Donate Now
                </button>
                <p className="text-sm">Request Refund</p>
              </div>
            </aside>
            <aside className="shadow-[0px_12px_15px_rgba(0,0,0,0.25)] rounded-xl bg-white p-4 my-4">
              <h3 className="text-[#011627] md:text-xl my-3">Milestones</h3>
              <div className="mb-4 text-sm">
                <div className="flex justify-between">
                  <p>1st Milestone</p>
                  <p>60%</p>
                </div>
                <div className="rounded-sm overflow-hidden bg-[#B9BFD3] mt-1 mb-2">
                  <div className="w-[50%] h-1 bg-[#3C4A79]"></div>
                </div>
                <div className="flex justify-between">
                  <p>Raised: $600</p>
                  <button className="bg-[#3C4A79] px-2 py-1 rounded-full text-white text-sm">
                    Withdraw
                  </button>
                </div>
              </div>
            </aside>
          </section>
        </article>
      </main>

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default CampaignPage;
