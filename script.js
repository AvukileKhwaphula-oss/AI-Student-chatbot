function getElement(id) {
    return document.getElementById(id);
}

function showMessage(element, message, color = "red") {
    if (element) {
        element.textContent = message;
        element.style.color = color;
    }
}

async function postJSON(url, body) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error("The server returned an invalid response.");
    }

    if (!response.ok) {
        throw new Error(
            data.message || "The request failed. Please try again."
        );
    }

    return data;
}

const registerButton = getElement("registerButton");

if (registerButton) {
    registerButton.addEventListener("click", async function () {

        const studentNumber =
            getElement("registerStudentNumber")?.value.trim();

        const email =
            getElement("registerEmail")?.value.trim();

        const password =
            getElement("registerPassword")?.value;

        const confirmPassword =
            getElement("registerConfirmPassword")?.value;

        const registerMessage =
            getElement("registerMessage");

        if (
            !studentNumber ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            showMessage(
                registerMessage,
                "Please complete all fields."
            );
            return;
        }

        if (password !== confirmPassword) {
            showMessage(
                registerMessage,
                "Passwords do not match."
            );
            return;
        }

        if (password.length < 8) {
            showMessage(
                registerMessage,
                "Password must contain at least 8 characters."
            );
            return;
        }

        if (!getElement("registerEmail").checkValidity()) {
            showMessage(
                registerMessage,
                "Please enter a valid email address."
            );
            return;
        }

        registerButton.disabled = true;

        showMessage(
            registerMessage,
            "Creating your account...",
            "black"
        );

        try {
            const data = await postJSON("/api/register", {
                student_number: studentNumber,
                email: email,
                password: password
            });

            if (data.success) {
                showMessage(
                    registerMessage,
                    "Account created successfully! Redirecting...",
                    "green"
                );

                setTimeout(function () {
                    window.location.href = "index.html";
                }, 1500);

            } else {
                showMessage(
                    registerMessage,
                    data.message || "Registration failed."
                );
            }

        } catch (error) {
            console.error("Registration error:", error);

            showMessage(
                registerMessage,
                error.message || "Cannot connect to the server."
            );

        } finally {
            registerButton.disabled = false;
        }
    });
}


const signInButton = getElement("signin-button");

if (signInButton) {
    signInButton.addEventListener("click", async function () {

        const email =
            getElement("loginEmail")?.value.trim();

        const password =
            getElement("loginPassword")?.value;

        const loginMessage =
            getElement("loginMessage");

        if (!email || !password) {
            showMessage(
                loginMessage,
                "Please enter your email and password."
            );
            return;
        }

        if (!getElement("loginEmail").checkValidity()) {
            showMessage(
                loginMessage,
                "Please enter a valid email address."
            );
            return;
        }

        signInButton.disabled = true;

        showMessage(
            loginMessage,
            "Verifying your details...",
            "black"
        );

        try {
            const data = await postJSON("/api/login", {
                email: email,
                password: password
            });

            if (data.success) {

                showMessage(
                    loginMessage,
                    "Login successful!",
                    "green"
                );

                const signInOverlay =
                    getElement("signin-overlay");

                const mainPage =
                    getElement("main-page");

                if (signInOverlay && mainPage) {

                    signInOverlay.style.display = "none";
                    mainPage.style.display = "block";

                } else {

                    window.location.href = "user-interface.html";
                }

            } else {
                showMessage(
                    loginMessage,
                    data.message ||
                    "Incorrect email or password."
                );
            }

        } catch (error) {
            console.error("Sign-in error:", error);

            showMessage(
                loginMessage,
                error.message ||
                "Unable to connect to the server. Check Flask."
            );

        } finally {
            signInButton.disabled = false;
        }
    });
}

const startChatButton = getElement("start-chat-button");

if (startChatButton) {
    startChatButton.addEventListener("click", function () {
        window.location.href = "student-chat.html";
    });
}

const navStartChatButton = getElement("top-chat-button");

if (navStartChatButton) {
    navStartChatButton.addEventListener("click", function () {
        window.location.href = "student-chat.html";
    });
}

const messageInput =
    getElement("user-input") || getElement("messageInput");

const sendButton = getElement("sendButton");

const messages =
    getElement("chat-body") || getElement("messages");


if (messageInput && sendButton && messages) {

    async function sendMessage() {

        const message = messageInput.value.trim();

        if (!message) {
            return;
        }

        addUserMessage(message);

        messageInput.value = "";
        sendButton.disabled = true;

        const thinkingMessage =
            addBotMessage("UniBot is thinking...");

        try {
            const data = await postJSON("/api/chat", {
                message: message
            });

            thinkingMessage.remove();

            if (data.success) {

                addBotMessage(
                    data.response || "I could not find an answer."
                );

                console.log("Detected intent:", data.intent);
                console.log("Confidence:", data.confidence);

            } else {
                addBotMessage(
                    data.message ||
                    "Sorry, I could not process your question."
                );
            }

        } catch (error) {

            console.error("Chat error:", error);

            thinkingMessage.remove();

            addBotMessage(
                "Sorry, I cannot connect to the chatbot server. " +
                "Please check that Flask is running."
            );

        } finally {
            sendButton.disabled = false;
            messageInput.focus();
        }
    }


    function addUserMessage(message) {

        const messageDiv = document.createElement("div");
        messageDiv.className = "message user-message";

        const bubble = document.createElement("div");
        bubble.className = "user-bubble";

        const paragraph = document.createElement("p");
        paragraph.textContent = message;

        const time = document.createElement("span");
        time.textContent = getCurrentTime();

        bubble.appendChild(paragraph);
        bubble.appendChild(time);
        messageDiv.appendChild(bubble);

        messages.appendChild(messageDiv);

        scrollToBottom();
    }


    function addBotMessage(message) {

        const messageDiv = document.createElement("div");
        messageDiv.className = "message bot-message";

        const avatar = document.createElement("div");
        avatar.className = "bot-icon bot-avatar";
        avatar.textContent = "🤖";

        const content = document.createElement("div");
        content.className = "message-content bot-bubble";

        const name = document.createElement("strong");
        name.textContent = "UniBot";

        const paragraph = document.createElement("p");
        paragraph.textContent = message;

        const time = document.createElement("span");
        time.textContent = getCurrentTime();

        content.appendChild(name);
        content.appendChild(paragraph);
        content.appendChild(time);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        messages.appendChild(messageDiv);

        scrollToBottom();

        return messageDiv;
    }

    function getCurrentTime() {

        return new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function scrollToBottom() {
        messages.scrollTop = messages.scrollHeight;
    }

    sendButton.addEventListener("click", sendMessage);

    messageInput.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });
}

const forgotPasswordForm = getElement("forgotPasswordForm");

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const studentIdentifier =
            getElement("studentIdentifier")?.value.trim();

        if (!studentIdentifier) {
            alert("Enter your student email or student number.");
            return;
        }

        window.location.href = "reset-password.html";
    });
}

const resetPasswordForm = getElement("resetPasswordForm");

if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const newPassword =
            getElement("newPassword")?.value || "";

        const confirmPassword =
            getElement("confirmPassword")?.value || "";

        if (newPassword.length < 8) {
            alert("Password must contain at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("The passwords do not match.");
            return;
        }

        alert(
            "The passwords match, but the password has not been " +
            "changed yet. A secure Flask password-reset endpoint is required."
        );
    });
}


(() => {
    const chatForm = document.getElementById("chatForm");
    const messageInput = document.getElementById("messageInput");
    const messages = document.getElementById("messages");
    const sendButton = document.getElementById("sendButton");

    const newChatButton = document.getElementById("newChatButton");
    const clearChatButton = document.getElementById("clearChatButton");

    const emojiButton = document.getElementById("emojiButton");
    const attachmentInput = document.getElementById("attachmentInput");
    const cameraButton = document.getElementById("cameraButton");
    const feedbackButton = document.getElementById("feedbackButton");

    if (!chatForm || !messageInput || !messages) {
        return;
    }

    function addUserMessage(text) {
        const message = document.createElement("div");
        message.className = "message user-message";
        message.textContent = text;
        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;
    }

    function addBotMessage(text) {
        const row = document.createElement("div");
        row.className = "message bot-message";

        const avatar = document.createElement("div");
        avatar.className = "bot-avatar";
        avatar.textContent = "🤖";

        const bubble = document.createElement("div");
        bubble.className = "bot-bubble";

        const paragraph = document.createElement("p");
        paragraph.textContent = text;

        const time = document.createElement("span");
        time.className = "message-time";
        time.textContent = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

        bubble.appendChild(paragraph);
        bubble.appendChild(time);
        row.appendChild(avatar);
        row.appendChild(bubble);

        messages.appendChild(row);
        messages.scrollTop = messages.scrollHeight;
    }

    async function sendMessage() {
        const message = messageInput.value.trim();

        if (!message) {
            return;
        }

        addUserMessage(message);
        messageInput.value = "";

        if (sendButton) {
            sendButton.disabled = true;
        }

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    message: message
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    addBotMessage(
                        "Your session has expired. Please sign in again."
                    );
                } else {
                    addBotMessage(
                        data.error || "Sorry, I could not process your question."
                    );
                }
                return;
            }

            addBotMessage(
                data.response || "Sorry, I could not generate a response."
            );

        } catch (error) {
            console.error("Chat connection error:", error);

            addBotMessage(
                "Sorry, I cannot connect to the chatbot server. " +
                "Please check that Flask is running and try again."
            );

        } finally {
            if (sendButton) {
                sendButton.disabled = false;
            }

            messageInput.focus();
        }
    }

    // Send the message when the form is submitted.
    chatForm.addEventListener("submit", function (event) {
        event.preventDefault();
        sendMessage();
    });

    if (newChatButton) {
        newChatButton.addEventListener("click", function () {
            messages.innerHTML = "";
            addBotMessage(
                "Hello! 👋 Welcome to CPUT Student Support. How can I help you today?"
            );
            messageInput.value = "";
            messageInput.focus();
        });
    }

    if (clearChatButton) {
        clearChatButton.addEventListener("click", function () {
            if (window.confirm("Are you sure you want to clear this conversation?")) {
                messages.innerHTML = "";
                addBotMessage(
                    "Your conversation has been cleared. How can I help you?"
                );
            }
        });
    }

    document.querySelectorAll(".suggested-question").forEach(function (button) {
        button.addEventListener("click", function () {
            messageInput.value = button.dataset.question ||
                button.textContent.trim();

            chatForm.requestSubmit();
        });
    });

    if (emojiButton) {
        emojiButton.addEventListener("click", function () {
            messageInput.value += " 😊";
            messageInput.focus();
        });
    }

    if (attachmentInput) {
        attachmentInput.addEventListener("change", function () {
            if (this.files.length > 0) {
                alert(
                    "Selected file: " + this.files[0].name +
                    ". File uploading is not connected yet."
                );
            }
        });
    }

    if (cameraButton) {
        cameraButton.addEventListener("click", function () {
            alert("Camera functionality has not been connected yet.");
        });
    }

    if (feedbackButton) {
        feedbackButton.addEventListener("click", function () {
            const feedback = window.prompt(
                "Please share your feedback about UniBot:"
            );

            if (feedback && feedback.trim()) {
                alert("Thank you for your feedback!");
            }
        });
    }
})();
