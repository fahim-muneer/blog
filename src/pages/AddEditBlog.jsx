import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

export default function AddEditBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (isEditMode) {
      fetchBlog();
    }
  }, [currentUser, id]);

  const fetchBlog = async () => {
    try {
      const blogDoc = await getDoc(doc(db, "blogs", id));
      if (blogDoc.exists()) {
        const blogData = blogDoc.data();
        
        // Check if current user is the author
        if (blogData.authorEmail !== currentUser.email) {
          setError("You don't have permission to edit this blog");
          setTimeout(() => navigate("/"), 2000);
          return;
        }

        setTitle(blogData.title);
        setContent(blogData.content);
        setImageUrl(blogData.imageUrl || "");
      } else {
        setError("Blog not found");
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err) {
      console.error("Error fetching blog:", err);
      setError("Failed to load blog");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setLoading(true);

    try {
      const blogData = {
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim(),
        authorEmail: currentUser.email,
        updatedAt: serverTimestamp(),
      };

      if (isEditMode) {
        await updateDoc(doc(db, "blogs", id), blogData);
        setSuccess("Blog updated successfully!");
      } else {
        await addDoc(collection(db, "blogs"), {
          ...blogData,
          createdAt: serverTimestamp(),
        });
        setSuccess("Blog created successfully!");
      }

      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error("Error saving blog:", err);
      setError("Failed to save blog. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="navbar-brand">
            📝 My Blog
          </Link>
          <div className="navbar-menu">
            <Link to="/" className="nav-link">
              ← Back to Posts
            </Link>
          </div>
        </div>
      </nav>

      {/* Form */}
      <div className="container-small">
        <div className="form-container">
          <h1 className="form-title">
            {isEditMode ? "Edit Blog Post" : "Create New Post"}
          </h1>
          <p className="form-subtitle">
            {isEditMode
              ? "Update your blog post"
              : "Share your thoughts with the world"}
          </p>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                id="title"
                type="text"
                placeholder="Enter an engaging title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="imageUrl">Image URL (optional)</label>
              <input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
            </div>

            <div className="form-group">
              <label htmlFor="content">Content *</label>
              <textarea
                id="content"
                placeholder="Write your blog content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                style={{ minHeight: "300px" }}
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={loading} style={{ flex: 1 }}>
                {loading
                  ? "Saving..."
                  : isEditMode
                  ? "Update Post"
                  : "Publish Post"}
              </button>
              <Link
                to="/"
                className="btn btn-secondary"
                style={{ flex: 1, textAlign: "center" }}
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}