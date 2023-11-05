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
  rectSwappingStrategy
} from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import SortableImage from "./SortableImage";


function App() {
  const [data, setData] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

// Data load start
useEffect(()=>{
  try {
    fetch("/data.json")
    .then((res) => res?.json())
    .then((data) => {
      setData(data);
    })
  } catch (error) {
    console.error("Data is not found", error);
  }
},[])
// Data load end


// image drag & drop start
const handleDragEnd = (event) => {
  const { active, over } = event;
  if (active.id !== over.id) {
    setData((items) => {
      const preIndex = items?.findIndex((item) => item?.id === active?.id);
      const nextIndex = items?.findIndex((item) => item?.id === over?.id);
      return arrayMove(items, preIndex, nextIndex);
    });
  }
};
// image drag & drop end


//image selection start
  const handleSelectionChange = (isSelected, imageId) => {
    setSelectedImages((prevSelected) => {
      if (isSelected) {
        return [...prevSelected, imageId];
      } else {
        return prevSelected?.filter((image) => image !== imageId);
      }
    });
  };
//image selection end


  //delete image section start
  const handleDelete = () => {
    setData(data?.filter((imgData) => !selectedImages?.includes(imgData?.id)));
    setSelectedImages([]);
    toast.error("Image Deleted succesfully");
    
  };
  //delete image section end


  //unselect image function start
  const handleUncheckAll = () => {
    setSelectedImages([]);
    toast.error("All images DeSelected");
  };
   //unselect image function start



  //image upload function start
  const handleUpload = (event) => {
    const files = event.target.files;
    const newImageData = Array.from(files).map((file, index) => ({
      id: data.length + index + 1, // Generate a unique ID for image
      imageURL: URL.createObjectURL(file),
    }));
    setData((prevData) => [...prevData, ...newImageData]);
    toast.success("Image uploaded succesfully");
  };
  //image upload function end



  return (
    <>
      <Toaster position="top-center" autoClose={5000}></Toaster>
      <div className="flex justify-center max-h-screen  w-full">
        <div className="bg-white">
          <div className="flex justify-between mx-8 py-3">
            <h1 className="font-bold text-xl">Gallery</h1>
            {selectedImages?.length > 0 ? (
              <h1 className="flex items-center font-bold">
                <span className="mr-2">
                  <input
                    type="checkbox"
                    checked={selectedImages?.length > 0}
                    onChange={handleUncheckAll}
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
                onClick={handleDelete}
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
          <hr />
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={data} strategy={rectSwappingStrategy}>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-6">
                {data.map((imgData, index) => (
                  <SortableImage
                    key={imgData?.id}
                    id={imgData?.id}
                    image={imgData?.imageURL}
                    index={index}
                    handleSelection={handleSelectionChange}
                    selected={selectedImages.includes(imgData?.id)}
                  />
                ))}
                <div className="w-auto h-auto border-2 border-dashed text-center">
                  <label className="inset-0 cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleUpload}
                    />
                    <div className="flex flex-col items-center justify-center h-full  ">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/Picture_icon_BLACK.svg"
                        alt=""
                        className="w-4 h-4 mb-3"
                      />
                      <p className="font-semibold text-xs lg:text-base">
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
