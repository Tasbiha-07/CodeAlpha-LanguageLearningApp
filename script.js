// Dataset: Vocabulary & Grammar
const lessonData = [
  { category: "vocabulary", spanish: "Hola", english: "Hello", pronunciation: "/ˈo.la/", options: ["Hello", "Goodbye", "Please", "Thanks"] },
  { category: "vocabulary", spanish: "Gracias", english: "Thank you", pronunciation: "/ˈɡɾa.sjas/", options: ["Sorry", "Thank you", "Yes", "Welcome"] },
  { category: "vocabulary", spanish: "Amigo", english: "Friend", pronunciation: "/aˈmi.ɣo/", options: ["Enemy", "Family", "Friend", "Teacher"] },
  { category: "vocabulary", spanish: "Comida", english: "Food", pronunciation: "/koˈmi.ða/", options: ["Water", "Food", "House", "Fruit"] },
  { category: "grammar", spanish: "¿Cómo estás?", english: "How are you?", pronunciation: "/ˈko.mo esˈtas/", options: ["What is that?", "Where are you?", "How are you?", "Who are you?"] },
  { category: "grammar", spanish: "Yo soy estudiante", english: "I am a student", pronunciation: "/jo soi es.tuˈdjan.te/", options: ["I am a teacher", "I am a student", "You are here", "They are studying"] },
  { category: "grammar", spanish: "Buenos días", english: "Good morning", pronunciation: "/ˈbwe.noz ˈði.as/", options: ["Good night", "Good morning", "Good afternoon", "See you later"] }
];

// App State
let currentCategory = "vocabulary";
let filteredCards = [];
let currentCardIndex = 0;
let quizIndex = 0;
let score = 0;

// Local Storage for Analytics
let totalAnswered = parseInt(localStorage.getItem("lingua_answered")) || 0;
let bestScore = parseInt(localStorage.getItem("lingua_best")) || 0;

// Elements
const tabLearnBtn = document.getElementById("tab-learn-btn");
const tabQuizBtn = document.getElementById("tab-quiz-btn");
const learnSection = document.getElementById("learn-section");
const quizSection = document.getElementById("quiz-section");
const categorySelect = document.getElementById("category-select");

// Learn Elements
const cardTag = document.getElementById("card-tag");
const foreignWord = document.getElementById("foreign-word");
const pronunciation = document.getElementById("pronunciation");
const englishTranslation = document.getElementById("english-translation");
const lessonCounter = document.getElementById("lesson-counter");
const prevCardBtn = document.getElementById("prev-card-btn");
const nextCardBtn = document.getElementById("next-card-btn");
const speakBtn = document.getElementById("speak-btn");

// Quiz Elements
const quizProgress = document.getElementById("quiz-progress");
const quizScoreDisplay = document.getElementById("quiz-score-display");
const quizQuestion = document.getElementById("quiz-question");
const optionsContainer = document.getElementById("options-container");
const feedbackMsg = document.getElementById("feedback-msg");
const nextQuestionBtn = document.getElementById("next-question-btn");
const restartQuizBtn = document.getElementById("restart-quiz-btn");
const totalAnsweredDisplay = document.getElementById("total-answered");
const bestScoreDisplay = document.getElementById("best-score");

function updateFooterStats() {
  totalAnsweredDisplay.textContent = totalAnswered;
  bestScoreDisplay.textContent = bestScore;
}

function filterLessons() {
  filteredCards = lessonData.filter(item => item.category === currentCategory);
  currentCardIndex = 0;
  renderLesson();
}

function renderLesson() {
  if (filteredCards.length === 0) return;
  const current = filteredCards[currentCardIndex];
  cardTag.textContent = current.category;
  foreignWord.textContent = current.spanish;
  pronunciation.textContent = current.pronunciation;
  englishTranslation.textContent = current.english;
  lessonCounter.textContent = `${currentCardIndex + 1} / ${filteredCards.length}`;
}

// Text-to-speech for Spanish Pronunciation
speakBtn.addEventListener("click", () => {
  const current = filteredCards[currentCardIndex];
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(current.spanish);
    utterance.lang = "es-ES";
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Speech synthesis is not supported on this browser.");
  }
});

// Category Filter Switch
categorySelect.addEventListener("change", (e) => {
  currentCategory = e.target.value;
  filterLessons();
  startQuiz();
});

// Navigation Controls
nextCardBtn.addEventListener("click", () => {
  if (filteredCards.length > 0) {
    currentCardIndex = (currentCardIndex + 1) % filteredCards.length;
    renderLesson();
  }
});

prevCardBtn.addEventListener("click", () => {
  if (filteredCards.length > 0) {
    currentCardIndex = (currentCardIndex - 1 + filteredCards.length) % filteredCards.length;
    renderLesson();
  }
});

// Mode Switching
tabLearnBtn.addEventListener("click", () => {
  tabLearnBtn.classList.add("active");
  tabQuizBtn.classList.remove("active");
  learnSection.style.display = "block";
  quizSection.style.display = "none";
});

tabQuizBtn.addEventListener("click", () => {
  tabQuizBtn.classList.add("active");
  tabLearnBtn.classList.remove("active");
  learnSection.style.display = "none";
  quizSection.style.display = "block";
  startQuiz();
});

// Quiz Logic
function startQuiz() {
  quizIndex = 0;
  score = 0;
  nextQuestionBtn.style.display = "none";
  restartQuizBtn.style.display = "none";
  feedbackMsg.textContent = "";
  renderQuizQuestion();
}

function renderQuizQuestion() {
  feedbackMsg.textContent = "";
  nextQuestionBtn.style.display = "none";

  if (quizIndex >= filteredCards.length) {
    // Quiz Finished
    quizQuestion.textContent = `Quiz Finished! Your Score: ${score}/${filteredCards.length}`;
    optionsContainer.innerHTML = "";
    restartQuizBtn.style.display = "block";
    
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem("lingua_best", bestScore);
    }
    updateFooterStats();
    return;
  }

  const current = filteredCards[quizIndex];
  quizProgress.textContent = `Question ${quizIndex + 1} of ${filteredCards.length}`;
  quizScoreDisplay.textContent = `Score: ${score}`;
  quizQuestion.textContent = `What is the meaning of "${current.spanish}"?`;

  optionsContainer.innerHTML = "";
  current.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.classList.add("option-btn");
    btn.textContent = opt;
    btn.addEventListener("click", () => handleAnswer(btn, opt, current.english));
    optionsContainer.appendChild(btn);
  });
}

function handleAnswer(selectedBtn, chosenOption, correctOption) {
  const buttons = optionsContainer.querySelectorAll(".option-btn");
  buttons.forEach(b => (b.disabled = true));

  totalAnswered++;
  localStorage.setItem("lingua_answered", totalAnswered);
  updateFooterStats();

  if (chosenOption === correctOption) {
    selectedBtn.classList.add("correct");
    feedbackMsg.textContent = "Correct! Well done.";
    feedbackMsg.style.color = "var(--accent-green)";
    score++;
    quizScoreDisplay.textContent = `Score: ${score}`;
  } else {
    selectedBtn.classList.add("incorrect");
    feedbackMsg.textContent = `Incorrect! Correct answer: ${correctOption}`;
    feedbackMsg.style.color = "var(--accent-red)";
    
    // Highlight the correct one
    buttons.forEach(b => {
      if (b.textContent === correctOption) b.classList.add("correct");
    });
  }

  nextQuestionBtn.style.display = "block";
}

nextQuestionBtn.addEventListener("click", () => {
  quizIndex++;
  renderQuizQuestion();
});

restartQuizBtn.addEventListener("click", startQuiz);

// Initialize App
filterLessons();
updateFooterStats();