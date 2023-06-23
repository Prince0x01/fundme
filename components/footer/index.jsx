
import InstagramIcon from "@/components/icons/instagramicon";
import PinterestIcon from "@/components/icons/pinteresticon";
import TwitterIcon from "@/components/icons/twittericon";
import YoutubeIcon from "@/components/icons/youtubeicon";

const Footer = () => {
  return (
    <div className="bg-[#5B5F66] mt-8 pt-8 pb-6 text-white">
      <footer
        className="w-11/12 xl:w-4/5 max-w-7xl mx-auto flex flex-col sm:flex-row justify-between gap-4"
      >
        <div className="flex-1 font-playfair">
          <h2 className="text-3xl font-bold mb-2 ">FUND ME</h2>
          <h3 className="text-xl font-semibold mb-1">10k</h3>
          <h4 className="text-base">
            Worldwide Client <br />
            Already Connected
          </h4>
        </div>
        <div className="flex-1">
          <h4 className="font-bold mb-4 font-playfair">Quick Link</h4>
          <ul className="font-light text-sm flex flex-col gap-2">
            <li>Home</li>
            <li>About Us</li>
            <li>Blog Post</li>
            <li>Photo Gallery</li>
          </ul>
        </div>
        <div className="flex-1">
          <h4 className="font-bold mb-4 font-playfair">Get in Touch</h4>
          <ul className="font-light text-sm flex flex-col gap-2">
            <li>Contact Us</li>
            <li>Our Services</li>
          </ul>
        </div>
        <div className="flex-1">
          <h4 className="font-bold mb-2">Address</h4>
          <p className="mb-3 font-light text-sm">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit.
          </p>
          <h4 className="font-bold mb-2">Socials</h4>
          <ul className="flex gap-3">
            <li>
              <TwitterIcon />
            </li>
            <li>
              <InstagramIcon />
            </li>
            <li>
              <PinterestIcon />
            </li>
            <li>
              <YoutubeIcon />
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
