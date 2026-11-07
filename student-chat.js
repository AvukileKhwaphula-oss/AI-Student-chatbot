
document.addEventListener("DOMContentLoaded", function () {
    const chatForm = document.getElementById("ubChatForm");
    const input = document.getElementById("ubMessageInput");
    const messages = document.getElementById("ubMessages");
    const emptyState = document.getElementById("ubEmptyState");
    const newChatButton = document.getElementById("ubNewChat");
    const clearChatButton = document.getElementById("ubClearChat");
    const sendButton = chatForm.querySelector(".ub-send-button");
    const emojiButton = document.getElementById("ubEmoji");
    const attachButton = document.getElementById("ubAttach");
    const fileInput = document.getElementById("ubFileInput");
    const feedbackButton = document.getElementById("ubFeedback");

    function currentTime() {
        return new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function scrollToLatest() {
        messages.scrollTop = messages.scrollHeight;
    }

    function addMessage(text, sender) {
        if (emptyState) {
            emptyState.hidden = true;
        }

        const row = document.createElement("div");
        row.className = "ub-message-row " +
            (sender === "user" ? "ub-user-row" : "ub-bot-row");

        if (sender !== "user") {
            const avatar = document.createElement("div");
            avatar.className = "ub-avatar";
            avatar.textContent = "🤖";
            row.appendChild(avatar);
        }

        const bubble = document.createElement("div");
        bubble.className = "ub-message-bubble";

        const messageText = document.createElement("p");
        messageText.className = "ub-message-text";
        messageText.textContent = text;

        const time = document.createElement("span");
        time.className = "ub-message-time";
        time.textContent = currentTime();

        bubble.appendChild(messageText);
        bubble.appendChild(time);
        row.appendChild(bubble);

        messages.appendChild(row);
        scrollToLatest();

        return row;
    }

    async function sendMessage(message) {
        const text = (message || input.value).trim();

        if (!text || sendButton.disabled) {
            return;
        }

        addMessage(text, "user");
        input.value = "";
        sendButton.disabled = true;

        const thinkingRow = addMessage("UniBot is thinking...", "bot");

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            thinkingRow.remove();

            if (response.ok && data.success) {
                addMessage(data.response, "bot");
            } else if (response.status === 401) {
                addMessage(
                    "Your session may have expired. Please sign in again.",
                    "bot"
                );
            } else {
                addMessage(
                    data.error || data.message ||
                    "Sorry, I could not process your question.",
                    "bot"
                );
            }
        } catch (error) {
            thinkingRow.remove();
            console.error("Chat request failed:", error);

            addMessage(
                "I cannot connect to the chatbot server. Please check that Flask is running.",
                "bot"
            );
        } finally {
            sendButton.disabled = false;
            input.focus();
        }
    }

    chatForm.addEventListener("submit", function (event) {
        event.preventDefault();
        sendMessage();
    });

    document.querySelectorAll(".ub-suggestion").forEach(function (button) {
        button.addEventListener("click", function () {
            sendMessage(button.dataset.question);
        });
    });

    function startNewChat() {
        messages.querySelectorAll(".ub-message-row").forEach(function (row) {
            row.remove();
        });

        if (emptyState) {
            emptyState.hidden = false;
        }

        input.value = "";
        input.focus();
    }

    newChatButton.addEventListener("click", startNewChat);
    clearChatButton.addEventListener("click", startNewChat);

    emojiButton.addEventListener("click", function () {
        input.value += "😊";
        input.focus();
    });

    attachButton.addEventListener("click", function () {
        fileInput.click();
    });

    fileInput.addEventListener("change", function () {
        if (fileInput.files.length > 0) {
            addMessage(
                "Selected file: " + fileInput.files[0].name +
                ". File uploading is not connected yet.",
                "bot"
            );
            fileInput.value = "";
        }
    });

    feedbackButton.addEventListener("click", function () {
        window.alert(
            "Thank you for using UniBot! Feedback submission can be connected next."
        );
    });
});
