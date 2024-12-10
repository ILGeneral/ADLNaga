import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDocs, collection, deleteDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvYRzyCrazIHj2-KHZ8UXuXfP2tVPIIZk",
  authDomain: "practicegeneral-ab18c.firebaseapp.com",
  databaseURL: "https://practicegeneral-ab18c-default-rtdb.firebaseio.com",
  projectId: "practicegeneral-ab18c",
  storageBucket: "practicegeneral-ab18c.firebasestorage.app",
  messagingSenderId: "799394328558",
  appId: "1:799394328558:web:e72baf1faee2bcf14a68ff",
  measurementId: "G-1DMFZKG7WM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Get the current category path from the URL
let path = window.location.pathname; // Get the full pathname
console.log(path);
if (!(path == '/' || path == '/homepage.html')) {
  path = path.split('/')[2].replace('.html', ''); // Extract the category
  console.log(path);
}

console.log("Current Category Path:", path);

// Signup Handler
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('pass').value;
    const username = document.getElementById('username').value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        createdAt: new Date().toISOString()
      });

      alert(`Account created successfully for ${username}`);
      window.location.href = "login.html"; // Redirect to login page
    } catch (error) {
      alert(`Signup failed: ${error.message}`);
    }
  });
}

// Login Handler
const loginForm = document.getElementById('login');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('pass').value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Retrieve user details from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        alert(`Welcome back, ${userData.username}!`);
      } else {
        alert("Welcome back!");
      }
      window.location.href = "homepage.html"; // Redirect to homepage
    } catch (error) {
      alert(`Login failed: ${error.message}`);
    }
  });
}

// Add Post Form Rendering
try {
  const dynamicContainer = document.getElementById('dynamic-container');
  if (!dynamicContainer) {
    throw new Error("Dynamic container not found!");
  }

  const formHTML = `
    <div class="add-post-container">
      <form id="addPost">
        <textarea id="post-title" placeholder="Title" required></textarea>
        <textarea id="post-content" placeholder="Put post here..." required></textarea>
        <button class="submit-button">Post</button>
      </form>
    </div>
  `;

  dynamicContainer.innerHTML = formHTML;
} catch (err) {
  console.error("Error rendering the form:", err);
}

// Add Post to Firestore
try {
  const addPost = document.getElementById('addPost');
  addPost.addEventListener('submit', async (e) => {
    e.preventDefault();

    const postTitle = document.getElementById('post-title').value;
    const postContent = document.getElementById('post-content').value;

    const postsCollectionRef = collection(db, "Categories", path, "posts");
    const docRef = doc(postsCollectionRef);

    const data = {
      postTitle: postTitle,
      postContent: postContent,
      createdAt: new Date(),
    };
    await setDoc(docRef, data);

    alert("Document successfully written with ID:", docRef.id);
    window.location.href = `${path}.html`;
  });
} catch (err) {
  console.log("Error in adding post");
}

// Fetch Posts from Firestore and Add Delete Button
try {
  const container = document.getElementById('postbox-container');

  if (!container) {
    throw new Error("Container element not found!");
  }

  console.log('Fetching posts for category:', path, "posts");

  const postsCollectionRef = collection(db, 'Categories', path, 'posts');
  
  // Fetch all documents from the 'posts' collection
  const querySnapshot = await getDocs(postsCollectionRef);
  console.log('Fetched documents:', querySnapshot.size);

  if (querySnapshot.empty) {
    console.log("No posts found.");
    container.innerHTML += `<h2 style="color: white;">No post to show here</h2>`;
  } else {
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const postId = docSnap.id;

      console.log("Fetched post data:", data); // Log post data for each post

      // Add the post's HTML with the delete button
    function renderPost(data, postId) {
    const container = document.getElementById('postbox-container');
      container.innerHTML += `
        <div class="postbox" id="post-${postId}">
          <h3>${data.postTitle}</h3>
          <p>${data.postContent}</p>
          <button class="delete-btn" data-post-id="${postId}">X</button>
          <h4>Comments:</h4>
              <div class="comments-container" id="comments-container-${postId}"></div>
              <form class="comment-form" data-post-id="${postId}">
                  <textarea placeholder="Write a comment..." required></textarea>
                  <button type="submit">Submit</button>
              </form>
        </div>
      `;
      // Add event listener for the comment form
    const commentForm = document.querySelector(`.comment-form[data-post-id="${postId}"]`);
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const commentText = commentForm.querySelector('textarea').value;

        // Save comment to Firestore
        await setDoc(doc(db, 'Categories', path, 'posts', postId, 'comments', new Date().toISOString()), {
            text: commentText,
            createdAt: new Date(),
        });

      // Clear the textarea
        commentForm.querySelector('textarea').value = '';

        // Fetch and display comments
        displayComments(postId);
    });

    // Fetch and display existing comments
    displayComments(postId);
}

      async function displayComments(postId) {
    const commentsContainer = document.getElementById(`comments-container-${postId}`);
    commentsContainer.innerHTML = ''; // Clear existing comments

    const commentsCollectionRef = collection(db, 'Categories', path, 'posts', postId, 'comments');
    const querySnapshot = await getDocs(commentsCollectionRef);

    querySnapshot.forEach((doc) => {
        const commentData = doc.data();
        commentsContainer.innerHTML += `<p>${commentData.text}</p>`;
    });
  }

  // Event delegation for delete button click
  container.addEventListener("click", async (event) => {
    if (event.target && event.target.classList.contains("delete-btn")) {
      const postId = event.target.getAttribute("data-post-id");

      console.log("Delete button clicked for post ID:", postId); // Log when button is clicked

      if (confirm("Are you sure you want to delete this post?")) {
        console.log("User confirmed deletion"); // Log when user confirms

        try {
          const postRef = doc(db, "Categories", path, "posts", postId);
          console.log("Deleting post with reference:", postRef.path); // Log Firestore reference

          // Delete the document from Firestore
          await deleteDoc(postRef);
          console.log(`Post ${postId} deleted from Firestore`);

          // Remove the post from the DOM
          const postElement = document.getElementById(`post-${postId}`);
          postElement.remove();
          console.log(`Post ${postId} removed from DOM`); // Log DOM removal
        } catch (error) {
          console.error("Error deleting post:", error); // Log errors if the deletion fails
        }
      }
    }
  });

} catch (error) {
  console.error("Error fetching posts:", error);
}


// Fetch Categories for Homepage
try {
  const categoriesContainer = document.getElementById('categories');
  const docRef = collection(db, 'Categories');

  const querySnapshot = await getDocs(docRef);

  querySnapshot.forEach((e) => {
    const data = e.data();
    categoriesContainer.innerHTML += `
      <a style="text-decoration: none;" href='Categories/${data.subTitle}.html'>
        <div class='container_home'>
          <h3>${data.subTitle}</h3>
        </div>
      </a>
    `;
  });
} catch (err) {
  console.log("Error in categories:", err);
}

console.log("Finished loading scripts.");

const logoutButton = document.getElementById("logoutBtn"); // Ensure this button exists in your HTML
if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      await signOut(auth);
      alert("You have been logged out.");
      window.location.href = "index.html"; // Redirect to the login page after logout
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out. Please try again.");
    }
  });
}

// Listen for Auth State Changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is logged in:", user);
    // Show logout button or personalized UI
  } else {
    console.log("No user is logged in.");
    // Redirect to login page or show guest UI
  }
});

const commentForm = document.querySelector(`.comment-form[data-post-id="${postId}"]`);
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const commentText = commentForm.querySelector('textarea').value;

        // Save comment to Firestore
        await setDoc(doc(db, 'Categories', path, 'posts', postId, 'comments', new Date().toISOString()), {
            text: commentText,
            createdAt: new Date(),
        });

        // Clear the textarea
        commentForm.querySelector('textarea').value = '';

        // Fetch and display comments
        displayComments(postId);
    });

    // Fetch and display existing comments
    displayComments(postId);
}

async function displayComments(postId) {
    const commentsContainer = document.getElementById(`comments-container-${postId}`);
    commentsContainer.innerHTML = ''; // Clear existing comments

    const commentsCollectionRef = collection(db, 'Categories', path, 'posts', postId, 'comments');
    const querySnapshot = await getDocs(commentsCollectionRef);

    querySnapshot.forEach((doc) => {
        const commentData = doc.data();
        commentsContainer.innerHTML += `<p>${commentData.text}</p>`;
    });
}
