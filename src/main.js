import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteField,
  serverTimestamp
} from "firebase/firestore";

// ----- Elements -----
const header = document.querySelector("#app-header");
const whoamiEl = document.querySelector("#whoami");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const statusEl = document.querySelector("#status");
const studentListEl = document.querySelector("#student-list");
const chartTitleEl = document.querySelector("#chart-title");
const chartDateEl = document.querySelector("#chart-date");
const chartGridEl = document.querySelector("#chart-grid");
const chartTotalEl = document.querySelector("#chart-total");
const chartErrorEl = document.querySelector("#chart-error");

// Rating values stored in Firestore: 0 = sad, 1 = neutral, 2 = happy
const FACES = { 0: "😞", 1: "😐", 2: "😊" };
// Clicking a cell cycles: empty -> happy -> neutral -> sad -> empty
const NEXT_RATING = { none: 2, 2: 1, 1: 0, 0: "none" };

let currentUser = null;

// ===== Phase 4: view switching =====

function showView(name) {
  document.querySelectorAll(".view").forEach((section) => {
    section.hidden = section.id !== `view-${name}`;
  });
}

// Today's date as YYYY-MM-DD in the user's own time zone
function todayKey() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

// ----- Auth buttons -----
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

document.querySelector("#logout-btn").addEventListener("click", () => signOut(auth));
document.querySelector("#back-btn").addEventListener("click", () => loadTeacherHome());

// Runs on page load and every time the user logs in or out
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  header.hidden = !user;

  if (!user) {
    passwordInput.value = "";
    statusEl.textContent = "";
    showView("login");
    return;
  }

  whoamiEl.textContent = `Logged in as ${user.email}`;

  // Look up this user's role in users/{uid}
  try {
    const userSnap = await getDoc(doc(db, "users", user.uid));
    const role = userSnap.exists() ? userSnap.data().role : null;

    if (role === "teacher") {
      await loadTeacherHome();
    } else if (role === "parent") {
      showView("parent");
    } else {
      showView("norole");
    }
  } catch (err) {
    statusEl.textContent = `Couldn't load your account: ${err.message}`;
    showView("login");
  }
});

// ===== Phase 5: teacher home =====

async function loadTeacherHome() {
  showView("teacher");
  studentListEl.textContent = "Loading…";

  const q = query(
    collection(db, "students"),
    where("teacherIds", "array-contains", currentUser.uid)
  );
  const snap = await getDocs(q);

  studentListEl.textContent = "";
  if (snap.empty) {
    studentListEl.textContent = "No students yet.";
    return;
  }

  snap.forEach((studentDoc) => {
    const card = document.createElement("button");
    card.className = "student-card";
    card.textContent = studentDoc.data().name;
    card.addEventListener("click", () => openChart(studentDoc.id));
    studentListEl.appendChild(card);
  });
}

// ===== Phase 6: the chart grid =====

async function openChart(studentId) {
  showView("chart");
  chartErrorEl.textContent = "";
  chartGridEl.textContent = "Loading…";

  const studentSnap = await getDoc(doc(db, "students", studentId));
  const student = studentSnap.data();

  const dateKey = todayKey();
  const dayRef = doc(db, "students", studentId, "days", dateKey);
  const daySnap = await getDoc(dayRef);
  const day = daySnap.exists() ? daySnap.data() : {};

  chartTitleEl.textContent = student.name;
  chartDateEl.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric"
  });

  renderGrid({
    student,
    ratings: { ...(day.ratings || {}) },
    notes: { ...(day.notes || {}) },
    dayRef,
    editable: true
  });
}

function renderGrid({ student, ratings, notes, dayRef, editable }) {
  const table = document.createElement("table");
  table.className = "chart";

  // Header row: blank corner, one column per category, then Notes
  const headRow = table.createTHead().insertRow();
  headRow.appendChild(document.createElement("th"));
  student.categories.forEach((category) => {
    const th = document.createElement("th");
    th.textContent = category;
    headRow.appendChild(th);
  });
  const notesTh = document.createElement("th");
  notesTh.textContent = "Notes";
  headRow.appendChild(notesTh);

  // One row per period
  const body = table.createTBody();
  student.periods.forEach((period) => {
    const row = body.insertRow();
    const periodTh = document.createElement("th");
    periodTh.textContent = period;
    row.appendChild(periodTh);

    student.categories.forEach((category) => {
      const key = `${period}__${category}`;
      const cell = row.insertCell();
      const btn = document.createElement("button");
      btn.className = "cell";
      btn.textContent = FACES[ratings[key]] ?? "";
      btn.disabled = !editable;

      btn.addEventListener("click", async () => {
        const current = key in ratings ? ratings[key] : "none";
        const next = NEXT_RATING[current];

        // Update the screen right away, then save
        if (next === "none") delete ratings[key];
        else ratings[key] = next;
        btn.textContent = FACES[ratings[key]] ?? "";
        updateTotal(ratings);

        try {
          await setDoc(dayRef, {
            ratings: { [key]: next === "none" ? deleteField() : next },
            updatedBy: currentUser.uid,
            updatedAt: serverTimestamp()
          }, { merge: true });
          chartErrorEl.textContent = "";
        } catch (err) {
          chartErrorEl.textContent = `Couldn't save: ${err.message}`;
        }
      });

      cell.appendChild(btn);
    });

    // Notes for this period, saved when the input loses focus
    const notesCell = row.insertCell();
    const input = document.createElement("input");
    input.type = "text";
    input.className = "notes";
    input.value = notes[period] || "";
    input.disabled = !editable;
    input.addEventListener("blur", async () => {
      if (input.value === (notes[period] || "")) return; // nothing changed
      notes[period] = input.value;
      try {
        await setDoc(dayRef, {
          notes: { [period]: input.value },
          updatedBy: currentUser.uid,
          updatedAt: serverTimestamp()
        }, { merge: true });
        chartErrorEl.textContent = "";
      } catch (err) {
        chartErrorEl.textContent = `Couldn't save note: ${err.message}`;
      }
    });
    notesCell.appendChild(input);
  });

  chartGridEl.textContent = "";
  chartGridEl.appendChild(table);
  updateTotal(ratings);
}

function updateTotal(ratings) {
  const happy = Object.values(ratings).filter((r) => r === 2).length;
  chartTotalEl.textContent = `😊 Happy faces today: ${happy}`;
}
