import {
  DndContext,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSwappingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import SortableImage from "./SortableImage";

function App() {
  const [data, setData] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  // Data load start
  useEffect(() => {
    try {
      fetch("/data.json")
        .then((res) => res?.json())
        .then((data) => {
          setData(data);
        });
    } catch (error) {
      console.error("Data is not found", error);
    }
  }, []);
  // Data load end

  // image drag & drop start
  const handleDragAndDrop = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setData((items) => {
        const oldIndex = items?.findIndex((item) => item?.id === active?.id);
        const newIndex = items?.findIndex((item) => item?.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  // image drag & drop end

  //image selection start
  const handleImageSelect = (isSelected, imageId) => {
    setSelectedImages((previousSelectedImage) => {
      if (isSelected) {
        return [...previousSelectedImage, imageId];
      } else {
        return previousSelectedImage?.filter((image) => image !== imageId);
      }
    });
  };
  //image selection end

  //delete image section start
  const handleSelectedImageDelete = () => {
    setData(data?.filter((imgData) => !selectedImages?.includes(imgData?.id)));
    setSelectedImages([]);
    toast.success("Image Deleted successfully");
  };
  //delete image section end

  //unselect image function start
  const handleUnselectedAllImages = () => {
    setSelectedImages([]);
    toast.success("Unselected all images successfully");
  };
  //unselect image function start

  //image upload function start
  const handleImageUpload = (event) => {
    const files = event.target.files;
    const newImageData = Array.from(files).map((file, index) => ({
      id: data.length + index + 1, // new ID create for each image
      imageURL: URL.createObjectURL(file), // new url for uploaded image
    }));
    setData((previousData) => [...previousData, ...newImageData]);
    toast.success("yes, Image uploaded successfully");
  };
  //image upload function end

  return (
    <>
      <Toaster
        position="bottom-right"
        reverseOrder={true}
        autoClose={5000}
      ></Toaster>
      <div className="flex justify-center max-h-screen  w-full">
        <div className="bg-white">
          <div className="flex justify-between mx-8 py-3 border border-b-gray-200 border-r-0 border-l-0">
            <h1 className="font-bold text-xl">Gallery</h1>
            {selectedImages?.length > 0 ? (
              <h1 className="flex items-center font-bold">
                <span className="mr-2">
                  <input
                    type="checkbox"
                    checked={selectedImages?.length > 0}
                    onChange={handleUnselectedAllImages}
                  />
                </span>{" "}
                <span className="mr-1">({selectedImages?.length})</span>
                Files Selected
              </h1>
            ) : (
              ""
            )}

            {selectedImages?.length > 0 && (
              <button
                onClick={handleSelectedImageDelete}
                className="font-bold text-sx border border-red-500 bg-red-100 px-2 py-2 rounded-sm"
              >
                {selectedImages?.length > 1 ? (
                  <span>Delete files</span>
                ) : (
                  <span>Delete file</span>
                )}
              </button>
            )}
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragAndDrop}
          >
            <SortableContext items={data} strategy={rectSwappingStrategy}>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-6">
                {data.map((imgData, index) => (
                  <SortableImage
                    key={imgData?.id}
                    id={imgData?.id}
                    image={imgData?.imageURL}
                    index={index}
                    handleSelection={handleImageSelect}
                    selected={selectedImages.includes(imgData?.id)}
                  />
                ))}
                <div className="w-auto h-auto  bg-gray-100 hover:bg-gray-50 border-2 border-dashed text-center">
                  <label className="inset-0 cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                    />
                    <div className="flex flex-col items-center justify-center h-full">
                      <svg
                        className="text-gray-600"
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        viewBox="0 0 512 512"
                      >
                        <path
                          fill="currentColor"
                          d="M336 72V40H40v432h432V184h-32v25.68l-64.769-64.77L306 214.142l-100-100l-134 134V72Zm39.231 118.166L440 254.935v93.207L328.628 236.769ZM206 159.4l234 234V440H72V293.4Z"
                        />
                        <path
                          fill="currentColor"
                          d="M448 16h-32v48h-48v32h48v48h32V96h48V64h-48V16z"
                        />
                      </svg>

                      <p className="font-bold underline text-xs text-gray-600 lg:text-base">
                        Add Images
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </>
  );
}

export default App;
