import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

export default function BlogDetail() {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const blogDoc = await getDoc(doc(db, "blogs", id));
      if (blogDoc.exists()) {
        setBlog({ id: blogDoc.id, ...blogDoc.data() });
      } else {
        setError("Blog post not found");
      }
    } catch (err) {
      console.error("Error fetching blog:", err);
      setError("Failed to load blog post");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        await deleteDoc(doc(db, "blogs", id));
        navigate("/");
      } catch (error) {
        console.error("Error deleting blog:", error);
        alert("Failed to delete blog post");
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div>
        <nav className="navbar">
          <div className="container">
            <Link to="/" className="navbar-brand">
             Fahim Blog
            </Link>
          </div>
        </nav>
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">❌</div>
            <h2 className="empty-state-title">{error || "Blog Not Found"}</h2>
            <Link to="/" className="btn">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAuthor = currentUser && currentUser.email === blog.authorEmail;

  return (
    <div>
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="navbar-brand">
          Fahim Blog
          </Link>
          <div className="navbar-menu">
            <Link to="/" className="nav-link">
              ← All Posts
            </Link>
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
        <div className="blog-detail fade-in">
          <div className="blog-detail-header">
            <h1 className="blog-detail-title">{blog.title}</h1>
            
            <div className="blog-detail-meta">
              <div className="blog-card-author">
                <div className="user-avatar" style={{ width: "40px", height: "40px" }}>
                  {blog.authorEmail?.[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                    {blog.authorEmail?.split("@")[0] || "Anonymous"}
                  </div>
                  <div style={{ fontSize: "0.875rem" }}>
                    {formatDate(blog.createdAt)}
                  </div>
                </div>
              </div>

              {isAuthor && (
                <div className="flex gap-2">
                  <Link to={`/edit/${blog.id}`} className="btn btn-secondary btn-small">
                    Edit
                  </Link>
                  <button onClick={handleDelete} className="btn btn-danger btn-small">
                   Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {blog.imageUrl && (
            <img
              src={blog.imageUrl}
              alt={blog.title}
              style={{
                width: "100%",
                maxHeight: "500px",
                objectFit: "cover",
                borderRadius: "1rem",
                marginBottom: "2rem",
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}

          <div className="blog-detail-content">
            {blog.content.split('\n').map((paragraph, index) => (
              paragraph.trim() && <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div style={{ 
            marginTop: "3rem", 
            paddingTop: "2rem", 
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem"
          }}>
            <Link to="/" className="btn btn-outline">
              ← Back to All Posts
            </Link>
            
            {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
              <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                Last updated: {formatDate(blog.updatedAt)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}