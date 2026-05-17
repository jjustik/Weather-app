const currentThemeSvg = document.getElementById("currentTheme");
const weatherProject = document.querySelector(".weather-project");
const weatherProject2 = document.querySelector(".weather-project-2");
const weatherProject3 = document.querySelector(".weather-project-3");
const avatarInput = document.getElementById("avatarInput");
const avatarImg = document.querySelector(".profile-img")
const avatarDeleteBtn = document.querySelector(".custom-avatar-remover")
const usernameInput = document.querySelector(".profile-username-input");
const saveBtn = document.querySelector(".save-btn")
const signupButton = document.querySelector("#signupButton")
const signinButton = document.querySelector("#signinButton")
let username;
let editingUsername = false;
let shortInput = false;
const form = document.getElementById("profileForm");

function changeModeToDays() {
    if(weatherProject && weatherProject2) {
        weatherProject2.classList.remove("flex")
        weatherProject.classList.remove("grid")
        weatherProject.classList.add("hidden")
        weatherProject2.classList.add("hidden")
        weatherProject3.classList.add("flex")
        localStorage.setItem("Mode", "Days")
    }
}

function changeModeToAdvanced() {
    if(weatherProject && weatherProject2) {
        weatherProject.classList.remove("grid")
        weatherProject2.classList.remove("hidden")
        weatherProject3.classList.remove("flex")
        weatherProject.classList.add("hidden")
        weatherProject2.classList.add("flex")
        localStorage.setItem("Mode", "Advanced")
    }
}

function changeModeToEasy() {
    if(weatherProject && weatherProject2) {
        weatherProject2.classList.remove("flex")
        weatherProject.classList.remove("grid")
        weatherProject3.classList.remove("flex")
        weatherProject2.classList.add("hidden")
        weatherProject.classList.add("grid")
        localStorage.setItem("Mode", "Easy")
    }
}

function getMode() {
    const mode = localStorage.getItem("Mode");
    if(mode === "Advanced") {
        changeModeToAdvanced();
    }
    else if(mode === "Days") {
        changeModeToDays();
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
        document.body.className = "light-theme";
        localStorage.setItem("currentTheme", "lightTheme")
        localStorage.setItem("currentThemeSvg", "lightThemeSvg")
    } 
    else if (darkTheme) {
        currentThemeSvg.className = "dark-theme-span";
        document.body.className = "dark-theme";
        localStorage.setItem("currentTheme", "darkTheme")
        localStorage.setItem("currentThemeSvg", "darkThemeSvg")
    } 
    else if (blackOrangeTheme) {
        currentThemeSvg.className = "black-orange-theme-span";
        document.body.className = "black-orange-theme";
        localStorage.setItem("currentTheme", "blackOrangeTheme")
        localStorage.setItem("currentThemeSvg", "blackOrangeThemeSvg")
    }
}

function loadTheme() {
    const currentTheme = localStorage.getItem("currentTheme")
    if(currentTheme === "darkTheme") {
        currentThemeSvg.className = "dark-theme-span";
        document.body.className = "dark-theme";
    }
    else if (currentTheme === "blackOrangeTheme") {
        currentThemeSvg.className = "black-orange-theme-span";
        document.body.className = "black-orange-theme";
    }
    else {
        currentThemeSvg.className = "light-theme-span";
        document.body.className = "light-theme";
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
    if(usernameInputWidth < 209) {
        document.documentElement.style.setProperty("--final-input-width", `9em`)
        if(flag) {
            shortInput = true;
        }
    }
    else {
        document.documentElement.style.setProperty("--final-input-width", `${usernameInputWidth + 80}px`)
        if(flag) {
            shortInput = false;
        }
    }
}

function createUsernameInput() {
    username = localStorage.getItem("username") || 0;
    form.innerHTML = `<input class="profile-username-input" placeholder="Type your username here" type="text">
                        <span class="error-message">The username is too long</span>`
    const usernameInput = document.querySelector(".profile-username-input");
    usernameInput.classList.add("input-animation");
    setWidthForUsernameInput(true);
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
        usernameInput.classList.remove("input-animation")
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

document.addEventListener("DOMContentLoaded", ()=> {
    loadTheme();
    getMode();
    if(form) {
        getUsername();
    }
    
    document.getElementById("easy-mode-button")?.addEventListener("click", changeModeToEasy);
    document.getElementById("advanced-mode-button")?.addEventListener("click", changeModeToAdvanced);
    document.getElementById("days-mode-button")?.addEventListener("click", changeModeToDays);

    signupButton?.addEventListener("click", function() {
        authModeChange("signup", this)
    })
    signinButton?.addEventListener("click", function() {
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
    document.addEventListener("click", (e)=> {
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
})