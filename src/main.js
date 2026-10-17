import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

// ----- Elements -----
const authPage = document.querySelector("#auth-page");
const ratingPage = document.querySelector("#rating-page");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const statusEl = document.querySelector("#status");
const nameInput = document.querySelector("#student-name");
const faceButtons = document.querySelectorAll(".face");
const ratingOutput = document.querySelector("#rating-output");
const whoamiEl = document.querySelector("#whoami");

// ----- Auth -----
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

document.querySelector("#logout-btn").addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (err) {
    statusEl.textContent = err.message;
  }
});

// Runs on page load and every time the user logs in or out
onAuthStateChanged(auth, (user) => {
  statusEl.textContent = "";
  whoamiEl.textContent = user ? `Logged in as ${user.email}` : "";
  authPage.hidden = !!user;
  ratingPage.hidden = !user;

  if (!user) {
    // Clear the form and the rating sketch so the next person starts fresh
    passwordInput.value = "";
    nameInput.value = "";
    ratingOutput.textContent = "";
    faceButtons.forEach((b) => b.classList.remove("selected"));
  }
});

// ----- Rating sketch (gets replaced by the real grid in Phase 6) -----
faceButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (name === "") {
      ratingOutput.textContent = "Please enter a student name before rating.";
      return;
    }

    faceButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    ratingOutput.textContent = `${name}: ${btn.dataset.rating}`;
  });
});
