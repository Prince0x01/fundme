import { Spinner } from "flowbite-react";
import { Modal } from "web3uikit";

const ValidateModal = ({
  isModalOpen,
  onClose,
  selectedImage,
  handleSubmit,
  requestLoading,
}) => {
  return (
    <Modal
      isVisible={isModalOpen}
      isCentered
      onCancel={onClose}
      onCloseButtonPressed={onClose}
      hasFooter={false}
      width={"700px"}
    >
      <form className="space-y-6 w-3/4 mx-auto my-4 flex flex-col items-center justify-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Validate Proof
        </h3>
        <div className="flex-1 w-full">
          <img
            className="h-auto max-w-lg rounded-lg"
            src={selectedImage}
            alt="image description"
          />
        </div>

        <div className="w-full flex gap-2 items-center justify-around">
          <button
            className="bg-[#3C4A79] px-4 py-2 rounded-lg text-white text-xs md:text-base w-2/5"
            onClick={handleSubmit}
          >
            {requestLoading ? (
              <Spinner aria-label="Submitting form" size="sm" />
            ) : (
              "Validate Proof"
            )}
          </button>
          <button
            className="bg-white px-4 py-2 rounded-lg text-[#3C4A79] text-sm md:text-base border-[#3C4A79] border w-2/5"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ValidateModal;
