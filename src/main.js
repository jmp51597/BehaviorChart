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

document.querySelector(".rating").addEventListener("click", (event) => {
  if (nameInput.value.trim() === "") {
    alert("Please enter a student name before rating.");
    return;
  }

  if (!event.target.classList.contains("face")) {
    return;
  }

  faceButtons.forEach((b) => b.classList.remove("selected"));
  event.target.classList.add("selected");

  const name = nameInput.value.trim();
  ratingOutput.textContent = `${name}: ${event.target.dataset.rating}`;
});


onAuthStateChanged(auth, (user) => {
  statusEl.textContent = user ? `Logged in as ${user.email}` : "Not logged in";
});

onAuthStateChanged(auth, (user) => {
  document.querySelector("#auth-page").hidden = !!user;
  document.querySelector("#rating-page").hidden = !user;

 
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

