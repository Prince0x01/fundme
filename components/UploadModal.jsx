import { FileInput, Label, Spinner } from "flowbite-react";
import { Modal } from "web3uikit";
import { useState } from "react";

const UploadModal = ({
  isModalOpen,
  onClose,
  handleSubmit,
  requestLoading,
}) => {
  const [formData, setFormData] = useState({
    image: "",
  });

  const handleChange = (e) => {
    const { files } = e.target;

    setFormData({
      ...formData,
      image: files[0] && files[0],
      imageUrl: files[0] && URL.createObjectURL(files[0]),
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(formData.image);
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
          Upload Proof
        </h3>
        <div className="flex-1 w-full">
          <div className="mb-1 block">
            <Label htmlFor="image" value="Image" />
          </div>
          <FileInput name="image" id="image" onChange={handleChange} />
          <div className="flex items-center justify-center my-3">
            {formData.image && (
              <img
                src={formData.imageUrl}
                alt=""
                className="w-40 h-40 rounded-lg"
              />
            )}
          </div>
        </div>

        <div className="w-full flex justify-center items-center">
          <button className="bg-[#3C4A79] px-4 py-2 rounded-lg text-white text-xs md:text-base ">
            {requestLoading ? (
              <Spinner aria-label="Submitting form" size="sm" />
            ) : (
              "Upload Proof"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadModal;
