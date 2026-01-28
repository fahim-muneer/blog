import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const blogsCollection = collection(db, "blogs");
      const blogsSnapshot = await getDocs(blogsCollection);
      const blogsList = blogsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBlogs(blogsList.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault(); // Prevent navigation when clicking delete
    e.stopPropagation(); // Stop event bubbling
    
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        await deleteDoc(doc(db, "blogs", id));
        setBlogs(blogs.filter((blog) => blog.id !== id));
      } catch (error) {
        console.error("Error deleting blog:", error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Recently";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="navbar-brand">
            Fahim Blogs
          </Link>
          <div className="navbar-menu">
            {currentUser ? (
              <>
                <div className="user-badge">
                  <div className="user-avatar">
                    {currentUser.email[0].toUpperCase()}
                  </div>
                  <span>{currentUser.email}</span>
                </div>
                <Link to="/add" className="btn btn-small">
                  New Post
                </Link>
                <button onClick={handleLogout} className="btn btn-secondary btn-small">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="btn btn-small">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Latest Blog Posts</h1>
        </div>

        {blogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h2 className="empty-state-title">No posts yet</h2>
            <p className="empty-state-text">
              Be the first to share your thoughts!
            </p>
            {currentUser && (
              <Link to="/add" className="btn">
                Create Your First Post
              </Link>
            )}
          </div>
        ) : (
          <div className="blog-grid">
            {blogs.map((blog) => (
              <Link 
                key={blog.id} 
                to={`/blog/${blog.id}`}
                className="blog-card fade-in"
                style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
              >
                {blog.imageUrl && (
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="blog-card-image"
                  />
                )}
                {!blog.imageUrl && (
                  <div className="blog-card-image"></div>
                )}
                
                <div className="blog-card-content">
                  <h2 className="blog-card-title">{blog.title}</h2>
                  <p className="blog-card-excerpt">
                    {blog.content?.substring(0, 150)}
                    {blog.content?.length > 150 ? "..." : ""}
                  </p>
                  
                  <div className="blog-card-meta">
                    <div className="blog-card-author">
                      <div className="user-avatar" style={{ width: "24px", height: "24px", fontSize: "0.75rem" }}>
                        {blog.authorEmail?.[0]?.toUpperCase() || "A"}
                      </div>
                      <span>{blog.authorEmail?.split("@")[0] || "Anonymous"}</span>
                    </div>
                    <span className="blog-card-date">
                      {formatDate(blog.createdAt)}
                    </span>
                  </div>
                </div>

                {currentUser && currentUser.email === blog.authorEmail && (
                  <div className="blog-card-actions">
                    <Link
                      to={`/edit/${blog.id}`}
                      className="btn btn-secondary btn-small"
                      style={{ flex: 1 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                       Edit
                    </Link>
                    <button
                      onClick={(e) => handleDelete(e, blog.id)}
                      className="btn btn-danger btn-small"
                      style={{ flex: 1 }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}