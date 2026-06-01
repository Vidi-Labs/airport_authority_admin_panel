import { useRouteDetails } from "@/hooks/useRouteDetails";
import { FaX } from "react-icons/fa6";
import { TbRoute } from "react-icons/tb";

function MobileRouteDetails() {
  const { object, rightRouteLength, walkingTime, handleLeave } =
    useRouteDetails();
  return (
    <div className="mobile-route-sheet navigation-info-pulse absolute bottom-0 left-0 right-0 mx-auto w-full rounded-t-[1.75rem] overflow-hidden">
      <button className="absolute right-3 top-3" onClick={handleLeave}>
        <FaX className="text-gray-400" />
      </button>

      <div className="p-5 pb-1">
        <h1 className="text-gray-900 text-xl font-semibold mb-1">
          {object?.name}
        </h1>
        <p className="text-gray-500 text-sm">{object?.categoryName}</p>
      </div>
      <div className="detail-chip text-gray-900 px-3 py-2 center w-fit rounded-2xl text-sm font-semibold m-4 mt-2">
        <TbRoute className="inline-block mr-1" />
        {walkingTime} seconds away - {rightRouteLength} meters
      </div>
    </div>
  );
}

export default MobileRouteDetails;
