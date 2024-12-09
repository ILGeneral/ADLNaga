import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDocs, addDoc, collection, deleteDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvYRzyCrazIHj2-KHZ8UXuXfP2tVPIIZk",
  authDomain: "practicegeneral-ab18c.firebaseapp.com",
  databaseURL: "https://practicegeneral-ab18c-default-rtdb.firebaseio.com",
  projectId: "practicegeneral-ab18c",
  storageBucket: "practicegeneral-ab18c.filestorage.app",
  messagingSenderId: "799394328558",
  appId: "1:799394328558:web:e72baf1faee2bcf14a68ff",
  measurementId: "G-1DMFZKG7WM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Get the current category path from the URL
let path = window.location.pathname; // Get the full pathname
if (!(path == "/" || path == "/homepage.html")) {
  path = path.split("/")[2].replace(".html", ""); // Extract the category
}

// Signup Handler
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("pass").value;
    const username = document.getElementById("username").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        createdAt: new Date().toISOString(),
      });

      alert(`Account created successfully for ${username}`);
      window.location.href = "login.html";
    } catch (error) {
      alert(`Signup failed: ${error.message}`);
    }
  });
}

// Login Handler
const loginForm = document.getElementById("login");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("pass").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      alert("Login successful!");
      window.location.href = "homepage.html";
    } catch (error) {
      alert(`Login failed: ${error.message}`);
    }
  });
}

// Add Post Form Rendering
try {
  const dynamicContainer = document.getElementById("dynamic-container");
  if (dynamicContainer) {
    dynamicContainer.innerHTML = `
      <div class="add-post-container">
        <form id="addPost">
          <textarea id="post-title" placeholder="Title" required></textarea>
          <textarea id="post-content" placeholder="Put post here..." required></textarea>
          <button class="submit-button">Post</button>
        </form>
      </div>
    `;
  }
} catch (err) {
  console.error("Error rendering the form:", err);
}

// Add Post to Firestore
try {
  const addPost = document.getElementById("addPost");
  addPost?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const postTitle = document.getElementById("post-title").value;
    const postContent = document.getElementById("post-content").value;

    const postsCollectionRef = collection(db, "Categories", path, "posts");
    const docRef = doc(postsCollectionRef);

    const data = {
      postTitle,
      postContent,
      createdAt: new Date(),
    };

    await setDoc(docRef, data);

    alert("Document successfully written with ID:", docRef.id);
    window.location.href = `${path}.html`;
  });
} catch (err) {
  console.log("Error in adding post");
}

// Fetch Posts and Comments from Firestore
try {
  const container = document.getElementById("postbox-container");

  if (container) {
    const postsCollectionRef = collection(db, "Categories", path, "posts");
    const querySnapshot = await getDocs(postsCollectionRef);

    if (querySnapshot.empty) {
      container.innerHTML = `<h2 style="color: white;">No post to show here</h2>`;
    } else {
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const postId = docSnap.id;

        container.innerHTML += `
          <div class="postbox" id="post-${postId}">
            <h3>${data.postTitle}</h3>
            <p>${data.postContent}</p>
            <button class="delete-btn" data-post-id="${postId}">X</button>
            <div class="comments-section" id="comments-${postId}">
              <h4>Comments:</h4>
              <div class="comments-container"></div>
              <form class="comment-form" data-post-id="${postId}">
                <textarea placeholder="Write a comment..." required></textarea>
                <button type="submit">Submit</button>
              </form>
            </div>
          </div>
        `;

        // Fetch and display comments for this post
        fetchComments(postId);
      });

      container.addEventListener("click", async (event) => {
        if (event.target.classList.contains("delete-btn")) {
          const postId = event.target.getAttribute("data-post-id");

          if (confirm("Are you sure you want to delete this post?")) {
            try {
              const postRef = doc(db, "Categories", path, "posts", postId);
              await deleteDoc(postRef);

              const postElement = document.getElementById(`post-${postId}`);
              postElement.remove();
            } catch (error) {
              console.error("Error deleting post:", error);
            }
          }
        }
      });

      container.addEventListener("submit", async (event) => {
        if (event.target.classList.contains("comment-form")) {
          event.preventDefault();

          const postId = event.target.getAttribute("data-post-id");
          const commentText = event.target.querySelector("textarea").value;

          try {
            const commentsRef = collection(db, "Categories", path, "posts", postId, "comments");
            const commentData = {
              text: commentText,
              createdAt: new Date(),
            };

            await addDoc(commentsRef, commentData);

            event.target.reset();
            fetchComments(postId);
          } catch (error) {
            console.error("Error adding comment:", error);
          }
        }
      });
    }
  }
} catch (error) {
  console.error("Error fetching posts:", error);
}

// Function to fetch and display comments for a specific post
async function fetchComments(postId) {
  const commentsContainer = document.querySelector(`#comments-${postId} .comments-container`);
  commentsContainer.innerHTML = "";

  try {
    const commentsRef = collection(db, "Categories", path, "posts", postId, "comments");
    const querySnapshot = await getDocs(commentsRef);

    if (querySnapshot.empty) {
      commentsContainer.innerHTML = "<p>No comments yet.</p>";
    } else {
      querySnapshot.forEach((docSnap) => {
        const comment = docSnap.data();
        commentsContainer.innerHTML += `
          <div class="comment">
            <p>${comment.text}</p>
            <small>${new Date(comment.createdAt.toDate()).toLocaleString()}</small>
          </div>
        `;
      });
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
  }
}
