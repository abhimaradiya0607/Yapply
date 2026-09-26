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
    <div className="rounded-[28px] border border-dashed border-base-content/10 bg-base-200 px-6 py-10 text-center">
      <h3 className="text-lg font-semibold text-base-content">
        No language partners yet.
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-base-content/70">
        Your chat list is suspiciously peaceful.
      </p>
      <button
        type="button"
        onClick={findPartners}
        className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-content transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
      >
        Find language partners
      </button>
    </div>
  );
};

export default FriendsEmptyState;
