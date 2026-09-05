import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth";

const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const statusEl = document.querySelector("#status");

document.querySelector("#signup-btn").addEventListener("click", async () => {
  try {
    await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
  } catch (err) {
    statusEl.textContent = err.message;
  }
});

document.querySelector("#login-btn").addEventListener("click", async () => {
  try {
    await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
  } catch (err) {
    statusEl.textContent = err.message;
  }
});

onAuthStateChanged(auth, (user) => {
  statusEl.textContent = user ? `Logged in as ${user.email}` : "Not logged in";
});

const nameInput = document.querySelector("#student-name");
const faceButtons = document.querySelectorAll(".face");
const ratingOutput = document.querySelector("#rating-output");

faceButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    faceButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");

    const name = nameInput.value || "This student";
    ratingOutput.textContent = `${name}: ${btn.dataset.rating}`;
  });
});