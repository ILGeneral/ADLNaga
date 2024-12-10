const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const postId = urlParams.get('id');

if (postId) {
  const postRef = doc(db, "Categories", path, "posts", postId);
  getDoc(postRef).then((docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      document.getElementById('post-title').innerText = data.postTitle;
      document.getElementById('post-content').innerText = data.postContent;
    } else {
      console.error("No such document!");
    }
  }).catch((error) => {
    console.error("Error fetching post:", error);
  });
}
