$(document).ready(function () {
    console.log("HostNode JS ready");
    const THEME_KEY = "hostnode_theme";

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-bs-theme", theme);
        localStorage.setItem(THEME_KEY, theme);

        const btn = $("#themeToggle");
        if (btn.length) {
            btn.text(theme === "dark" ? "Light" : "Dark");
        }
    }

    const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
    applyTheme(savedTheme);

    $(document).on("click", "#themeToggle", function () {
        const current = document.documentElement.getAttribute("data-bs-theme");
        applyTheme(current === "dark" ? "light" : "dark");
    });

    const USER_KEY = "hostnode_user";
    const LOGGED_KEY = "hostnode_logged";

    function getUser() {
        try {
            return JSON.parse(localStorage.getItem(USER_KEY)) || null;
        } catch (e) {
            return null;
        }
    }

    function isLoggedIn() {
        return localStorage.getItem(LOGGED_KEY) === "true" && getUser();
    }

    function updateNavAuth() {
        const $authArea = $("#authNav");
        if (!$authArea.length) return;
        const path = window.location.pathname;
        const isProfilePage = path.includes("profile.html");
        const isLoginPage = path.includes("login.html");
        const isSignupPage = path.includes("signup.html");

        if (isLoggedIn()) {
            let navAva = localStorage.getItem("hostnode_avatar");
            if (!navAva) {
                const avatars = ["ava1.png", "ava2.png", "ava3.png", "ava4.png"];
                navAva = avatars[Math.floor(Math.random() * avatars.length)];
                localStorage.setItem("hostnode_avatar", navAva);
            }
            const activeBorder = isProfilePage ? "border border-warning border-2" : "";
            $authArea.html(`
                <li class="nav-item">
                    <a href="profile.html" title="Profile">
                        <img src="images/${navAva}" alt="Profile" class="rounded-circle ${activeBorder}" style="width: 32px; height: 32px; object-fit: cover;">
                    </a>
                </li>
                <li class="nav-item"><button id="logoutBtn" class="btn btn-outline-warning btn-sm">Logout</button></li>
            `);
        } else {
            const loginClass = isLoginPage ? "active fw-bold text-gold" : "text-light";
            const signupClass = isSignupPage ? "active fw-bold text-gold" : "text-light";
            $authArea.html(`
                <li class="nav-item"><a class="nav-link ${loginClass}" href="login.html">Login</a></li>
                <li class="nav-item"><a class="nav-link ${signupClass}" href="signup.html">Sign Up</a></li>
            `);
        }
    }
    updateNavAuth();

    $(document).on("click", "#logoutBtn, .logout-btn", function () {
        playClickSound();
        localStorage.removeItem(LOGGED_KEY);
        updateNavAuth();
        window.location.href = "index.html";
    });

    if (window.location.pathname.includes("profile.html") && !isLoggedIn()) {
        window.location.href = "login.html";
    }

    const normalSound = new Audio("audio/click.wav");
    const secretSound = new Audio("audio/click1.mp3");
    normalSound.preload = "auto";
    secretSound.preload = "auto";

    function playClickSound() {
        try {
            if (Math.random() < 0.1) {
                normalSound.pause();
                secretSound.currentTime = 0;
                secretSound.play().catch(() => {});
            } else {
                secretSound.pause();
                normalSound.currentTime = 0;
                normalSound.play().catch(() => {});
            }
        } catch (e) {}
    }

    function showToast(message) {
        let $toast = $("#toastNotification");
        if ($toast.length === 0) {
            $toast = $('<div id="toastNotification" class="custom-toast"></div>').appendTo("body");
        }
        $toast.text(message).stop(true, true).fadeIn(300).delay(2500).fadeOut(400);
    }

    const pluginDatabase = ["EssentialsX", "LuckPerms", "WorldEdit"];
    const SEARCH_KEY = "hostnode_last_search";

    function filterPlugins(query, showSuggestions) {
        const lowerQuery = query.toLowerCase();
        localStorage.setItem(SEARCH_KEY, query);
        let visibleCount = 0;

        $(".plugin-card").each(function () {
            const $card = $(this);
            const $title = $card.find(".card-title");
            if (!$title.data("original-text")) {
                $title.data("original-text", $title.text());
            }
            const originalText = $title.data("original-text");

            if (lowerQuery === "") {
                $card.show();
                $title.text(originalText);
                visibleCount++;
            } else if (originalText.toLowerCase().includes(lowerQuery)) {
                $card.show();
                visibleCount++;
                const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                const regex = new RegExp("(" + safe + ")", "gi");
                $title.html(originalText.replace(regex, '<span class="search-highlight">$1</span>'));
            } else {
                $card.hide();
            }
        });

        $("#noResults").toggle(visibleCount === 0);

        const $suggestions = $("#searchSuggestions").empty();
        if (showSuggestions && query.length > 0) {
            const matches = pluginDatabase.filter(item => item.toLowerCase().includes(lowerQuery));
            if (matches.length > 0) {
                matches.forEach(item => {
                    $suggestions.append('<div class="list-group-item list-group-item-action suggestion-item">' + item + "</div>");
                });
                $suggestions.fadeIn(150);
                return;
            }
        }
        $suggestions.hide();
    }

    $("#pluginSearch").on("input keyup", function () {
        filterPlugins($(this).val().trim(), true);
    });

    const lastSearch = localStorage.getItem(SEARCH_KEY);
    if (lastSearch && $("#pluginSearch").length) {
        $("#pluginSearch").val(lastSearch);
        filterPlugins(lastSearch, false);
    }

    $("#clearSearchBtn").on("click", function () {
        playClickSound();
        $("#pluginSearch").val("");
        filterPlugins("", false);
    });

    $(document).on("click", ".suggestion-item", function () {
        $("#pluginSearch").val($(this).text());
        filterPlugins($(this).text(), false);
    });

    $(document).on("click", function (e) {
        if (!$(e.target).closest("#pluginSearch, #searchSuggestions").length) {
            $("#searchSuggestions").hide();
        }
    });

    const SAVED_KEY = "hostnode_saved_plugins";
    function getSavedPlugins() {
        try {
            const data = JSON.parse(localStorage.getItem(SAVED_KEY));
            return Array.isArray(data) ? data.filter(p => p && typeof p.name === "string") : [];
        } catch (e) {
            return [];
        }
    }
    function setSavedPlugins(list) {
        localStorage.setItem(SAVED_KEY, JSON.stringify(list));
    }

    function refreshBookmarkButtons() {
        const saved = getSavedPlugins().map(p => p.name);
        $(".plugin-card").each(function () {
            const isSaved = saved.includes($(this).data("plugin"));
            $(this).find(".bookmark-btn")
                .toggleClass("is-saved", isSaved)
                .attr("aria-pressed", isSaved)
                .text(isSaved ? "★ Saved" : "☆ Save");
        });
    }
    refreshBookmarkButtons();

    $(document).on("click", ".bookmark-btn", function () {
        playClickSound();
        const $card = $(this).closest(".plugin-card");
        const name = $card.data("plugin");
        let list = getSavedPlugins();

        if (list.some(p => p.name === name)) {
            list = list.filter(p => p.name !== name);
            showToast(name + " removed from saved plugins");
        } else {
            list.push({
                name: name,
                image: $card.find("img").attr("src"),
                description: $card.find(".card-text").text().trim(),
                url: $card.find("a.btn-warning").attr("href")
            });
            showToast(name + " saved to your profile");
        }
        setSavedPlugins(list);
        refreshBookmarkButtons();
    });

    function renderSavedPlugins() {
        const $list = $("#savedPluginsList");
        if (!$list.length) return;

        const list = getSavedPlugins();
        $list.empty();
        $("#savedCount").text(list.length);
        $("#savedEmpty").toggle(list.length === 0);
        $("#clearSavedBtn").toggle(list.length > 0);

        list.forEach(function (plugin) {
            const url = /^https?:\/\//.test(plugin.url || "") ? plugin.url : "plugins.html";
            const hasImage = typeof plugin.image === "string" && /^images\/[\w.-]+$/.test(plugin.image);

            const $item = $('<div class="saved-item d-flex align-items-center flex-wrap gap-3 p-3 mb-2 rounded"></div>');
            if (hasImage) {
                $item.append($('<img alt="" width="48" height="48" style="object-fit: contain;">').attr("src", plugin.image));
            }
            $item.append(
                $('<div class="flex-grow-1"></div>')
                    .append($('<h3 class="text-gold h6 mb-1"></h3>').text(plugin.name))
                    .append($('<p class="small mb-0"></p>').text(plugin.description || ""))
            );
            $item.append(
                $('<div class="d-flex gap-2"></div>')
                    .append($('<a target="_blank" rel="noopener" class="btn btn-warning btn-sm">Download</a>').attr("href", url))
                    .append($('<button type="button" class="btn btn-outline-danger btn-sm remove-saved-btn">Remove</button>').attr("data-name", plugin.name))
            );
            $list.append($item);
        });
    }

    $(document).on("click", ".remove-saved-btn", function () {
        playClickSound();
        const name = $(this).attr("data-name");
        setSavedPlugins(getSavedPlugins().filter(p => p.name !== name));
        renderSavedPlugins();
        showToast(name + " removed");
    });

    $("#clearSavedBtn").on("click", function () {
        playClickSound();
        setSavedPlugins([]);
        renderSavedPlugins();
        showToast("All saved plugins removed");
    });

    $(window).on("storage", function (e) {
        if (e.originalEvent.key === SAVED_KEY) {
            renderSavedPlugins();
            refreshBookmarkButtons();
        }
    });
    renderSavedPlugins();

    $(".faq-question").on("click", function () {
        playClickSound();
        $(this).next(".faq-answer").slideToggle(250);
    });

    $("#openPopupBtn").on("click", function () {
        playClickSound();
        $("#popupOverlay").addClass("is-open");
    });
    $("#closePopupBtn").on("click", function () {
        $("#popupOverlay").removeClass("is-open");
        $("#popupMessage").text("");
    });
    $("#popupOverlay").on("click", function (event) {
        if (event.target === this) {
            $("#popupOverlay").removeClass("is-open");
            $("#popupMessage").text("");
        }
    });

    $("#popupForm").on("submit", function (event) {
        event.preventDefault();
        const subEmail = $("#subEmail").val().trim();
        if (subEmail === "") {
            $("#popupMessage").removeClass("form-success").addClass("error-msg").text("Email is required.");
        } else if (!isValidEmail(subEmail)) {
            $("#popupMessage").removeClass("form-success").addClass("error-msg").text("Please enter a valid email address (name@example.com).");
        } else {
            $("#popupMessage").removeClass("error-msg").addClass("form-success").text("Thank you for subscribing!");
            showToast("Subscribed successfully!");
            $("#subEmail").val("");
        }
    });

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {
        return /^\+?[0-9]{10,15}$/.test(phone.replace(/[\s\-\(\)]/g, ""));
    }

    function isStrongPassword(password) {
        return password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password);
    }
    const PASSWORD_HINT = "Password must be at least 8 characters with uppercase, lowercase and a number.";

    $("#resetFormBtn").on("click", function () {
        playClickSound();
        $("#supportForm")[0].reset();
        $("#supportForm .error-msg").text("");
        $("#formSuccess").text("");
    });

    $("#supportForm").on("submit", function (event) {
        event.preventDefault();
        const name = $("#userName").val().trim();
        const email = $("#userEmail").val().trim();
        const phone = $("#userPhone").val().trim();
        const password = $("#userPassword").val();
        const confirmPassword = $("#confirmPassword").val();
        const message = $("#userMessage").val().trim();

        $("#supportForm .error-msg").text("");
        $("#formSuccess").text("");

        let isValid = true;

        if (!name) { $("#nameError").text("Name is required."); isValid = false; }
        if (!email) { $("#emailError").text("Email is required."); isValid = false; }
        else if (!isValidEmail(email)) { $("#emailError").text("Please enter a valid email."); isValid = false; }
        if (!phone) { $("#phoneError").text("Phone is required."); isValid = false; }
        else if (!isValidPhone(phone)) { $("#phoneError").text("Enter a valid phone (10-15 digits, optional +)."); isValid = false; }
        if (!password) { $("#passwordError").text("Password is required."); isValid = false; }
        else if (!isStrongPassword(password)) { $("#passwordError").text(PASSWORD_HINT); isValid = false; }
        if (!confirmPassword) { $("#confirmPasswordError").text("Please confirm password."); isValid = false; }
        else if (password !== confirmPassword) { $("#confirmPasswordError").text("Passwords do not match."); isValid = false; }
        if (!message) { $("#messageError").text("Message is required."); isValid = false; }

        if (isValid) {
            const $btn = $("#supportForm button[type='submit']");
            const orig = $btn.html();
            $btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm me-2"></span>Sending...');
            setTimeout(() => {
                $btn.prop("disabled", false).html(orig);
                $("#formSuccess").text("Support request submitted successfully!");
                showToast("Ticket submitted!");
                $("#supportForm")[0].reset();
            }, 1200);
        }
    });

    $("#signupForm").on("submit", function (event) {
        event.preventDefault();
        const name = $("#signupName").val().trim();
        const email = $("#signupEmail").val().trim();
        const phone = $("#signupPhone").val().trim();
        const password = $("#signupPassword").val();
        const confirm = $("#signupConfirm").val();

        $("#signupForm .error-msg").text("");

        let isValid = true;
        if (!name) { $("#signupNameError").text("Name is required."); isValid = false; }
        if (!email) { $("#signupEmailError").text("Email is required."); isValid = false; }
        else if (!isValidEmail(email)) { $("#signupEmailError").text("Invalid email format."); isValid = false; }
        if (!phone) { $("#signupPhoneError").text("Phone is required."); isValid = false; }
        else if (!isValidPhone(phone)) { $("#signupPhoneError").text("Invalid phone number."); isValid = false; }
        if (!password) { $("#signupPasswordError").text("Password is required."); isValid = false; }
        else if (!isStrongPassword(password)) { $("#signupPasswordError").text(PASSWORD_HINT); isValid = false; }
        if (!confirm) { $("#signupConfirmError").text("Please confirm password."); isValid = false; }
        else if (password !== confirm) { $("#signupConfirmError").text("Passwords do not match."); isValid = false; }

        if (isValid) {
            const user = { name, email, phone, password };
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            localStorage.setItem(LOGGED_KEY, "true");
            showToast("Account created! Redirecting...");
            setTimeout(() => { window.location.href = "profile.html"; }, 800);
        }
    });

    $("#loginForm").on("submit", function (event) {
        event.preventDefault();
        const email = $("#loginEmail").val().trim();
        const password = $("#loginPassword").val();

        $("#loginForm .error-msg").text("");

        let isValid = true;
        if (!email) { $("#loginEmailError").text("Email is required."); isValid = false; }
        else if (!isValidEmail(email)) { $("#loginEmailError").text("Invalid email."); isValid = false; }
        if (!password) { $("#loginPasswordError").text("Password is required."); isValid = false; }

        if (isValid) {
            const user = getUser();
            if (user && user.email === email && user.password === password) {
                localStorage.setItem(LOGGED_KEY, "true");
                showToast("Login successful!");
                setTimeout(() => { window.location.href = "profile.html"; }, 600);
            } else {
                $("#loginEmailError").text("Invalid email or password.");
            }
        }
    });

    if ($("#profileContent").length && isLoggedIn()) {
        const user = getUser();
        $("#profileName").text(user.name);
        $("#profileEmail").text(user.email);
        $("#profilePhone").text(user.phone || "—");

        const avatars = ["ava1.png", "ava2.png", "ava3.png", "ava4.png"];
        let ava = localStorage.getItem("hostnode_avatar");
        if (!ava) {
            ava = avatars[Math.floor(Math.random() * avatars.length)];
            localStorage.setItem("hostnode_avatar", ava);
        }
        $("#profileAvatar").attr("src", "images/" + ava);
    }

    if ($("#serverStatus").length) {
        const $status = $("#serverStatus");
        $status.html('<div class="text-center"><div class="spinner-border text-warning" role="status"></div><p class="mt-2">Loading Hypixel status...</p></div>');

        fetch("https://api.mcsrvstat.us/3/mc.hypixel.net")
            .then(res => {
                if (!res.ok) throw new Error("Network error");
                return res.json();
            })
            .then(data => {
                if (data.online) {
                    $status.html(`
                        <div class="status-online">● ONLINE</div>
                        <p class="mb-1"><strong>Players:</strong> ${data.players?.online || 0} / ${data.players?.max || "?"}</p>
                        <p class="mb-1"><strong>Version:</strong> ${data.version || "Unknown"}</p>
                        <p class="mb-0"><strong>MOTD:</strong> ${data.motd?.clean?.[0] || "—"}</p>
                    `);
                } else {
                    $status.html('<div class="status-offline">● OFFLINE</div><p>Hypixel is currently offline.</p>');
                }
            })
            .catch(err => {
                $status.html('<div class="text-danger">Failed to load server status. Try again later.</div>');
                console.error(err);
            });
    }
});