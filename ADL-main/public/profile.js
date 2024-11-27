const firebaseConfig = {
    apiKey: "AIzaSyAvYRzyCrazIHj2-KHZ8UXuXfP2tVPIIZk",
    authDomain: "practicegeneral-ab18c.firebaseapp.com",
    projectId: "practicegeneral-ab18c",
    storageBucket: "practicegeneral-ab18c.appspot.com",
    messagingSenderId: "799394328558",
    appId: "1:799394328558:web:e72baf1faee2bcf14a68ff",
    measurementId: "G-1DMFZKG7WM"
};

db.collection('users').doc('userId').get().then((doc) => {
    if (doc.exists) {
      const userData = doc.data();
      console.log(userData);
    } else {
      console.log('No such document!');
    }
  }).catch((error) => {
    console.error('Error fetching document:', error);
  });

  function loadProfileData() {
    const userId = 'currentUserId'; 
    db.collection('users').doc(userId).get().then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        const name = userData.name;
        const bio = userData.bio;
        const achievements = userData.achievements;
  
        const nameContainer = document.getElementById("profile-name");
        nameContainer.innerHTML = name;
  
        const bioContainer = document.getElementById("bio-list");
        bioContainer.innerHTML = `<li>${bio.replace(/\n/g, "<br>")}</li>`;
  
        const achievementContainer = document.getElementById("achievement-list");
        achievements.forEach((achievement) => {
          const achievementItem = document.createElement("li");
          achievementItem.textContent = achievement;
  
          const deleteButton = document.createElement("button");
          deleteButton.textContent = "Delete";
          deleteButton.classList.add("delete-button");
          deleteButton.onclick = function () {
            achievementContainer.removeChild(achievementItem);
            saveAchievements();
          };
  
          achievementItem.appendChild(deleteButton);
          achievementContainer.appendChild(achievementItem);
        });
      } else {
        console.log('No such document!');
      }
    }).catch((error) => {
      console.error('Error fetching document:', error);
    });
  }