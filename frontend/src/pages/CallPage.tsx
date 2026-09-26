import CallButton from "../components/CallButton";

const CallPage = () => {
  const handleVideoCall = () => {};

  return (
    <div className="relative h-full">
      <CallButton handleVideoCall={handleVideoCall} />
    </div>
  );
};

export default CallPage;
