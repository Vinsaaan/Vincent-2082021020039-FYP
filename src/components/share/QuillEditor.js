import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const QuillEditor = ({ value, setValue }) => {
  return <ReactQuill value={value} onChange={setValue} />;
};

export default QuillEditor;
