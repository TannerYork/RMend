/**
*  Firebase Javascrips Code
*/

// Check if firebase is setup properly
export function checkSetup() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  } else {
      return true
  }
}

// Sign user into app
export function signIn() { 
  var provider = new firebase.auth.GoogleAuthProvider(); 
  firebase.auth().signInWithRedirect(provider); 
}

export function setupAuthUi() {
        var ui = new firebaseui.auth.AuthUI(firebase.auth());
        var uiConfig = {
            callbacks: {
                signInSuccessWithAuthResult: function(authResult, redirectUrl) {
                  return true;
                },
                uiShown: function() {
                  
                }
              },
            signInFlow: 'popup',
            signInOptions: [
              {
                provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                prompt: 'select_account'
              },
              {
               provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
               requireDisplayName: true
              }
            ],
          }
        ui.start('.firebaseui-auth-container', uiConfig);
}

// Sign user our of app
export function signOut() { firebase.auth().signOut(); }

// Get current users display name
export function getUserName() {
  return firebase.auth().currentUser.displayName;
}

// Get current user display img
export function getProfilePicUrl() {
  return firebase.auth().currentUser.photoURL || '/images/profile_image_dummy.svg';
}

// Moderate user from firebase functions
export function grantModeratorRole(email) {
  const addAdmin = firebase.functions().httpsCallable('addAdmin');
  addAdmin({email: email}).then((results) => {
    if (results && results.data.error !== undefined) {
      console.log(results.data);
    } else {
      console.log(results.data.result);
    }
  });
}

// Validate user from firebase functions
export async function validateUser(email) {
  const addUser = await firebase.functions().httpsCallable('addUser');
  await addUser({email: email}).then((results) => {
    if (results && results.data && results.data.error) {
      console.log(results.data);
    } else if(results && results.data && results.data.result) {
      console.log(results.data.result);
    }
  });
}

// Unvalidate user from firebase functions
export async function unvalidateUser(email) {
  const removeUser = await firebase.functions().httpsCallable('removeUser');
  await removeUser({email: email}).then((results) => {
    if (results && results.data && results.data.error) {
      console.log(results.data);
    } else if(results && results.data && results.data.result) {
      console.log(results.data.result);
    }
  });
}

// Save report data to firestore and storage
export async function saveReport(report) {
  // Create and format the current date 
 const date = new Date();
 const readableDate = date.toDateString();
  // Add a report with a loading image that then gets replaced with the real image.
   return firebase.firestore().collection("reports").add({
    sender: firebase.auth().currentUser.displayName,
    timestamp: readableDate,
    roadName: report.roadName,
    details: report.details,
    nearestStreet: report.nearestStreet,
    magistrialDistrict: report.magistrialDistrict,
    priority: report.priority
    }).then((messageRef) => {
        // Upload the image to Cloud Storage
        const filePath = 'reports/' + messageRef.id;
         return firebase.storage().ref(filePath).put(report.image).then(function(fileSnapshot) {
                // Generate a public URL for the file
              return fileSnapshot.ref.getDownloadURL().then((url) => {
                // Update the chat message placeholder with the real image
                 return messageRef.update({
                    id: messageRef.id,
                    imageUrl: url,
                    imageUri: fileSnapshot.metadata.fullPath
                    }).then(() => {
                      console.log(`New Report was added.`);
                      return {result: true};
                    }).catch((err) => {
                      return {error: err};
                    });
                }).catch((err) => {
                  return {error: err};
                });
            }).catch((err) => {
              return {error: err};
            });
    }).catch((err) => { return {error: err}; });
  }

  // Remove report item and image
  export function removeReportListItem(id) {
     firebase.firestore().collection('reports').doc(`${id}`).delete().then(() => {
       firebase.storage().ref('reports').child(`${id}`).delete().then(() => {
        console.log("Report was successfully removed");
      }).catch((err) => {
         console.log(err);
      });
    }).catch((err) => {
        console.log(err);
    });
  }

// Saves the messaging device token to the datastore.
export  async function saveMessagingDeviceToken() {
    firebase.messaging().getToken().then( async (currentToken) => {
      if (currentToken) {
        console.log('Got FCM device token:', currentToken);
        // Saving the Device Token to the datastore.
       const saveDeviceToken = await firebase.functions().httpsCallable('saveDeviceToken');
       return saveDeviceToken({token: currentToken}).then((results) => {
        if (results.error) {
          console.log(results.error);
        }
      });
     } else {
        // Need to request permissions to show notifications.
        requestNotificationsPermissions();
      }
    }).catch((error) => {
      console.error('Unable to get messaging token.', error);
    });
}

export function updateMessagingDeviceToken() {
  firebase.messaging().onTokenRefresh(() => {
      saveMessagingDeviceToken();
  });
};

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

export async function checkAllowNotifications() {
  firebase.functions().httpsCallable('checkAllowNotifications')().then((results) => {
    console.log(results);
    if (results.data.error) {
      console.log(results.data.error);
    } else {
      console.log(results.data.result);
      return results.data.result;
    }
  });
}

export async function toggleNotificationsOn() {
  const toggleNotifOn = await firebase.functions().httpsCallable('toggleNotificationsOn');
   await toggleNotifOn().then((results) => {
    if (results.error) {
      console.log(results.error);
    } else {
      console.log(results);
    }
  })
}

export async function toggleNotificationsOff() {
  const toggleNotifOff = await firebase.functions().httpsCallable('toggleNotificationsOff');
  toggleNotifOff().then((results) => {
    if (results.error) {
      console.log(results.error);
    } else {
      console.log(results);
    }
  })
}

export function getReport(id) {
  return firebase.firestore().collection('reports').doc(id).get().then(function(doc) {
    if (doc.exists) {
        return doc.data();
    } else {
      console.log(`Report with the ID ${id} does not exists`);
      return false;
    }
  });
}

export function updatePriority(id, value) {
  firebase.firestore().collection('reports').doc(id).update({priority: value}).then(() => {
  }).catch((err) => {
    console.log("Priority was not able to be changed");
  });
}