import { useNavigate } from "react-router-dom";

const FriendsEmptyState = ({
  onFindPartners,
}: {
  onFindPartners?: () => void;
}) => {
  const navigate = useNavigate();

  const findPartners = () => {
    if (onFindPartners) {
      onFindPartners();
      return;
    }

    navigate("/#discover-learners");
  };

  return (
    <div className="rounded-[28px] border border-dashed border-white/10 bg-[#1a1b1e] px-6 py-10 text-center">
      <h3 className="text-lg font-semibold text-[#f5f5f5]">
        No language partners yet.
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#b8bac2]">
        Your chat list is suspiciously peaceful.
      </p>
      <button
        type="button"
        onClick={findPartners}
        className="mt-5 rounded-xl bg-[#c7ff20] px-4 py-2.5 text-sm font-bold text-[#111214] transition hover:bg-[#d3ff4d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c7ff20] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111214]"
      >
        Find language partners
      </button>
    </div>
  );
};

export default FriendsEmptyState;
