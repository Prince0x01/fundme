import { Label, Spinner, TextInput } from "flowbite-react";
import { Modal } from "web3uikit";
import { useState } from "react";

const DonateModal = ({
  isModalOpen,
  onClose,
  handleSubmit,
  requestLoading,
}) => {
  const [amount, setAmount] = useState("");

  const handleChange = (e) => {
    setAmount(e.target.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(amount);
  };

  return (
    <Modal
      isVisible={isModalOpen}
      isCentered
      onCancel={onClose}
      onCloseButtonPressed={onClose}
      hasFooter={false}
      width={"500px"}
    >
      <form
        className="space-y-6 w-3/4 mx-auto my-4 flex flex-col items-center justify-center"
        onSubmit={onSubmit}
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Make Donation
        </h3>
        <div className="flex-1 w-full">
          <div className="mb-1 block">
            <Label htmlFor="amount" value="Donation Amount" />
          </div>
          <TextInput
            type="number"
            name="amount"
            id="amount"
            placeholder=""
            value={amount}
            onChange={handleChange}
          />
        </div>

        <div className="w-full flex justify-center items-center">
          <button className="bg-[#3C4A79] px-4 py-2 rounded-lg text-white text-xs md:text-base ">
            {requestLoading ? (
              <Spinner aria-label="Submitting form" size="sm" />
            ) : (
              "Donate"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DonateModal;
