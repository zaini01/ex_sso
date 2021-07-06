import React from "react";

export default function Spinner() {
  return (
    <div className="d-flex justify-content-center p-5 m-5">
      <div
        className="spinner-border"
        style={{ width: 115, height: 115, color: "lightblue" }}
        role="status"
      ></div>
    </div>
  );
}
