// --- 1. Variables and Data ---
const loginPage = document.getElementById("login-page");
const rulesPage = document.getElementById("rules-page");
const welcomePage = document.getElementById("welcome-page");
const quizPage = document.getElementById("quiz-page");
const resultPage = document.getElementById("result-page");

let currentUser = "";
let currentEmail = "";
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeValue = 15;
let attempted = 0;
let skipped = 0;
let userAnswers = new Array(20).fill(null); // Store user choice for each index

// 20 Questions (Topic: Computer Basics)
const questions = [
    { q: "What does HTML stand for?", options: ["Hyper Text Preprocessor", "Hyper Text Markup Language", "Hyper Text Multiple Language", "Hyper Tool Multi Language"], answer: 1 },
    { q: "What does CSS stand for?", options: ["Common Style Sheet", "Colorful Style Sheet", "Computer Style Sheet", "Cascading Style Sheet"], answer: 3 },
    { q: "What does PHP stand for?", options: ["Hypertext Preprocessor", "Hypertext Programming", "Hypertext Preprogramming", "HomeStand Preprocessor"], answer: 0 },
    { q: "What does SQL stand for?", options: ["Stylish Question Language", "Stylesheet Query Language", "Statement Question Language", "Structured Query Language"], answer: 3 },
    { q: "What does XML stand for?", options: ["eXtensible Markup Language", "executable Multiple Language", "eXTra Multi-Program Language", "eXamine Multiple Language"], answer: 0 },
    { q: "1 Byte equals to how many bits?", options: ["4 bits", "8 bits", "16 bits", "32 bits"], answer: 1 },
    { q: "Which represents the brain of the computer?", options: ["RAM", "CPU", "Motherboard", "GPU"], answer: 1 },
    { q: "Which language is used for Android Development?", options: ["PHP", "Java", "Swift", "HTML"], answer: 1 },
    { q: "What is the extension of Python file?", options: [".py", ".python", ".p", ".pt"], answer: 0 },
    { q: "Which is not a programming language?", options: ["HTML", "Python", "Java", "C++"], answer: 0 },
    { q: "What does RAM stand for?", options: ["Read Access Memory", "Random Access Memory", "Run Access Memory", "Read All Memory"], answer: 1 },
    { q: "Which tag is used to create a hyperlink?", options: ["<a>", "<img>", "<dl>", "<link>"], answer: 0 },
    { q: "Which is the largest heading tag?", options: ["<h6>", "<h3>", "<h1>", "<head>"], answer: 2 },
    { q: "What is the full form of OS?", options: ["Order System", "Operating System", "Open Software", "Optical Sensor"], answer: 1 },
    { q: "Who is known as the father of Computer?", options: ["Alan Turing", "Charles Babbage", "Simur Cray", "Augusta Adaming"], answer: 1 },
    { q: "What is the main circuit board called?", options: ["Motherboard", "Fatherboard", "Keyboard", "All of above"], answer: 0 },
    { q: "Which of these is a web browser?", options: ["Google", "Chrome", "Windows", "Facebook"], answer: 1 },
    { q: "HTTP stands for?", options: ["Hyper Text Transfer Protocol", "High Transfer Text Protocol", "Hyper Transfer Text Protocol", "Hyper Time Transfer Protocol"], answer: 0 },
    { q: "What is the shortcut for Copy?", options: ["Ctrl + V", "Ctrl + C", "Ctrl + X", "Ctrl + Z"], answer: 1 },
    { q: "1 Kilobyte is equal to?", options: ["1000 Bytes", "1024 Bytes", "1024 Bits", "1000 Bits"], answer: 1 }
];

// --- 2. Event Listeners ---

document.getElementById("login-form").addEventListener("submit", function(e) {
    e.preventDefault();
    currentUser = document.getElementById("username").value;
    currentEmail = document.getElementById("useremail").value;
    
    document.getElementById("display-name").innerText = currentUser;
    
    loginPage.classList.add("hidden");
    rulesPage.classList.remove("hidden");
});

document.getElementById("btn-rules-next").addEventListener("click", () => {
    rulesPage.classList.add("hidden");
    welcomePage.classList.remove("hidden");
});

document.getElementById("btn-start-quiz").addEventListener("click", () => {
    welcomePage.classList.add("hidden");
    quizPage.classList.remove("hidden");
    startQuiz();
});

document.getElementById("btn-next").addEventListener("click", () => {
    // If next button is clicked manually
    if(currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    } else {
        finishQuiz();
    }
});

document.getElementById("btn-prev").addEventListener("click", () => {
    if(currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion(currentQuestionIndex);
    }
});

document.getElementById("btn-skip").addEventListener("click", () => {
    // If skipping, mark as skipped only if not already answered
    if(userAnswers[currentQuestionIndex] === null) {
        // Just move next without saving an answer
        if(!userAnswers.hasOwnProperty(currentQuestionIndex)) skipped++; 
    }
    
    if(currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    } else {
        finishQuiz();
    }
});

// --- 3. Functions ---

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    attempted = 0;
    skipped = 0;
    userAnswers.fill(null);
    loadQuestion(0);
}

function loadQuestion(index) {
    clearInterval(timer); // Reset timer
    timeValue = 15;
    document.getElementById("time-sec").innerText = timeValue;
    startTimer();

    // Update Text
    const q = questions[index];
    document.getElementById("question-text").innerText = `${index + 1}. ${q.q}`;
    const optionList = document.querySelector(".option-list");
    optionList.innerHTML = ""; // Clear old options

    // Create Options
    q.options.forEach((opt, i) => {
        const div = document.createElement("div");
        div.classList.add("option");
        div.innerText = opt;
        
        // If previously answered, highlight it
        if(userAnswers[index] === i) {
            div.classList.add("selected");
        }

        div.setAttribute("onclick", `optionSelected(this, ${i})`);
        optionList.appendChild(div);
    });

    // Update Buttons Text
    const nextBtn = document.getElementById("btn-next");
    if(index === questions.length - 1) {
        nextBtn.innerText = "Finish";
    } else {
        nextBtn.innerText = "Next";
    }

    updateStatusPanel();
}

function optionSelected(answerDiv, optionIndex) {
    // Deselect all
    const allOptions = document.querySelectorAll(".option");
    allOptions.forEach(opt => opt.classList.remove("selected"));

    // Select clicked
    answerDiv.classList.add("selected");
    
    // Save state
    userAnswers[currentQuestionIndex] = optionIndex;
    updateStatusPanel();
}

function updateStatusPanel() {
    // Calculate attempted based on non-null array entries
    const attempts = userAnswers.filter(ans => ans !== null).length;
    // Skipped is effectively Total visited so far - attempted, or simplified logic:
    // Here we just count how many indices < current have null answers
    let skips = 0;
    for(let i=0; i<=currentQuestionIndex; i++) {
        if(userAnswers[i] === null && i !== currentQuestionIndex) skips++;
    }

    document.getElementById("attempted-count").innerText = attempts;
    document.getElementById("skipped-count").innerText = skips;
}

function startTimer() {
    timer = setInterval(() => {
        timeValue--;
        document.getElementById("time-sec").innerText = timeValue;
        if(timeValue <= 0) {
            clearInterval(timer);
            // Auto move to next
            document.getElementById("btn-next").click();
        }
    }, 1000);
}

function finishQuiz() {
    clearInterval(timer);
    quizPage.classList.add("hidden");
    resultPage.classList.remove("hidden");

    // Calculate Score
    score = 0;
    questions.forEach((q, index) => {
        if(userAnswers[index] === q.answer) {
            score += 5; // 5 points per question
        }
    });

    const totalPoints = questions.length * 5;
    document.getElementById("score-text").innerText = score;
    document.getElementById("total-text").innerText = totalPoints;

    // Congratulatory Message
    const msg = document.getElementById("congrats-msg");
    if(score > (totalPoints * 0.8)) msg.innerText = "Congratulations! Excellent Work! 🌟";
    else if(score > (totalPoints * 0.5)) msg.innerText = "Good Job! Keep Improving! 👍";
    else msg.innerText = "Nice Try! Work Harder! 💪";

    sendEmail(score, totalPoints);
}

function sendEmail(score, total) {
    // Check if EmailJS is actually loaded
    if (typeof emailjs === 'undefined') {
        document.getElementById("email-status").innerText = "EmailJS not loaded. Check internet connection.";
        return;
    }

    const templateParams = {
        to_name: currentUser,
        to_email: currentEmail,
        score: score,
        total: total,
        message: `You scored ${score} out of ${total} points.`
    };

    // REPLACE 'YOUR_SERVICE_ID' AND 'YOUR_TEMPLATE_ID' WITH ACTUAL IDS FROM EMAILJS
    emailjs.send('service_t9ie48u', 'template_ilbf7cq', templateParams,'F05MtYvct45p4DzD8')
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            document.getElementById("email-status").innerText = `Result sent to ${currentEmail} ✅`;
        }, function(error) {
            console.log('FAILED...', error);
            document.getElementById("email-status").innerText = "Failed to send email. ❌";
        });
}