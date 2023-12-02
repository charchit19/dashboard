import React, { useState, useEffect } from "react";
import "./Style.css";

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(0);

  const editRow = (userId) => {
    const userIndex = users.findIndex((user) => user.id === userId);
    const user = { ...users[userIndex] };
    const newName = prompt("Enter new name:", user.name);

    if (newName !== null) {
      user.name = newName;
      const updatedUsers = [...users];
      updatedUsers[userIndex] = user;
      setUsers(updatedUsers);
    }
  };

  const deleteRow = (index) => {
    const user = users[index];
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (confirmDelete) {
      const updatedUsers = [...users];
      updatedUsers.splice(index, 1);
      setUsers(updatedUsers);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    updatePagination();
  }, [users, currentPage, searchTerm]);

  const fetchData = async () => {
    const response = await fetch(
      "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
    );
    const fetchedUsers = await response.json();
    setUsers(fetchedUsers);

    // Calculate total pages dynamically based on the number of entries
    const totalEntries = fetchedUsers.length;
    setTotalPages(Math.ceil(totalEntries / pageSize));
  };

  const applySearchFilter = () => {
    const searchTermLowerCase = searchTerm.toLowerCase().trim();

    return users.filter(
      (user) =>
        user.id.toLowerCase().includes(searchTermLowerCase) ||
        user.name.toLowerCase().includes(searchTermLowerCase) ||
        user.email.toLowerCase().includes(searchTermLowerCase) ||
        user.role.toLowerCase().includes(searchTermLowerCase)
    );
  };

  const updatePagination = () => {
    const filteredUsersCount = applySearchFilter().length;

    // Calculate total pages dynamically based on the number of filtered entries
    setTotalPages(Math.ceil(filteredUsersCount / pageSize));

    const firstPageButton = document.querySelector(".first-page");
    const previousPageButton = document.querySelector(".previous-page");
    const nextPageButton = document.querySelector(".next-page");
    const lastPageButton = document.querySelector(".last-page");

    firstPageButton.disabled = currentPage === 1;
    previousPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
    lastPageButton.disabled = currentPage === totalPages;
  };

  const goToPage = (page) => {
    switch (page) {
      case "first-page":
        setCurrentPage(1);
        break;
      case "previous-page":
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
        break;
      case "next-page":
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
        break;
      case "last-page":
        setCurrentPage(totalPages);
        break;
      default:
        break;
    }
  };

  const selectAll = () => {
    const allSelected = applySearchFilter()
      .slice((currentPage - 1) * pageSize, currentPage * pageSize)
      .every((user) => user.selected);

    const updatedUsers = users.map((user) => ({
      ...user,
      selected: !allSelected,
    }));

    setUsers(updatedUsers);
  };

  const deselectAll = () => {
    const updatedUsers = users.map((user) => ({ ...user, selected: false }));
    setUsers(updatedUsers);
  };

  const deleteSelected = () => {
    const updatedUsers = users.filter((user) => !user.selected);
    setUsers(updatedUsers);
  };

  const toggleSelect = (userId) => {
    const userIndex = users.findIndex((user) => user.id === userId);
    const updatedUsers = [...users];
    updatedUsers[userIndex].selected = !updatedUsers[userIndex].selected;
    setUsers(updatedUsers);
  };

  const tableRows = applySearchFilter()
    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
    .map((user, i) => (
      <tr key={i} className={user.selected ? "selected-row" : ""}>
        <td>
          <input
            type="checkbox"
            checked={user.selected || false}
            onChange={() => toggleSelect(user.id)}
          />
        </td>
        <td>{user.id}</td>
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td>{user.role}</td>
        <td>
          <button onClick={() => editRow(user.id)} className="edit">
            <i className="bi bi-pencil-square"></i>
          </button>
          <button onClick={() => deleteRow(i)} className="delete">
            <i className="bi bi-trash-fill"></i>
          </button>
        </td>
      </tr>
    ));

  const renderPaginationButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      const isCurrentPage = i === currentPage;
      const buttonClass = isCurrentPage ? "current-page" : "";

      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={buttonClass}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="container">
      <div className="search-bar">
        <input
          type="text"
          id="searchInput"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-icon" onClick={updatePagination}>
          Search
        </button>
      </div>

      <table id="userTable">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={selectAll}
                checked={applySearchFilter()
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .every((user) => user.selected)}
              />
            </th>

            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{tableRows}</tbody>
      </table>

      <div className="pagination">
        <button onClick={() => goToPage("first-page")} className="first-page">
          <i className="bi bi-chevron-double-left"></i>
        </button>
        <button
          onClick={() => goToPage("previous-page")}
          className="previous-page"
        >
          <i className="bi bi-chevron-left"></i>
        </button>
        {renderPaginationButtons()}
        <button onClick={() => goToPage("next-page")} className="next-page">
          <i className="bi bi-chevron-right"></i>
        </button>
        <button onClick={() => goToPage("last-page")} className="last-page">
          <i className="bi bi-chevron-double-right"></i>
        </button>
      </div>

      <p>
        Page <span id="currentPage">{currentPage}</span> of {totalPages}
      </p>
      <div className="actions">
        <button onClick={selectAll}>Select All</button>
        <button onClick={deselectAll}>Deselect All</button>
        <button onClick={deleteSelected}>Delete Selected</button>
      </div>
    </div>
  );
}

export default Dashboard;
