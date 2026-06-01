import { useRouteDetails } from "@/hooks/useRouteDetails";
import { FaX } from "react-icons/fa6";
import { TbRoute } from "react-icons/tb";

function DesktopRouteDetails() {
  const { object, rightRouteLength, walkingTime, handleLeave } =
    useRouteDetails();

  return (
    <div className="md:w-fit md:visible invisible hidden md:flex flex-row pl-3">
      <div className="route-card navigation-info-pulse flex flex-inline w-full">
        <div className="route-icon w-14 h-14 center flex-none text-xl">
          <TbRoute />
        </div>
        <div className="flex flex-col max-w-32 h-full justify-center break-word">
          <p className="text-gray-900 text-sm font-semibold">{object?.name}</p>
        </div>
        <div className="flex flex-col h-full justify-center px-4">
          <p className="text-slate-500 text-xs">
            {rightRouteLength} m, {walkingTime} sek
          </p>
        </div>
        <div className="detail-chip h-14 w-14 center flex-none rounded-r-[1.25rem] text-sky-600 text-xs">
          <button
            className="w-full h-full center"
            onClick={handleLeave}
          >
            <FaX className="text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DesktopRouteDetails;
