import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BlogList from "./pages/BlogList";
import AddEditBlog from "./pages/AddEditBlog";

function App() {
  return (
    <Routes>
      <Route path="/" element={<BlogList />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/add" element={<AddEditBlog />} />
      <Route path="/edit/:id" element={<AddEditBlog />} />
    </Routes>
  );
}

export default App;