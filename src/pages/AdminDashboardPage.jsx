import React, { useEffect } from "react";
import { AuthContext } from "../authContext";
import { useDrag, useDrop } from 'react-dnd';
import { useNavigate } from "react-router";

const AdminDashboardPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const [videoInfo, setVideoInfo] = React.useState([])
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [error, setError] = React.useState("");
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchVideoInfo = async (page) => {
      try {
        const userToken = localStorage.getItem("token");
        const reqData = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-project": "cmVhY3R0YXNrOmQ5aGVkeWN5djZwN3p3OHhpMzR0OWJtdHNqc2lneTV0Nw==",
            "Authorization": `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            payload: {},
            page: page,
            limit: 10,
          }),
        };

        const res = await fetch("https://reacttask.mkdlabs.com/v1/api/rest/video/PAGINATE", reqData);
        const result = await res.json();

        setVideoInfo(result.list.length > 0 ? result.list : []);
        setTotalPages(result.num_pages > 1 ? result.num_pages : 1);
      } catch (error) {
        setError(error.message || "Failed to fetch Video list.");
      }
    }

    fetchVideoInfo(currentPage);
  }, [currentPage])

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    window.location.href = "/admin/login";
    navigate(`${role}/login`)
  };

  const handleGoToNext = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handleGoToPrevious = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };


  const handleMoveRow = (dragIndex, hoverIndex) => {
    const newVideoInfo = [...videoInfo];
    const draggedRow = newVideoInfo[dragIndex];
    newVideoInfo.splice(dragIndex, 1);
    newVideoInfo.splice(hoverIndex, 0, draggedRow);
    setVideoInfo(newVideoInfo);
  };

  return (
    <div className="bg-black min-h-screen">
      <div className="md:container mx-auto px-10">
        <div className="flex justify-between align-center gap-2 py-5">
          <div>
            <h2 className="text-3xl text-white font-bold">App</h2>
          </div>
          <div>
            <button
              className="bg-yellow-400 rounded-full px-5 py-1.5"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center	pt-10">
          <h2 className="text-white font-inter text-4xl font-extralight leading-12">
            Today's leaderboard
          </h2>
          <div className="bg-neutral-900 rounded-xl py-2 px-6">
            <span className="text-white text-base font-extralight">30 May 2022</span>
            <span className="text-gray-600" style={{ color: "#696969" }}>&nbsp; &#x2022; &nbsp; </span>
            <span className="bg-yellow-400 text-black rounded-lg py-0 px-2 text-sm" > Submissions OPEN </span>
            <span className="text-gray-600" style={{ color: "#696969" }}>&nbsp; &#x2022; &nbsp; </span>
            <span className="text-white text-base font-extralight">11:34</span>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-gray-600 text-base font-normal font-inter py-2 w-0.25/12">#</th>
              <th className="text-gray-600 text-base font-normal font-inter text-left py-2 w-6.25/12">Title</th>
              <th className="text-gray-600 text-base font-normal font-inter py-2 w-3.5/12">Author</th>
              <th className="text-gray-600 text-base font-normal font-inter text-right py-2 pr-6 w-2/12	">
                Most Liked <span style={{ color: "#9BFF00", fontSize: "20px" }}> &nbsp; &darr; </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {videoInfo?.map((row, index) => (
              <DataRow key={row?.id} row={row} index={index} handleMoveRow={handleMoveRow} />
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleGoToPrevious}
            className="bg-yellow-400 rounded-full px-4 py-1  cursor-pointer"
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <button
            className="bg-gray-300 text-black font-bold text-lg rounded-full px-5 py-1 mx-3  cursor-pointer"
            disabled={currentPage === 1}
          >
            {currentPage}
          </button>
          <button
            onClick={handleGoToNext}
            className="bg-yellow-400 rounded-full px-4 py-1 cursor-pointer"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;


const DataRow = (props) => {
  const { row, index, handleMoveRow } = props || {};

  const [{ isDragging }, drag] = useDrag({
    type: "TABLE_ROW",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "TABLE_ROW",
    hover: (draggedRow) => {
      if (draggedRow.index !== index) {
        handleMoveRow(draggedRow.index, index);
        draggedRow.index = index;
      }
    },
  });

  return (
    <tr
      key={row?.id}
      className="border-1 border-yellow-100 border-solid mb-3 px-3 py-2"
      style={{ opacity: isDragging ? 0.5 : 1, border: "1px solid #E6FFBC" }}
      ref={(node) => drag(drop(node))}
    >
      <td className="w-0.25/12">
        <p className="text-gray-600 font-inter text-base font-normal py-2 px-6">
          {row?.id <= 9 ? (<>0{row.id}</>) : row?.id}
        </p>
      </td>
      <td className="w-6.25/12">
        <div className="flex items-center py-4 px-2">
          <img className="w-32 h-16 rounded-md" src={row?.photo} alt={row?.username} />
          <h5 className="text-gray-600 text-lg text-left font-inter font-normal py-2 px-4">{row?.title}</h5>
        </div>
      </td>
      <td className="w-3.5/12">
        <div className="flex items-center justify-center py-4 px-2">
          <img className="h-8 w-8 rounded-full mx-3" src={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXASVLg1zknZjrRDcPx_KwIHpGxfj4ksNsaQ&usqp=CAU`} alt={row?.username} />
          <h5 className="text-gray-600 text-center text-base font-inter font-normal py-2 px-2">
            {row?.username}
          </h5>
        </div>
      </td>
      <td className="w-2/12">
        <h5 className="text-gray-600 text-base text-center font-inter font-normal py-2 pr-6">
          {row?.like}<span className="text-yellow-400 text-lg"> &nbsp; &uarr; </span>
        </h5>
      </td>
    </tr>
  );
}