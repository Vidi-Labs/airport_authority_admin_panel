import { FiChevronRight } from "react-icons/fi";
import { useContext, useEffect, useState } from "react";
import type {
  MapDataContextType,
  NavigationContextType,
  ObjectItem,
} from "@/utils/types";
import { MapDataContext, NavigationContext } from "../pages/Map";

import { navigateToObject } from "@/utils/navigationHelper";

interface ParsedObjects {
  [key: string]: {
    len: number;
    results: ObjectItem[];
  };
}

function Sidebar() {
  const { navigation, setNavigation, setIsEditMode } = useContext(
    NavigationContext
  ) as NavigationContextType;
  const { objects } = useContext(MapDataContext) as MapDataContextType;
  const [parsedObjects, setParsedObjects] = useState<ParsedObjects>({});
  useEffect(() => {
    const groupedObjects = () => {
      const data: ParsedObjects = {};
      objects.forEach((object) => {
        const firstLetter = object.name.charAt(0).toUpperCase();
        if (!data[firstLetter]) {
          data[firstLetter] = {
            len: 0,
            results: [],
          };
        }
        data[firstLetter].results.push(object);
        data[firstLetter].len += 1;
      });
      setParsedObjects(data);
    };
    groupedObjects();
  }, [objects]);

  function handleObjectNavigation(selectedObjectName: string) {
    const object = objects.find((obj) => obj.name === selectedObjectName);
    setIsEditMode(false);
    if (!object) return;
    console.log(object);
    navigateToObject(object.name, navigation, setNavigation);
  }

  return (
    <aside className="sidebar-panel">
      <header className="sidebar-header flex flex-col mb-4 pr-1 py-2 w-full">
        <div className="flex items-center flex-none mr-10">

          <div className="flex flex-col">
            <div className="flex flex-col">
              <p className="sidebar-title text-3xl font-semibold pl-2">
                Seekr
              </p>
              <p className="sidebar-subtitle text-sm font-semibold uppercase tracking-[0.22em] pl-2">
                Airport Map Navigation
              </p>
            </div>
          </div>
        </div>
      </header>
      <div className="sidebar-scroll overflow-auto h-full pr-1">
        {Object.keys(parsedObjects)
          .sort()
          .map((letter, index) => (
            <div key={index} className="mb-4">
              <header className="p-2">
                <h2 className="sidebar-letter text-2xl font-bold">
                  {letter}
                  <span className="sidebar-count ml-2 text-sm font-medium">
                    - {parsedObjects[letter].len}{" "}
                    {parsedObjects[letter].len === 1 ? "Result" : "Results"}
                  </span>
                </h2>
              </header>
              <div className="flex flex-col ">
                {parsedObjects[letter].results.map((item) => (
                  <div
                    key={item.id?.toString()}
                    data-product={item.name}
                    className="sidebar-result-card flex m-1 px-4 py-3 rounded-2xl cursor-pointer h-auto"
                    onClick={() => handleObjectNavigation(item.name)}
                  >
                    <div className="m-1">
                      <p className="sidebar-result-title text-xs 2xl:text-sm font-semibold">
                        {item.name}
                      </p>
                      <p className="sidebar-result-copy text-xs 2xl:text-sm">
                        {item.desc}
                      </p>
                    </div>
                    <div className="center ml-auto h-auto text-xl text-sky-200">
                      <FiChevronRight />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </aside>
  );
}
export default Sidebar;
