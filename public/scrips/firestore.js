import { elements } from '/scrips/views/base.js';

/**
*  Firebase Javascrips Code
*/

// Signs-in RMend
export const signIn = () => {
  // Sign into Firebase using popup auth & Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider);
}

// Signs-out of Rmend
export const signOut = () => {
  // Sign out of Firebase.
  firebase.auth().signOut();
}

// Initiate firebase auth.
export const initFirebaseAuth = () => {
  // Listen to auth state changes.
  firebase.auth().onAuthStateChanged(authStateObserver);
}

// Returns the signed-in user's display name.
export const getUserName = () => {
  return firebase.auth().currentUser.displayName;
}

// Returns true if a user is signed-in.
export const isUserSignedIn = () => {
  return !!firebase.auth().currentUser;
}

// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
  if (user) { // User is signed in!
    console.log('Users is signed in');
    // Load the report/report list container and loading image
    elements.page.innerHTML = "";
    elements.page.insertAdjacentHTML('afterbegin', elements.reportsPage);

    elements.navLogin.setAttribute('hidden', true);
    elements.navLogout.removeAttribute('hidden');


    
  } else { // User is signed out!
    console.log('User is signed out')
    // Clear the current unsaved data/properties and return them to the home page 
    // while (elements.page.firstChild) elements.page.removeChild(elements.page.firstChild);
    elements.page.innerHTML = "";
    elements.page.insertAdjacentHTML('afterbegin', elements.loginPage);

    elements.navLogout.setAttribute('hidden', true);
    elements.navLogin.removeAttribute('hidden');

  }
}

export const checkUserStatus = () => {
  //Checks if user is an admin or not.
}

export const saveReport = (report) => {
  // 1. Add a report with a loading image that then gets replaced with the real image.
  if (isUserSignedIn()) {
    firebase.firestore().collection('reports').add({
      imageURL: 'https://www.google.com/images/spin-32.gif?a',
      sender: getUserName(),
      location: report.location,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      details: report.details
    }).then((messageRef) => {
      // 2. Update Upload the image to Cloud Storage
       const filePath = `reports/${messageRef.id}/${report.img.name}`
       return firebase.storage().ref(filePath).put(report.img).then((fileSnapshot) => {
          // 3. Generate a public URL for the file
          return fileSnapshot.ref.getDownloadURL().then((url) => {
           // 4. Update the chat message placeholder with the real image
           return messageRef.update({
             imageUrl: url,
             imageUri: fileSnapshot.metadata.fullPath
          })
        })
      });
    });
  }
}

export const removeReportListItem = (id) => {
  //Removes an item from the reports list firestore database
  firebase.firestore().collection('reports').doc(`${id}`).delete();
}

export const addReportListListener = () => {
  //Watches for changes in the reports list database object and updates ui
}

// Saves the messaging device token to the datastore.
function saveMessagingDeviceToken() {
  firebase.messaging().getToken().then((currentToken) => {
    if (currentToken) {
      console.log('Got FCM device token:', currentToken);
      // Saving the Device Token to the datastore.
      firebase.firestore().collection('fcmTokens').doc(currentToken)
          .set({uid: firebase.auth().currentUser.uid});
    } else {
      // Need to request permissions to show notifications.
      requestNotificationsPermissions();
    }
  }).catch(function(error){
    console.error('Unable to get messaging token.', error);
  });
}

// Requests permission to show notifications.
function requestNotificationsPermissions() {
  console.log('Requesting notifications permission...');
  firebase.messaging().requestPermission().then(() => {
    // Notification permission granted.
    saveMessagingDeviceToken();
  }).catch((error) => {
    console.error('Unable to get permission to notify.', error);
  });
}