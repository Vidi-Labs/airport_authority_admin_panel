import { FiMapPin } from "react-icons/fi";
import Tooltip from "./ui/Tooltip";
import { NavigationContext } from "@/pages/Map";
import type { NavigationContextType } from "@/utils/types";
import { useContext } from "react";
import { resetEdges } from "@/utils/navigationHelper";

function EditPositionButton() {
  const { isEditMode, setIsEditMode, setNavigation } = useContext(
    NavigationContext
  ) as NavigationContextType;
  function handleEdit() {
    setIsEditMode(!isEditMode);
    resetEdges();
    setNavigation((prevNavigation) => ({
      ...prevNavigation,
      end: "",
    }));
  }
  return (
    <Tooltip content="Change Position">
      <button
        data-tooltip-target="tooltip-default"
        className="icon-button icon-button-success ml-1 center"
        onClick={() => handleEdit()}
        aria-label="change position"
      >
        <FiMapPin />
      </button>
    </Tooltip>
  );
}

export default EditPositionButton;
