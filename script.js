// ============================================
// Jaxson Jennings - Portfolio Script
// One shared JS file for every page. Each feature checks
// whether its elements exist before running.
// ============================================

// ---------- 1. Dark / Light Mode ----------
const themeToggle = document.querySelector("#themeToggle");

// Load the saved theme (if there is one)
function loadTheme() {
  let savedTheme = "light";
  try {
    savedTheme = localStorage.getItem("theme") || "light";
  } catch (error) {
    // localStorage can be blocked in some browsers, so just use light mode
  }
  setTheme(savedTheme);
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  if (themeToggle) {
    // swap the icon: moon in light mode, sun in dark mode
    themeToggle.innerHTML = theme === "dark"
      ? '<i class="bi bi-sun-fill"></i>'
      : '<i class="bi bi-moon-stars-fill"></i>';
  }

  try {
    localStorage.setItem("theme", theme);
  } catch (error) {
    // ignore
  }
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "light" : "dark");
  });
}

loadTheme();


// ---------- 2. Greeting based on time of day (Home page) ----------
const greeting = document.querySelector("#greeting");

if (greeting) {
  const hour = new Date().getHours();
  let message = "";

  if (hour < 12) {
    message = "Good morning.";
  } else if (hour < 17) {
    message = "Good afternoon.";
  } else {
    message = "Good evening.";
  }

  greeting.textContent = message;
}


// ---------- 3. Back to Top Button (all pages) ----------
const backToTop = document.querySelector("#backToTop");

if (backToTop) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTop.style.display = "block";
    } else {
      backToTop.style.display = "none";
    }
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}


// ---------- 4. Footer year ----------
const yearSpan = document.querySelector("#year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}


// ---------- 5. Projects Page: fetch JSON, build cards, filter, search ----------
const projectGrid = document.querySelector("#project-grid");
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.querySelector("#projectSearch");
const projectCount = document.querySelector("#projectCount");

let allProjects = [];        // every project from the JSON file
let currentCategory = "All"; // which filter button is selected

// Load the projects from the JSON file
async function loadProjects() {
  try {
    const response = await fetch("data/projects.json");

    if (!response.ok) {
      throw new Error("Could not load projects.json");
    }

    // .json() converts the JSON text into JavaScript objects
    allProjects = await response.json();
    applyFilters();
  } catch (error) {
    console.error(error);
    projectGrid.innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning">
          Projects couldn't load. Make sure you're running the site through
          Live Server (http://...) and not opening the file directly (file://).
        </div>
      </div>`;
  }
}

// Build a Bootstrap card for every project in the list
function displayProjects(projects) {
  projectGrid.innerHTML = "";

  if (projects.length === 0) {
    projectGrid.innerHTML = `
      <div class="col-12 text-center text-muted-custom py-5">
        <i class="bi bi-search fs-1"></i>
        <p class="mt-2">No projects match that search.</p>
      </div>`;
  }

  projects.forEach((project) => {
    // pick a badge color based on the status
    let statusClass = "status-complete";
    if (project.status === "In Progress") statusClass = "status-progress";
    if (project.status === "Planned") statusClass = "status-planned";

    // turn the technologies array into badges
    const techBadges = project.technologies
      .map((tech) => `<span class="badge tech-badge">${tech}</span>`)
      .join("");

    const column = document.createElement("div");
    column.classList.add("col-md-6", "col-lg-4");

    column.innerHTML = `
      <div class="card card-custom project-card h-100">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="category-label">${project.category}</span>
            <span class="badge status-badge ${statusClass}">${project.status}</span>
          </div>
          <h5 class="card-title">${project.title}</h5>
          <p class="card-text text-muted-custom">${project.description}</p>
          <div class="mb-3">${techBadges}</div>
          <button class="btn btn-outline-crimson btn-sm mt-auto details-btn">
            View Details
          </button>
        </div>
      </div>`;

    // when "View Details" is clicked, open the modal for this project
    column.querySelector(".details-btn").addEventListener("click", () => {
      showProjectModal(project);
    });

    projectGrid.appendChild(column);
  });

  if (projectCount) {
    projectCount.textContent = `Showing ${projects.length} of ${allProjects.length} projects`;
  }
}

// Combine the category filter AND the search box
function applyFilters() {
  const searchText = searchInput ? searchInput.value.toLowerCase().trim() : "";

  const filtered = allProjects.filter((project) => {
    const matchesCategory =
      currentCategory === "All" || project.category === currentCategory;

    // search the title, description, and technologies
    const searchableText = (
      project.title + " " +
      project.description + " " +
      project.technologies.join(" ")
    ).toLowerCase();

    const matchesSearch = searchableText.includes(searchText);

    return matchesCategory && matchesSearch;
  });

  displayProjects(filtered);
}

// Fill in the Bootstrap modal with one project's info and show it
function showProjectModal(project) {
  document.querySelector("#modalTitle").textContent = project.title;
  document.querySelector("#modalCategory").textContent = project.category;
  document.querySelector("#modalDetails").textContent = project.details;
  document.querySelector("#modalTech").innerHTML = project.technologies
    .map((tech) => `<span class="badge tech-badge">${tech}</span>`)
    .join("");

  const linkArea = document.querySelector("#modalLink");
  if (project.link) {
    linkArea.innerHTML = `<a href="${project.link}" target="_blank" class="btn btn-crimson">
      <i class="bi bi-github"></i> View on GitHub</a>`;
  } else {
    linkArea.innerHTML = `<small class="text-muted-custom">Code link coming soon.</small>`;
  }

  const modal = new bootstrap.Modal(document.querySelector("#projectModal"));
  modal.show();
}

// Only run the project code on the Projects page
if (projectGrid) {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // move the "active" style to the clicked button
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      currentCategory = button.dataset.category;
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  loadProjects();
}
