import firebase from 'firebase';
import 'firebase/firestore';

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyAOXa2fHPeYj-NS64l2I_WDtfxTzRz5fgY",
  authDomain: "crud-e6314.firebaseapp.com",
  projectId: "crud-e6314",
  storageBucket: "crud-e6314.appspot.com",
  messagingSenderId: "677677908944",
  appId: "1:677677908944:web:58646ba51fcd8d01672fd5"
};

// Inicializa o Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

export {
    firebase as default,
    db,
}