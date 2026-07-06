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
const isMobile = window.matchMedia("(max-width: 470px)");
const isTablet = window.matchMedia("(max-width: 810px)");
let username;
let editingUsername = false;
let shortInput = false;
let searchBtnActive = false;
const form = document.getElementById("profileForm");

//------BACKEND--------
const BASE_URL = "http://127.0.0.1:8000"

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

function getUsername() {
    let username = localStorage.getItem("username") || "";
    if(username.length > 0) {
        form.innerHTML = `<h2 class="profile-username">${username}</h2>`
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
    usernameInput.focus();
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
    button.closest(".auth-wrapper").classList.remove("flex");
    button.closest(".auth-box").classList.add("auth-animation")
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

function authSuccess() {
    const loginLi = document.querySelector(".login-li")
    loginLi.classList.add("hidden");
    profileImgLi.classList.add("block", "margin-right-2em")
    // window.location.replace("/index.html")

}

function toggleBtnAnimation() {
    searchBar.classList.toggle("active")
    if(searchBar.classList.contains("active")) {
        searchInput.focus();
    } else {
        searchInput.blur();
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

// function reverseSearchBtnAnimation() {
//     searchBar.classList.remove("active")
//     searchInput.blur();
//     searchBtnActive = false;
// }

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
    try {
        const response = await fetch(`${BASE_URL}/registration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: signUpUserInput.value.trim(), password: signUpPassInput.value.trim() })
        });
        const data = await response.json();
        console.log(data)
        authSuccess();
    }
    catch(error) {

    }
}

document.addEventListener("DOMContentLoaded", ()=> {
    loadTheme();
    getMode();
    profileMenuToggle();
    authSuccess();
    if(form) {
        getUsername();
    }
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
                createUsernameInput();
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
    signUpBtn?.addEventListener("click", registration)
})