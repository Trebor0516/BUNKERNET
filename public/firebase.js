import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {

    apiKey: "AIzaSyCAY-DfecKMiv3S_sOefx7wj44vykktpUc",

    authDomain: "bunkernet-507ad.firebaseapp.com",

    projectId: "bunkernet-507ad",

    storageBucket: "bunkernet-507ad.firebasestorage.app",

    messagingSenderId: "153333768955",

    appId: "1:153333768955:web:8ca609340ba2b28f17465e"

};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

signInWithPopup(auth, provider)

.then((result) => {

    const user = result.user;

    localStorage.setItem('username', user.displayName);

    document.getElementById('username').value = user.displayName;

})

.catch((error) => {

    console.log(error);

});