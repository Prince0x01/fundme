import { FileInput, Label, Spinner, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useNotification } from "web3uikit";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import LoaderComp from "@/components/Loader";
import TransactionLoader from "@/components/TransactionLoader";

import { useWalletContext } from "@/context/walletContext";

import { changeFileName, createImageUrl, storeFiles } from "@/utils/web3file";
import { abi, contractAddress } from "@/utils/contract";
import { formatError } from "@/utils/helpers";

const Create = () => {
  const { signer, address, provider } = useWalletContext();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    goal: "",
    milestone: "",
    endDate: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestError, setRequestError] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const dispatch = useNotification();

  useEffect(() => {
    const checkVerificationStatus = async () => {
      setLoading(true);
      setError("");
      setRequestError("");
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const res = await contract.verifiedAddress(address);
        setIsVerified(res);
      } catch (error) {
        setError(error);
      }
      setLoading(false);
    };
    checkVerificationStatus();
    return () => {};
  }, [address, signer]);

  const handleNewNotification = (type, message) => {
    dispatch({
      type,
      message,
      title: "Transaction Notification",
      position: "topR",
      icon: "bell",
    });
  };

  const handleChange = (e) => {
    const { files, name, value } = e.target;
    if (name === "image") {
      return setFormData({
        ...formData,
        [name]: files[0] && files[0],
        imageUrl: files[0] && URL.createObjectURL(files[0]),
      });
    }
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRequestLoading(true);

    const timeline = new Date(formData.endDate);
    const timelineStamp = Math.floor(timeline.getTime() / 1000);

    try {
      const newFile = changeFileName(
        formData.image,
        `${address}-${formData.title}`
      );
      const storeRes = await storeFiles([newFile]);

      const imageUrl = createImageUrl(
        storeRes,
        newFile.name.split(".")[0],
        newFile.name.split(".")[1]
      );

      const contract = new ethers.Contract(contractAddress, abi, signer);

      const res = await contract.createCampaign(
        formData.title,
        imageUrl,
        ethers.utils.parseEther(formData.goal),
        timelineStamp,
        formData.milestone,
        address?.slice(address?.length - 10)
      );
      await provider.waitForTransaction(res.hash, 1, 150000);
      router.push("/profile");
    } catch (error) {
      handleNewNotification("error", "An error occurred");
      setRequestError(formatError(error.message));
    }
  };

  const handleVerify = async () => {
    setRequestLoading(true);
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const res = await contract.setKycVerified(
        address?.slice(address?.length - 10)
      );
      await provider.waitForTransaction(res.hash, 1, 150000);
      handleNewNotification("info", "You are now verified");
      setIsVerified(true);
    } catch (error) {
      handleNewNotification("error", "An error occurred");
      setRequestError(formatError(error.message));
    }
    setRequestLoading(false);
  };

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
              Create Campaign
            </h1>
          </div>
        </div>
      </div>

      {/* Campaigns Section */}
      {loading && <LoaderComp />}

      {requestLoading && <TransactionLoader />}

      {!signer ? (
        <div className="w-11/12 xl:w-4/5 max-w-7xl mx-auto my-8 flex flex-col items-center justify-center gap-3">
          <h2 className="font-bold text-2xl">
            Please connect your wallet to proceed
          </h2>
        </div>
      ) : error ? (
        <div className="w-11/12 xl:w-4/5 max-w-7xl mx-auto my-8 flex flex-col items-center justify-center gap-3">
          <h2 className="font-bold text-2xl">
            An error occurred. Please try again
          </h2>
        </div>
      ) : (
        <section className="w-11/12 xl:w-4/5 max-w-7xl mx-auto my-8 flex-1">
          {isVerified ? (
            <form
              className="flex max-w-xl mx-auto flex-col gap-4"
              onSubmit={handleSubmit}
            >
              <p className="break-all text-red-500 capitalize text-center font-bold">
                {requestError}
              </p>
              <div>
                <div className="mb-1 block">
                  <Label htmlFor="title" value="Title" />
                </div>
                <TextInput
                  name="title"
                  id="title"
                  placeholder=""
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <div className="mb-1 block">
                  <Label htmlFor="goal" value="Campaign Goal" />
                </div>
                <TextInput
                  type="number"
                  name="goal"
                  id="goal"
                  placeholder=""
                  value={formData.goal}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <div className="mb-1 block">
                  <Label htmlFor="milestone" value="Number of Milestones" />
                </div>
                <TextInput
                  helperText={<>Number of milestones must be greater than 3</>}
                  type="number"
                  name="milestone"
                  id="milestone"
                  placeholder=""
                  value={formData.milestone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <div className="mb-1 block">
                  <Label htmlFor="endDate" value="End Date" />
                </div>
                <TextInput
                  type="datetime-local"
                  name="endDate"
                  id="endDate"
                  placeholder=""
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <div className="mb-1 block">
                  <Label htmlFor="image" value="Image" />
                </div>
                <FileInput name="image" id="image" onChange={handleChange} />
              </div>

              <button className="bg-[#3C4A79] px-4 py-2 rounded-lg text-white text-xs md:text-base flex justify-center items-center">
                {requestLoading ? (
                  <Spinner aria-label="Submitting form" size="sm" />
                ) : (
                  "Submit"
                )}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3">
              <h2 className="font-bold text-2xl">
                You must be KYC verified to create a campaign
              </h2>
              <button
                className="bg-[#3C4A79] px-4 py-2 rounded-lg text-white mr-2 text-xs md:text-base md:mr-0"
                onClick={handleVerify}
              >
                {requestLoading ? (
                  <Spinner aria-label="Submitting form" size="sm" />
                ) : (
                  "Proceed to verify"
                )}
              </button>
              <p className="break-all text-red-500 capitalize text-center font-bold">
                {requestError}
              </p>
            </div>
          )}
        </section>
      )}

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default Create;
