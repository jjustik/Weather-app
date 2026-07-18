const currentThemeSvg = document.getElementById("currentTheme");
const weatherProject = document.querySelector(".weather-project");
const weatherProject2 = document.querySelector(".weather-project-2");
const avatarInput = document.getElementById("avatarInput");
const avatarImg = document.querySelector(".profile-img")
const avatarDeleteBtn = document.querySelector(".custom-avatar-remover")
const usernameInput = document.querySelector(".profile-username-input");
const saveBtn = document.querySelector(".save-btn")
const signupButtonChangeMode = document.querySelector("#signupButton")
const signinButtonChangeMode = document.querySelector("#signinButton")
const signUpUserInput = document.querySelector("#signup-user")
const signUpPassInput = document.querySelector("#signup-pass")
const loginUserInput = document.querySelector("#login-user")
const loginPassInput = document.querySelector("#login-pass")
const signUpBtn = document.querySelector("#signup-button")
const signInBtn = document.querySelector("#signin-button")
const searchBtn = document.querySelector(".search-button")
const searchBar = document.querySelector(".search-bar")
const profileMenu = document.querySelector(".profile-menu")
const profileImgLi = document.querySelector(".profile-img-li")
const themeChangeBlock = document.querySelector(".theme-change-block")
const weatherBackground = document.querySelector(".weather-background")
const settingsBtns = document.querySelectorAll(".settings-button")
const settingsBtn1 = document.querySelector(".set-btn-1")
const mobileAdvancedBar = document.querySelector(".mobile-advanced-bar")
const settingsIcons = document.querySelectorAll(".settings-icon")
const actionBar1 = document.querySelector("#actionBar1")
const actionBar2 = document.querySelector("#actionBar2")
const footer = document.querySelector("footer")
const passLengthReqP = document.querySelector("#req8char");
const passNumAndLettersReqP = document.querySelector("#lettersandnumbersreq");
const signupEmptyUserError = document.querySelector("#signup-empty-username-error-message")
const signupServerError = document.querySelector("#signup-server-error-message")
const signupUsernameTakenError = document.querySelector("#signup-error-message")
const loginEmptyFieldsError = document.querySelector("#login-empty-fields-error-message")
const loginServerError = document.querySelector("#login-server-error-message")
const loginInvalidCredentialsError = document.querySelector("#login-error-message")
const loginVisibilitybtn = document.querySelector("#login-pass-visibility-btn")
const signupVisibilitybtn = document.querySelector("#signup-pass-visibility-btn")
const authErrors = document.querySelectorAll(".auth-error-message")
const isMobile = window.matchMedia("(max-width: 470px)");
const isTablet = window.matchMedia("(max-width: 810px)");
let username;
let editingUsername = false;
let shortInput = false;
let searchBtnActive = false;
let passLengthReq = false;
let passNumAndLettersReq = false;
let isLogin = false;
let authCities = null;
const form = document.getElementById("profileForm");

//------BACKEND--------
const BASE_URL = "http://localhost:8000";
// const BASE_URL = "https://weather-app-production-d28f.up.railway.app";

function changeModeToAdvanced() {
    if(weatherProject && weatherProject2) {
        weatherProject.classList.remove("grid")
        weatherProject2.classList.remove("hidden")
        // weatherBackground.classList.remove("easy-mode")
        // weatherBackground.classList.add("height-expansion", "advanced-mode")
        weatherBackground.classList.add("height-expansion")
        weatherBackground.classList.remove("padding-bottom")
        weatherProject.classList.add("hidden")
        weatherProject2.classList.add("grid")
        footer.classList.add("margin-top")
        actionBar1.classList.add("hidden")
        actionBar2.classList.add("hidden")
        mobileAdvancedBar.classList.remove("hidden")
        settingsBtn1.classList.remove("flex")
        localStorage.setItem("Mode", "Advanced")
    }
}

function changeModeToEasy() {
    if(weatherProject && weatherProject2) {
        weatherProject2.classList.remove("grid")
        weatherProject.classList.remove("grid")
        weatherProject.classList.remove("hidden")
        weatherBackground.classList.remove("height-expansion")
        weatherBackground.classList.add("padding-bottom")
        // weatherBackground.classList.remove("height-expansion", "advanced-mode")
        // weatherBackground.classList.add("easy-mode")
        weatherProject2.classList.add("hidden")
        weatherProject.classList.add("grid")
        footer.classList.remove("margin-top")
        actionBar1.classList.add("hidden")
        actionBar2.classList.add("hidden")
        mobileAdvancedBar.classList.add("hidden")
        settingsBtn1.classList.add("flex")
        localStorage.setItem("Mode", "Easy")
    }
}

function getMode() {
    const mode = localStorage.getItem("Mode");
    if(mode === "Advanced") {
        changeModeToAdvanced();
    }
    else {
        changeModeToEasy();
    }
}

function changeThemeColorRgb() {
    const selectorUl = document.querySelector(".custom-selector > ul");
    const selectorLi = document.querySelectorAll(".custom-selector > ul > li");
    const selectorSvg = document.querySelector(".custom-selector > svg");
    selectorUl.classList.toggle("ul-height")
    selectorLi.forEach(li => {
        li.classList.toggle("block")
    });
    selectorSvg.classList.toggle("rotate-svg")
}

function changeThemeSvg(e) {
    const lightTheme = e.target.closest(".light-theme-span");
    const darkTheme = e.target.closest(".dark-theme-span");
    const blackOrangeTheme = e.target.closest(".black-orange-theme-span");

    if (lightTheme) {
        currentThemeSvg.className = "light-theme-span";
        document.documentElement.className = "light-theme";
        localStorage.setItem("currentTheme", "lightTheme")
        localStorage.setItem("currentThemeSvg", "lightThemeSvg")
    } 
    else if (darkTheme) {
        currentThemeSvg.className = "dark-theme-span";
        document.documentElement.className = "dark-theme";
        localStorage.setItem("currentTheme", "darkTheme")
        localStorage.setItem("currentThemeSvg", "darkThemeSvg")
    } 
    else if (blackOrangeTheme) {
        currentThemeSvg.className = "black-orange-theme-span";
        document.documentElement.className = "black-orange-theme";
        localStorage.setItem("currentTheme", "blackOrangeTheme")
        localStorage.setItem("currentThemeSvg", "blackOrangeThemeSvg")
    }
}

function loadTheme() {
    const currentTheme = localStorage.getItem("currentTheme")
    if(currentTheme === "darkTheme") {
        currentThemeSvg.className = "dark-theme-span";
        document.documentElement.className = "dark-theme";
    }
    else if (currentTheme === "blackOrangeTheme") {
        currentThemeSvg.className = "black-orange-theme-span";
        document.documentElement.className = "black-orange-theme";
    }
    else {
        currentThemeSvg.className = "light-theme-span";
        document.documentElement.className = "light-theme";
    }
}

function setWidthForUsernameInput(flag = false) {
    let username = localStorage.getItem("username") || "";
    let usernameInputWidth = username.length * 16;
    document.documentElement.style.setProperty("--start-input-width", `${usernameInputWidth}px`)
}

function createUsernameInput() {
    username = localStorage.getItem("username") || "";
    setWidthForUsernameInput(true);
    form.innerHTML = `<input class="profile-username-input" placeholder="Type your username here" type="text">
                        <span class="error-message">The username is too long</span>`
    const usernameInput = document.querySelector(".profile-username-input");
    setTimeout(() => {
        usernameInput.classList.add("final-input-width");
    }, 10);
    usernameInput.value = username;
    if(!isTablet.matches) {
        usernameInput.focus();
    }
    username = "";
    addErrorMessageListener();
    editingUsername = true;
}

function addErrorMessageListener() {
    const usernameInput = document.querySelector(".profile-username-input")
    const errorMessage = document.querySelector(".error-message")
    const maxLength = 13;
    usernameInput?.addEventListener("input", ()=> {
        if(usernameInput.value.length > maxLength) {
            errorMessage.classList.add("block")
        } else {
            errorMessage.classList.remove("block")
        }
    })

}

function submitProfileChanges(e, animation = false, save = true) {
    const usernameInput = document.querySelector(".profile-username-input");
    if(!usernameInput) {
        return;
    }
    if(save) {
        username = usernameInput.value.trim();
    }
    else {
        username = localStorage.getItem("username");
    }
    localStorage.setItem("username", username)
    const hasValue = usernameInput.value.length > 0;
    if(hasValue) {
        setWidthForUsernameInput();
        usernameInput.classList.remove("final-input-width")
        usernameInput.classList.add("reverse-input-animation", "hide-caret")
    }
    const finishSubmit = () => {
        if(hasValue) {
            form.innerHTML = `<h2 class="profile-username">${username}</h2>`
        }
        editingUsername = false;
    }
    if(animation) {
        setTimeout(finishSubmit, 250)
    }
    else {
        finishSubmit();
    }
}

function authModeChange(mode, button) {
    const authInputs = button.closest(".auth-box").querySelectorAll(".input-field")
    const passVisibilityBtns = document.querySelectorAll(".pass-visibility-btn")
    button.closest(".auth-wrapper").classList.remove("flex");
    button.closest(".auth-box").classList.add("auth-animation")
    button.closest(".auth-box").querySelector(".pass-visibility-btn").innerHTML = `<svg class="auth-icon visibility-icon" xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#666666"><path d="m634-422-48.67-48.67q20.34-63-27-108-47.33-45-107.66-26.66L402-654q17-10 36.83-14.67 19.84-4.66 41.17-4.66 72.33 0 122.83 50.5T653.33-500q0 21.33-5 41.5T634-422Zm128.67 128-46-45.33Q762-373 796.17-414.17q34.16-41.16 52.5-85.83-50-107.67-147.84-170.5-97.83-62.83-214.16-62.83-37.67 0-76.34 6.66Q371.67-720 346-710l-51.33-52q37-16.33 87.66-27.17Q433-800 483.33-800q145.67 0 264 82.17Q865.67-635.67 920-500q-25 62.33-64.83 114.5-39.84 52.17-92.5 91.5ZM808-61.33 640-226.67q-35 13-76.17 19.84Q522.67-200 480-200q-147.67 0-266.33-82.17Q95-364.33 40-500q20.33-52.33 54.67-100.5 34.33-48.17 82-90.17L56-812l46.67-47.33 750 750-44.67 48ZM222.67-644q-34.34 26.67-65.34 66.33-31 39.67-46.66 77.67 50.66 107.67 150.16 170.5t224.5 62.83q28.67 0 56.34-3.5 27.66-3.5 45-9.83L532-335.33q-11 4.33-25 6.5-14 2.16-27 2.16-71.67 0-122.5-50.16Q306.67-427 306.67-500q0-13.67 2.16-27 2.17-13.33 6.5-25l-92.66-92Zm309.66 125.67Zm-127.66 63.66Z"/></svg>`
    button.closest(".auth-box").querySelector(".pass-input-box").querySelector(".input-field").type = 'password';
    authInputs.forEach(input => input.value = "")
    authErrors.forEach(err => err.classList.remove("block"))
    passVisibilityBtns.forEach(btn => btn.classList.remove("flex"))
    passLengthReqP.classList.remove("checked", "not-checked")
    passNumAndLettersReqP.classList.remove("checked", "not-checked")
    if(mode === "login") {
        document.querySelector("#login-wrapper").classList.add("flex")
    } else {
        document.querySelector("#signup-wrapper").classList.add("flex")
    }
}

function profileMenuToggle() {
    profileImgLi.addEventListener("click", (e)=> {
        profileMenu.classList.toggle("hidden");
        e.stopPropagation()
    })
}

function hideProfileMenu() {
    profileMenu.classList.add("hidden");
}

function toggleBtnAnimation() {
    searchBar.classList.toggle("active")
    if(!isTablet.matches) {
        if(searchBar.classList.contains("active")) {
            searchInput.focus();
        } else {
            searchInput.blur();
        }
    }
    const clearInput = () => {
        searchInput.value = "";
        if(addingBlockFromSearch && !searchingWeatherBlocksCleared) {
            if(addButton) {
                renderAddButton1();
            }
            deleteNewWeatherBlock();
            correctAddButtonsPosition()
            renderSliderButtons();
        }
        searchBar.removeEventListener("transitionend", clearInput)
        searchBar.removeEventListener("transitioncancel", clearInput)
    }
    searchBar.addEventListener("transitioncancel", clearInput)
    searchBar.addEventListener("transitionend", clearInput)
    searchBtnActive ? false : true;
}

searchBtn?.addEventListener("click", ()=> {
    if(!searchBtnActive) {
        toggleBtnAnimation();
    }
})

function settingsBtnScreenSizeCheck(e) {
    const mode = localStorage.getItem("Mode");
    if(mode === "Advanced" && e.matches) {
        actionBar2.classList.toggle("hidden")
    } else {
        actionBar1.classList.toggle("hidden")
    }
}

settingsBtns.forEach(el => {
    el?.addEventListener("click", function() {
        settingsIcons.forEach(el => el.classList.toggle("active"))
        settingsBtnScreenSizeCheck(isMobile)
    })
})

// ---------------FRONTEND TO BACKEND---------------------
async function registration() {
    const login = signUpUserInput.value.trim();
    const password = signUpPassInput.value.trim();
    authErrors.forEach(err => {
        err.classList.remove("block")
    })
    if(login.length === 0) {
        signupEmptyUserError.classList.add("block")
        return;
    } else {
        signupEmptyUserError.classList.remove("block")
    }
    if(!passLengthReq || !passNumAndLettersReq) {
        if(!passLengthReq) {
            passLengthReqP.classList.add("not-checked")
        }
        if(!passNumAndLettersReq) {
            passNumAndLettersReqP.classList.add("not-checked")
        }
        return;
    };
    try {
        const res = await fetch(`${BASE_URL}/registration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: login, password: password })
        });
        const data = await res.json();
        console.log(data)
        if(!res.ok) {
            const msg = Array.isArray(data?.detail) ? data.detail[0].msg : (data?.detail || 'Error')
            const error = new Error(msg)
            error.status = res.status;
            throw error;
        }
        await loginUser(login, password)
    }
    catch(err) {
        if(!err.status) {
            signupServerError.classList.add("block")
        } else if(err.message === "User with this email or nickname already exists") {
            signupUsernameTakenError.classList.add("block")
        } else if(err.status === 422) {
            signupServerError.textContent = err.message;
            signupServerError.classList.add("block")
        } else {
            signupServerError.textContent = "Something went wrong. Please try again.";
            signupServerError.classList.add("block")
        }
    }
}

async function login() {
    const username = loginUserInput.value.trim();
    const password = loginPassInput.value.trim();
    authErrors.forEach(err => {
        err.classList.remove("block")
    })
    if(!username || !password) {
        loginEmptyFieldsError.classList.add("block")
        return;
    } else {
        loginEmptyFieldsError.classList.remove("block")
    }
    try {
        isLogin = true;
        await loginUser(username, password)
    }
    catch(err) {
        if(!err.status) {
            loginServerError.classList.add("block")
        } else if(err.message === "Incorrect email or password") {
            loginInvalidCredentialsError.classList.add("block")
        } else if(err.status === 422) {
            loginServerError.textContent = err.message;
            loginServerError.classList.add("block")
        } else {
            loginServerError.textContent = "Something went wrong. Please try again.";
            loginServerError.classList.add("block")
        }
    }
}

async function loginUser(usernameValue, passwordValue) {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', usernameValue);
    formData.append('password', passwordValue);
    const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: 'include',
        body: formData
    })
    const data = await res.json();
    if(!res.ok) {
        const msg = Array.isArray(data?.detail) ? data.detail[0].msg : (data?.detail || 'Error')
        const error = new Error(msg)
        error.status = res.status;
        throw error;
    }
    authToast()
    setTimeout(() => {
        window.location.replace("/index.html")
    }, 1500);
}

function passCheck() {
    const password = signUpPassInput.value;
    const hasLetters = /[a-zA-Z]/.test(password)
    const hasNumbers = /[0-9]/.test(password)
    passLengthReqP.classList.remove("not-checked")
    passNumAndLettersReqP.classList.remove("not-checked")
    passLengthReqP.classList.toggle("checked", password.length >= 8)
    password.length >= 8 ? passLengthReq = true : passLengthReq = false;
    passNumAndLettersReqP.classList.toggle("checked", hasLetters && hasNumbers)
    hasLetters && hasNumbers ? passNumAndLettersReq = true : passNumAndLettersReq = false;
}

function authToast() {
    const toastContainer = document.querySelector(".toast-container")
    const toastText = document.querySelector(".toast-text")
    if(isLogin) {
        toastText.textContent = "Welcome back!"
    }
    toastContainer.classList.add("flex")
}

function passVisibility(input) {
    const visibilityBtn = input.parentElement.querySelector(".pass-visibility-btn")
    if(input.value.length > 0) {
        visibilityBtn.classList.add("flex")
    } else {
        visibilityBtn.classList.remove("flex")
    }
}

function updateAuthUI(isLoggedIn) {
    const loginLi = document.querySelector(".login-li")

    loginLi?.classList.toggle("hidden", isLoggedIn)
    profileImgLi.classList.toggle("block", isLoggedIn)
}

async function checkAuth() {
    try {
        const res = await fetch(`${BASE_URL}/users/me`, {
            method: 'GET',
            credentials: 'include'
        })
        if(!res.ok) {
            updateAuthUI(false);
            if(form) {
                getLocalUsername();
            }
            return;
        }
        const userData = await res.json();
        console.log('Данные залогиненного пользователя:', userData);
        Cities = userData.cities;
        loadProfileMenu(userData)
        getAvatar(userData)
        if(form) {
            getUsername(userData)
        }
        updateAuthUI(true)
    } catch (err) {
        console.error('Ошибка сети при проверке авторизации', err)
        updateAuthUI(false)
        if(form) {
            getLocalUsername();
        }
    }
}

function loadProfileMenu(data) {
    const profileMenuUsername = document.querySelector(".profile-menu-username")
    const profileMenuEmail = document.querySelector(".profile-menu-email")
    const profileMenuAvatar = document.querySelector(".middle-profile-image")
    const setUsernameA = document.querySelector(".set-username-a")
    const setEmailA = document.querySelector(".set-email-a")
    profileMenuUsername.textContent = data.name;
    if(data.name === null) {
        profileMenuUsername.classList.add("hidden")
        setUsernameA.classList.add("block")
    } else {
        profileMenuUsername.textContent = data.name;
    }
    if(data.email === null) {
        profileMenuEmail.classList.add("hidden")
        setEmailA.classList.add("block")
    } else {
        profileMenuEmail.textContent = data.email
    }
    profileMenuAvatar.url = data.avatar_url
}

loginVisibilitybtn?.addEventListener("click", ()=> {
    if(loginPassInput.type === 'password') {
        loginPassInput.type = 'text';
        loginVisibilitybtn.innerHTML = `<svg class="auth-icon visibility-icon" xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#666666"><path d="M602.83-377.17q50.5-50.5 50.5-122.83t-50.5-122.83q-50.5-50.5-122.83-50.5t-122.83 50.5q-50.5 50.5-50.5 122.83t50.5 122.83q50.5 50.5 122.83 50.5t122.83-50.5ZM401.5-421.5q-32.17-32.17-32.17-78.5t32.17-78.5q32.17-32.17 78.5-32.17t78.5 32.17q32.17 32.17 32.17 78.5t-32.17 78.5q-32.17 32.17-78.5 32.17t-78.5-32.17Zm-186.17 139Q96.67-365 40-500q56.67-135 175.33-217.5Q334-800 480-800t264.67 82.5Q863.33-635 920-500q-56.67 135-175.33 217.5Q626-200 480-200t-264.67-82.5ZM480-500Zm217.5 169.83q99.17-63.5 151.17-169.83-52-106.33-151.17-169.83-99.17-63.5-217.5-63.5t-217.5 63.5Q163.33-606.33 110.67-500q52.66 106.33 151.83 169.83 99.17 63.5 217.5 63.5t217.5-63.5Z"/></svg>`
    } else {
        loginPassInput.type = 'password';
        loginVisibilitybtn.innerHTML = `<svg class="auth-icon visibility-icon" xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#666666"><path d="m634-422-48.67-48.67q20.34-63-27-108-47.33-45-107.66-26.66L402-654q17-10 36.83-14.67 19.84-4.66 41.17-4.66 72.33 0 122.83 50.5T653.33-500q0 21.33-5 41.5T634-422Zm128.67 128-46-45.33Q762-373 796.17-414.17q34.16-41.16 52.5-85.83-50-107.67-147.84-170.5-97.83-62.83-214.16-62.83-37.67 0-76.34 6.66Q371.67-720 346-710l-51.33-52q37-16.33 87.66-27.17Q433-800 483.33-800q145.67 0 264 82.17Q865.67-635.67 920-500q-25 62.33-64.83 114.5-39.84 52.17-92.5 91.5ZM808-61.33 640-226.67q-35 13-76.17 19.84Q522.67-200 480-200q-147.67 0-266.33-82.17Q95-364.33 40-500q20.33-52.33 54.67-100.5 34.33-48.17 82-90.17L56-812l46.67-47.33 750 750-44.67 48ZM222.67-644q-34.34 26.67-65.34 66.33-31 39.67-46.66 77.67 50.66 107.67 150.16 170.5t224.5 62.83q28.67 0 56.34-3.5 27.66-3.5 45-9.83L532-335.33q-11 4.33-25 6.5-14 2.16-27 2.16-71.67 0-122.5-50.16Q306.67-427 306.67-500q0-13.67 2.16-27 2.17-13.33 6.5-25l-92.66-92Zm309.66 125.67Zm-127.66 63.66Z"/></svg>`
    }
})

signupVisibilitybtn?.addEventListener("click", ()=> {
    if(signUpPassInput.type === 'password') {
        signUpPassInput.type = 'text';
        signupVisibilitybtn.innerHTML = `<svg class="auth-icon visibility-icon" xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#666666"><path d="M602.83-377.17q50.5-50.5 50.5-122.83t-50.5-122.83q-50.5-50.5-122.83-50.5t-122.83 50.5q-50.5 50.5-50.5 122.83t50.5 122.83q50.5 50.5 122.83 50.5t122.83-50.5ZM401.5-421.5q-32.17-32.17-32.17-78.5t32.17-78.5q32.17-32.17 78.5-32.17t78.5 32.17q32.17 32.17 32.17 78.5t-32.17 78.5q-32.17 32.17-78.5 32.17t-78.5-32.17Zm-186.17 139Q96.67-365 40-500q56.67-135 175.33-217.5Q334-800 480-800t264.67 82.5Q863.33-635 920-500q-56.67 135-175.33 217.5Q626-200 480-200t-264.67-82.5ZM480-500Zm217.5 169.83q99.17-63.5 151.17-169.83-52-106.33-151.17-169.83-99.17-63.5-217.5-63.5t-217.5 63.5Q163.33-606.33 110.67-500q52.66 106.33 151.83 169.83 99.17 63.5 217.5 63.5t217.5-63.5Z"/></svg>`
    } else {
        signUpPassInput.type = 'password';
        signupVisibilitybtn.innerHTML = `<svg class="auth-icon visibility-icon" xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#666666"><path d="m634-422-48.67-48.67q20.34-63-27-108-47.33-45-107.66-26.66L402-654q17-10 36.83-14.67 19.84-4.66 41.17-4.66 72.33 0 122.83 50.5T653.33-500q0 21.33-5 41.5T634-422Zm128.67 128-46-45.33Q762-373 796.17-414.17q34.16-41.16 52.5-85.83-50-107.67-147.84-170.5-97.83-62.83-214.16-62.83-37.67 0-76.34 6.66Q371.67-720 346-710l-51.33-52q37-16.33 87.66-27.17Q433-800 483.33-800q145.67 0 264 82.17Q865.67-635.67 920-500q-25 62.33-64.83 114.5-39.84 52.17-92.5 91.5ZM808-61.33 640-226.67q-35 13-76.17 19.84Q522.67-200 480-200q-147.67 0-266.33-82.17Q95-364.33 40-500q20.33-52.33 54.67-100.5 34.33-48.17 82-90.17L56-812l46.67-47.33 750 750-44.67 48ZM222.67-644q-34.34 26.67-65.34 66.33-31 39.67-46.66 77.67 50.66 107.67 150.16 170.5t224.5 62.83q28.67 0 56.34-3.5 27.66-3.5 45-9.83L532-335.33q-11 4.33-25 6.5-14 2.16-27 2.16-71.67 0-122.5-50.16Q306.67-427 306.67-500q0-13.67 2.16-27 2.17-13.33 6.5-25l-92.66-92Zm309.66 125.67Zm-127.66 63.66Z"/></svg>`
    }
})

function getUsername(data) {
    if(!data.name === null) {
        let username = data.name;
        form.innerHTML = `<h2 class="profile-username">${username}</h2>`
    }
}

function getLocalUsername() {
    let username = localStorage.getItem("username") || "";
    if(username.length > 0) {
        form.innerHTML = `<h2 class="profile-username">${username}</h2>`
    }
}

function getAvatar(data) {
    if(avatarImg) {
        avatarImg.url = data.avatar_url;
    }
}

function saveAddButtonState() {
    localStorage.setItem("AddButton", String(addButton))
}

async function loadAddButtonState() {
    try {
        const res = await fetch(`${BASE_URL}/users/me`, {
            method: 'GET',
            credentials: 'include'
        })
        if(!res.ok) {
            loadLocalAddButtonState();
        }
        const userData = await res.json();
        addButton = userData.add_button
    } catch(err) {
        console.error('Ошибка сети при загрузке городов', err)
        loadLocalAddButtonState();
    }
}

function loadLocalAddButtonState() {
    const addButtonState = localStorage.getItem("AddButton");
    if (addButtonState === null) {
        addButton = true;
        return;
    }
    addButtonState === "true" ? addButton = true : addButton = false;
}

function saveCities() {
    const CitiesStorage = JSON.stringify(Cities);
    localStorage.setItem("Cities", CitiesStorage)
}

async function loadCities() {
    try {
        const res = await fetch(`${BASE_URL}/users/me`, {
            method: 'GET',
            credentials: 'include'
        })
        if(!res.ok) {
            loadLocalCities()
            return;
        }
        const userData = await res.json();
        Cities = userData.cities;
    } catch(err) {
        console.error('Ошибка сети при загрузке городов', err)
        loadLocalCities()
    }
}

function loadLocalCities() {
    const CitiesStorage = localStorage.getItem("Cities");
    Cities = JSON.parse(CitiesStorage) || []
}

document.addEventListener("DOMContentLoaded", ()=> {
    loadTheme();
    getMode();
    profileMenuToggle();
    checkAuth()
    themeChangeBlock.addEventListener("mouseenter", ()=> {
        const allThemes = document.querySelectorAll(".theme")
        allThemes.forEach(el => el.classList.add("pointer-events"))
    })
    themeChangeBlock.addEventListener("mouseleave", ()=> {
        const allThemes = document.querySelectorAll(".theme")
        allThemes.forEach(el => el.classList.remove("pointer-events"))
    })
    
    document.getElementById("easy-mode-button")?.addEventListener("click", changeModeToEasy);
    document.getElementById("advanced-mode-button")?.addEventListener("click", changeModeToAdvanced);

    signupButtonChangeMode?.addEventListener("click", function() {
        authModeChange("signup", this)
    })
    signinButtonChangeMode?.addEventListener("click", function() {
        authModeChange("login", this)
    })

    if(usernameInput) {
        if(usernameInput?.value.length < 14) {
            shortInput = true;
        }
        addErrorMessageListener();
    }

    form?.addEventListener("submit", (e)=> {
        e.preventDefault();
        const usernameInput = document.querySelector(".profile-username-input");
        const allowedUsernameWidth = usernameInput?.value.length < 14;
        if(allowedUsernameWidth) {
            if(usernameInput?.value.length > 13 && shortInput) {
                submitProfileChanges(e)
            }
            else {
                submitProfileChanges(e, true)
            }
        }
    })
    form?.addEventListener("click", (e)=> {
        if(editingUsername === false) {
            const usernameInput = document.querySelector(".profile-username-input");
            if(!usernameInput) {
                createUsernameInput(true);
                editingUsername = true;
                e.stopPropagation();
            }
        }
    })
    document.addEventListener("mousedown", (e)=> {
        e.stopPropagation();
        const usernameInput = document.querySelector(".profile-username-input");
        if(editingUsername === true && !form.contains(e.target) && usernameInput.value.length > 0 && e.key !== "Enter" && e.target !== saveBtn) {
            const usernameInput = document.querySelector(".profile-username-input");
            const allowedUsernameWidth = usernameInput.value.length < 14;
            if(allowedUsernameWidth) {
                if(usernameInput.value.length > 13 && shortInput) {
                    submitProfileChanges(e, false, false)
                }
                else {
                    submitProfileChanges(e, true, false)
                }
            }
        }
        if(!profileMenu.contains(e.target) && !profileImgLi.contains(e.target)) {
            hideProfileMenu();
        }
    })
    document.addEventListener("click", (e)=> {
        const clickOnSelector = document.querySelector(".custom-selector").contains(e.target);
        if (clickOnSelector) {
            changeThemeColorRgb();
        }
        else {
            const selectorUl = document.querySelector(".custom-selector > ul");
            const selectorLi = document.querySelectorAll(".custom-selector > ul > li");
            const selectorSvg = document.querySelector(".custom-selector > svg");
            selectorUl.classList.remove("ul-height")
            selectorLi.forEach(li => {
                li.classList.remove("block")
            });
            selectorSvg.classList.remove("rotate-svg")
        }
    })
    document.addEventListener("click", (e) => {
        changeThemeSvg(e);
    });
    avatarInput?.addEventListener("change", (e)=> {
        const avatarFile = e.target.files[0]
        const MAX_SIZE_MB = 20;
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
        if (!avatarFile) return;

        const allowedTypes = ["image/jpeg", "image/png"]

        if(!allowedTypes.includes(avatarFile.type)) {
            avatarInput.value = '';
            return;
        }

        if(avatarFile && avatarFile.size > MAX_SIZE_BYTES) {
            avatarInput.value = "";
            return;
        }

        const url = URL.createObjectURL(avatarFile)
        avatarImg.src = url;
        
        avatarDeleteBtn.addEventListener("click", ()=> {
            URL.revokeObjectURL(url);
            avatarInput.value = "";
            avatarImg.src = "images/FaceCat.jpg";
        })

        avatarImg.onload = () => URL.revokeObjectURL(url)
    })
    signUpPassInput?.addEventListener("input", function() {
        passCheck()
        passVisibility(this)
    })
    loginPassInput?.addEventListener("input", function() {
        passVisibility(this)
    })
    signUpBtn?.addEventListener("click", registration)
    signInBtn?.addEventListener("click", login)
})