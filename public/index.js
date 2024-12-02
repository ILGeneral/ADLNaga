console.log(window.location.pathname);
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

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

let path = window.location.pathname; // Get the full pathname
console.log(path);
  if(!(path == '/' || path =='/homepage.html')){
    path = path.split('/')[2].replace('.html', ''); // Extract the category
    console.log(path);
  }
  console.log("HELLO", path);

  console.log("DSAOPDKASOPDKSA", path);

//INADD KO
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


try {

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


  } catch (err) {
    console.error(err);
  }
    //addposts


try {
  const dynamicContainer = document.getElementById('dynamic-container');

  if (!dynamicContainer) {
    throw new Error("Dynamic container not found!");
  }

  // Define the form HTML dynamically
  const formHTML = `
    <div class="add-post-container">
      <form id="addPost">
        <textarea id="post-title" placeholder="Title" required></textarea>
        <textarea id="post-content" placeholder="Put post here..." required></textarea>
        <button class="submit-button">Post</button>
      </form>
    </div>
  `;

  // Insert the form into the container
  dynamicContainer.innerHTML = formHTML;
} catch (err) {
  console.error("Error rendering the form:", err);
}
//end

try{
  const addPost = document.getElementById('addPost');

    addPost.addEventListener('submit', async (e)=>{
    e.preventDefault();

    const postTitle = document.getElementById('post-title').value;
    const postContent = document.getElementById('post-content').value;
    //DITO MAG AADD KA NA SA FIRESTORE

    const postsCollectionRef = collection(db, "Categories", path, "posts");
    const docRef = doc(postsCollectionRef); // Firestore will generate

    const data = {
      postTitle: postTitle,
      postContent: postContent,
      createdAt: new Date(),
      // postAuthor:
    }
    await setDoc(docRef, data);

        alert("Document successfully written with ID:", docRef.id);
        window.location.href=`${path}.html`;
    })
}catch(err){
    console.log("Error in adding post");
}

    //HANGGANG DITO INEDIT KO

//getting the data

try {
  const container = document.getElementById('postbox-container');

  // Debug: Check if container exists

  if (!container) {
    throw new Error("Container element not found!");
  }
  console.log('Categories', path, "posts");

  const postsCollectionRef = collection(db, 'Categories', path, "posts");

  try {
    // Fetch all documents from the 'posts' subcollection
    const querySnapshot = await getDocs(postsCollectionRef);
    console.log('Fetched documents:', querySnapshot.size);  // Log the number of documents
  
    // If no documents are found, handle it
    if (querySnapshot.empty) {
      console.log("No posts found.");
      container.innerHTML += `<h2>No post to show here</h2>`
    } else {
      // Iterate over the documents in the collection and log their data
      querySnapshot.forEach((e) => {
        console.log(e.id, " => ", e.data().postTitle);
      });

      querySnapshot.forEach(e => {
        const data = e.data();

        container.innerHTML += `
          <div class="postbox">
            <h3>${data.postTitle}</h3>
            <p>${data.postContent}</p>
    
          </div>
        `;
      });
    
    }
  } catch (err) {
    console.error("Error fetching posts: ", err);
  }



} catch (err) {
  console.error("ERROR IN POSTING:", err);
}


//post Categories
try{
  const categoriesContainer = document.getElementById('categories');

  const docRef = collection(db, 'Categories');

  const querySnapshot = await getDocs(docRef);

  querySnapshot.forEach(e => {
    console.log("DSADASDSA", e.data());
    const data = e.data();
    categoriesContainer.innerHTML += `
    <a style="text-decoration: none;"href='Categories/${data.subTitle}.html'>
    <div class='container_home'>
        <h3>${data.subTitle} </h3>
    </div>
    </a>
  `;

  });


}catch(err){
  console.log("Errror in categories: ", err);
}
console.log("HIIi");
console.log("HIIi");
