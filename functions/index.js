const functions = require('firebase-functions');
const admin = require('firebase-admin');



admin.initializeApp();

//Makes a newly created user and moderator(only use when there are no moderators currently in the app)
// exports.makeAdminOnSignIn = functions.auth.user().onCreate((user) => {
//     console.log(`${user.displayName} has signed in for the first time and is becoming a moderator`);
//     return admin.auth().setCustomUserClaims(user.uid, {moderator: true, verified: true});
// });

// //Make user verified on first sign in
// exports.makeVerifiedOnSignIn = functions.auth.user().onCreate((user) => {
//     return admin.auth().setCustomUserClaims(user.uid, {verified: true});
// });

// // Used to check and see if firebase funcstion are working.
// exports.checkInitilization = functions.https.onCall((data, context) => {
//     // Check if backend server is connected
//     return {
//         result: 'connected'
//     }
// });

exports.sendNewReportNotification = functions.firestore.document('reports/{reportId}').onCreate( 
  (snap, context) => {
    // Get the list of device tokens.
    admin.firestore().collection('fcmTokens').get().then((allTokens) => {
        const tokens = [];
        allTokens.forEach((tokenDoc) => { tokens.push(tokenDoc.id); });
        if (tokens.length > 0) {
            const message = {
                notification: {
                  title: `Report Uploaded`,
                  body: `An issue has occured`,
                },
                tokens: tokens
              };

            // Send notifications to all tokens.
            admin.messaging().sendMulticast(message).then((batchResponse) => {
                cleanupTokens(batchResponse.responses, tokens).then(() => {
                    console.log('Notifications have been sent and tokens cleaned up.');
                }).catch((error) => {
                    console.log(error);
                })
            }).catch((err) => {
                console.log(err);
            });
          }
    }).catch((err) => {
        console.log(err);
    });
});

// Cleans up the tokens that are no longer valid.
function cleanupTokens(response, tokens) {
    // For each notification we check if there was an error.
    const tokensDelete = [];
    response.forEach((result, index) => {
      const error = result.error;
      if (error) {
        console.error('Failure sending notification to', tokens[index], error);
        // Cleanup the tokens who are not registered anymore.
        if (error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered') {
          const deleteTask = admin.firestore().collection('fcmTokens').doc(tokens[index]).delete();
          tokensDelete.push(deleteTask);
        }
      }
    });
    return Promise.all(tokensDelete);
   }

 exports.savePedningUser = functions.auth.user().onCreate((user) => {
    return admin.firestore().collection('pendingUsers').doc(user.uid).set({
        displayName: user.displayName,
        email: user.email,
        magistrialDistrict: 0
    });
 });


 exports.updateUserInfo = functions.https.onCall((data, context) => {
    if (context.auth.token.moderator !== true) {
        return {error: "Request not authorized. You must be a moderator to fulfill this request."};
    }
    return admin.auth().getUserByEmail(data.email).then((user) => {
        if (data.verification && data.verification === "moderator") {
            // Moderate User
            return addModerator(user).then((results) => {
                if (results.error) {
                    return results.error;
                } else {
                    return results.result;
                }
            });
        } else if (data.verification && data.verification === "verified") {
            // Verify User
            return addUser(user, data.magistrialDistrict).then((results) => {
                if (results.error) {
                    return results.error;
                } else {
                    return results.result;
                }
            });
        } else if (data.verification && data.verification === "unverified") {
            // Unverifiy User
            return removeUser(user).then((results) => {
                if (results.error) {
                    return results.error;
                } else {
                    return results.result;
                }
            });
        } else {
            return {error: "ERROR. Verification data was not found"}; 
        }
    }).catch((err) => {
        return {error: err.message, stack: err.stack};
    });

 });

 function addModerator(user) {
    if (user.customClaims && user.customClaims.moderator === true) {
        return {error: `${user.displayName} is already a moderator`};
    }
    return admin.auth().setCustomUserClaims(user.uid, {verified: true, moderator: true, allowNotifications: false}).then(() => {
        return admin.firestore().collection('pendingUsers').doc(user.uid).delete().then(() => {
                return  admin.firestore().collection('users').doc(user.uid).set({
                    displayName: user.displayName,
                    email: user.email,
                    magistrialDistrict: 'moderator'
                }).then(() => {
                    return {result: `${user.displayName} has successfully become a moderator`}
                }).catch((err) => {
                    return {error: err.message, stack: err.stack};
                });
            }).catch((err) => {
                return {error: err.message, stack: err.stack};
            });
        }).catch((err) => {
            return {error: err.message, stack: err.stack};
        });
}

function addUser(user, magistrial) {
    if (user.customClaims && user.customClaims.verifyed === true) {
        return {error: `${user.displayName} is already verified`};
    }
    return admin.auth().setCustomUserClaims(user.uid, {verified: true}).then(() => {
        return admin.firestore().collection('pendingUsers').doc(user.uid).delete().then(() => {
                return admin.firestore().collection('users').doc(user.uid).set({
                displayName: user.displayName,
                email: user.email,
                magistrialDistrict: magistrial
            }).then(() => {
                return{result: `${user.displayName} has succesfully become a verifed user`};
            }).catch((err) => {
                return {error: err.message, stack: err.stack};
            });
        }).catch((err) => {
            return {error: err.message, stack: err.stack};
        });
    }).catch((err) => {
        return {error: err.message, stack: err.stack};
    });
}

function removeUser(user) {
        if (user.customClaims && user.customClaims.verifyed === false) {
            return {error: `${user.displayName} is already unverified`};
        }
        return admin.auth().setCustomUserClaims(user.uid, { verified: false, moderator: false }).then(() => {
            return admin.firestore().collection('users').doc(user.uid).delete().then(() => {
                 return admin.firestore().collection('pendingUsers').doc(user.uid).set({
                    displayName: user.displayName,
                    email: user.email,
                    magistrialDistrict: 0
                }).then(() => {
                    return{result: true};
                }).catch((err) => {
                    return {error: err.message, stack: err.stack};
                });
            }).catch((err) => {
                return {error: err.message, stack: err.stack};
            });
        }).catch((err) => {
            return {error: err.message, stack: err.stack};
        });
}

exports.saveDeviceToken = functions.https.onCall((data, context) => {
    if (data && data.token) {
        admin.firestore().collection('fcmTokens').doc(data.token).set({
            id: context.auth.uid
        }).then(() => {
            console.log("FCM Token Saved");
            return {result: 'Successfully saved device token'};
        }).catch((err) => {
            console.log("Error FCM Token was not saved");
            return {error: err.message, stack: err.stack};
        })
    } else {
        return {error: "Improper data sent to function, no token was found"};
    }
});

exports.checkAllowNotifications = functions.https.onCall((data, context) => {
    if (context.auth.token.moderator !== true) {
        return {result: false};
    } else if (context.auth.token.allowNotifications == true) {
        return {result: true};
    } else {
        return {result: false};
    }
});

exports.toggleNotificationsOn = functions.https.onCall((data, context) => {
    if (context.auth.token.moderator !== true) {
        return {error: "You needs to be a moderator to get notifications"};
    } else if (context.auth.token.allowNotifications == true) {
        return {error: "allowNotifications already set to true"};
    }
    return admin.auth().setCustomUserClaims(context.auth.uid, {verified: true, moderator: true, allowNotifications: true}).then(() => {
        return {result: 'allowNotifications set to true'};
    }).catch((err) => {
        return {error: err.message, stack: err.stack};
    });
});

exports.toggleNotificationsOff = functions.https.onCall((data, context) => {
    if (context.auth.token.moderator !== true) {
        return {error: "You needs to be a moderator to get notifications"}
    } else if (context.auth.token.allowNotifications == false) {
        return {error: "allowNotifications already set to false"};
    }
    return admin.auth().setCustomUserClaims(context.auth.uid, {verified: true, moderator: true, allowNotifications: false}).then(() => {
        return {result: 'allowNotifications set to false'};
    }).catch((err) => {
        return {error: err.message, stack: err.stack};
    });
});