const Loader = () => {
  return (
    <div className="fixed inset-0 z-10 h-screen bg-[rgba(0,0,0,0.7)] flex items-center justify-center flex-col">
      <img
        src="/loader.svg"
        alt="loader"
        className="w-[100px] h-[100px] object-contain"
      />
    </div>
  );
};

export default Loader;
