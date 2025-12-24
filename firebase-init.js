// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBGwJX3Rei-5Fi3osScqT7ffASb-8s6GHc",
    authDomain: "semih-abi-berber.firebaseapp.com",
    projectId: "semih-abi-berber",
    storageBucket: "semih-abi-berber.firebasestorage.app",
    messagingSenderId: "697007247564",
    appId: "1:697007247564:web:6d6f12bcb863caea61b269",
    measurementId: "G-S39WTV8JVG"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();
