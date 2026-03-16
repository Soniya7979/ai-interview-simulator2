// AI Interview Simulator - Voice Mode (Feedback only, no score)
class InterviewSimulator {
    constructor() {
        this.questions = {
            frontend: [
                'Tell me about yourself.',
                'Explain the difference between let, const, and var.',
                'What is React and why use it?',
                'Describe virtual DOM.',
                'How do you handle state in React?',
                'What is CSS Flexbox?',
                'Explain RESTful APIs.',
                'What is responsive design?',
                'Describe event bubbling.',
                'How do you optimize website performance?'
            ],
            backend: [
                'What is a REST API?',
                'Explain SQL vs NoSQL.',
                'What is middleware?',
                'Describe authentication vs authorization.',
                'How does HTTP work?',
                'What is Docker?',
                'Explain microservices.',
                'What is caching?',
                'Describe ACID properties.',
                'How do you handle errors in Node.js?'
            ],
            fullstack: [
                'What is MERN stack?',
                'Explain CORS.',
                'How do you deploy a fullstack app?',
                'What is JWT?',
                'Describe MVC pattern.',
                'How to secure APIs?',
                'What is GraphQL?',
                'Explain database indexing.',
                'How do you handle real-time data?',
                'What is CI/CD?'
            ],
            devops: [
                'What is DevOps?',
                'Explain CI/CD pipeline.',
                'What is Kubernetes?',
                'Describe Jenkins.',
                'How does Ansible work?',
                'What is monitoring?',
                'Explain IaC.',
                'What is Terraform?',
                'Describe blue-green deployment.',
                'How to secure cloud resources?'
            ],
            data: [
                'What is machine learning?',
                'Explain supervised vs unsupervised learning.',
                'What is overfitting?',
                'Describe pandas.',
                'What is SQL join?',
                'Explain feature engineering.',
                'What is cross-validation?',
                'Describe neural networks.',
                'How to handle missing data?',
                'What is A/B testing?'
            ]
        };

        this.currentRole = '';
        this.currentQuestionIndex = 0;
        this.totalQuestions = 10;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.transcript = '';

        this.initElements();
        this.initSpeech();
        this.loadHistory();
        this.showUserInfo();
    }

    initElements() {
        this.roleSelect = document.getElementById('role-select');
        this.startBtn = document.getElementById('start-interview');
        this.interviewArea = document.getElementById('interview-area');
        this.roleSelection = document.getElementById('role-selection');
        this.recordBtn = document.getElementById('record-btn');
        this.submitBtn = document.getElementById('submit-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.endBtn = document.getElementById('end-interview');
        this.questionDisplay = document.getElementById('question-display');
        this.transcriptEl = document.getElementById('transcript');
        this.feedbackEl = document.getElementById('feedback');
        this.questionNum = document.getElementById('question-num');
        this.timerDisplay = document.createElement('span');
        this.timerDisplay.id = 'timer-display';
        this.questionNum.parentNode.appendChild(this.timerDisplay);
        this.timerId = null;
        this.timeLeft = 0;
        this.isRecording = false;
        this.historyList = document.getElementById('history-list');
        this.historySection = document.getElementById('history');

        this.startBtn.addEventListener('click', () => this.startInterview());
        this.recordBtn.addEventListener('click', () => this.toggleRecording());
        this.submitBtn.addEventListener('click', () => this.getFeedback());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.endBtn.addEventListener('click', () => this.endInterview());
    }

    initSpeech() {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.recordBtn.classList.add('recording');
                this.recordBtn.textContent = '🔴 Stop Recording';
            };

            this.recognition.onresult = (event) => {
                let interim = '';
                let final = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        final += event.results[i][0].transcript;
                    } else {
                        interim += event.results[i][0].transcript;
                    }
                }
                this.transcript = final || interim;
                this.updateTranscript();
            };

            this.recognition.onend = () => {
                this.recordBtn.classList.remove('recording');
                this.recordBtn.textContent = '🎤 Record Answer';
                this.submitBtn.classList.remove('hidden');
            };
        } else {
            console.warn('Speech recognition not supported');
            this.recordBtn.textContent = 'Text Input Fallback';
        }
    }

    startInterview() {
        this.currentRole = this.roleSelect.value;
        this.currentQuestionIndex = 0;
        this.roleSelection.classList.add('hidden');
        this.interviewArea.classList.remove('hidden');
        this.historySection.classList.remove('hidden');
        this.nextQuestion();
    }

    nextQuestion() {
        if (this.currentQuestionIndex >= this.totalQuestions) {
            this.endInterview();
            return;
        }

        this.hideElements();
        const q = this.questions[this.currentRole][this.currentQuestionIndex];
        this.questionDisplay.textContent = q;
        this.questionNum.textContent = `Question ${this.currentQuestionIndex + 1}/${this.totalQuestions}`;
        this.timerDisplay.textContent = '05:00';
        this.startTimer(300);
        this.speak(q);
        this.currentQuestionIndex++;
    }

    toggleRecording() {
        if (this.recognition) {
            if (this.recognition.running) {
                this.recognition.stop();
            } else {
                this.recognition.start();
            }
        } else {
            const answer = prompt('Enter your answer:');
            if (answer) {
                this.transcript = answer;
                this.updateTranscript();
                this.submitBtn.classList.remove('hidden');
            }
        }
    }

    getFeedback() {
        if (!this.transcript || this.transcript.trim().length < 5) {
            const explanation = `Question explanation: ${this.getQuestionExplanation()}. Suggested answer: Practice this by preparing a 30-60 second response with your experience.`;
            this.showFeedback(explanation);
            this.speak(explanation);
        } else {
            const feedback = this.generateFeedback(this.transcript);
            this.showFeedback(feedback);
            this.speak(feedback);
        }
        this.nextBtn.classList.remove('hidden');
    }

    getQuestionExplanation() {
        const explanations = {
            frontend: [
                '30-second professional summary: role, skills, achievement.',
                'var: function/block hoisted. let/const: block scoped, TDZ.',
                'JS library for UI components. Virtual DOM performance.',
                'JS DOM copy. Diffing minimizes real DOM changes.',
                'useState/local, Context/Redux/global.',
                'CSS one-D layout. flex-direction/justify-content.',
                'HTTP stateless CRUD with methods/status codes.',
                'Media queries, fluid layouts for devices.',
                'Events bubble up DOM. stopPropagation stops.',
                'Minify, lazy load, cache, CDN, reduce requests.'
            ],
            backend: [
                    'HTTP methods for stateless resource CRUD.',
                    'SQL structured/relations, NoSQL flexible/scalable.',
                    'Functions between request/response pipeline.',
                    'Auth: who you are, Authz: what you can do.',
                    'Request/response protocol, methods/status codes.',
                    'Containerization platform.',
                    'Independent services communication.',
                    'Store frequent data access.',
                    'Atomicity, Consistency, Isolation, Durability.',
                    'Try/catch, error middleware.'
                ]
                // Add fullstack, devops, data
        };
        const currentQ = this.questions[this.currentRole][this.currentQuestionIndex - 1];
        return explanations[this.currentRole] ? explanations[this.currentRole][this.questions[this.currentRole].indexOf(currentQ)] : 'Prepare your response.';
    }

    generateFeedback(transcript) {
        const keywords = ['experience', 'project', 'team', 'challenge', 'solution', 'react', 'node', 'docker', 'sql', 'flexbox', 'kubernetes', 'pandas'];
        const lowerTranscript = transcript.toLowerCase();
        const matched = keywords.filter(kw => lowerTranscript.includes(kw)).length;
        if (matched >= 5) return 'Excellent! Your answer is comprehensive, structured, and demonstrates deep understanding with relevant examples.';
        if (matched >= 3) return 'Good job! Solid response, but add more specific examples or technical details for excellence.';
        if (matched >= 1) return 'Fair answer. Try incorporating key technical terms and personal experiences to strengthen it.';
        return 'Consider the question more deeply and include relevant concepts or examples from your experience.';
    }

    showFeedback(text) {
        this.feedbackEl.textContent = text;
        this.feedbackEl.classList.remove('hidden');
    }

    updateTranscript() {
        this.transcriptEl.textContent = this.transcript;
        this.transcriptEl.classList.remove('hidden');
    }

    speak(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.lang = 'en-US';
        this.synthesis.speak(utterance);
    }

    hideElements() {
        this.submitBtn.classList.add('hidden');
        this.nextBtn.classList.add('hidden');
        this.transcriptEl.classList.add('hidden');
        this.feedbackEl.classList.add('hidden');
        this.transcript = '';
    }

    endInterview() {
        this.speak('Interview complete! Review your feedback.');
        const historyItem = {
            role: this.currentRole,
            feedback: this.feedbackEl.textContent || 'Interview complete',
            date: new Date().toLocaleString()
        };
        this.saveHistory(historyItem);
        this.updateHistory();
        alert('Interview ended! Feedback saved in history.');
        location.reload();
    }

    saveHistory(item) {
        const userEmail = AuthManager.getUser().email;
        let history = JSON.parse(localStorage.getItem(`history_${userEmail}`) || '[]');
        history.push(item);
        localStorage.setItem(`history_${userEmail}`, JSON.stringify(history));
    }

    loadHistory() {
        const userEmail = AuthManager.getUser().email;
        const history = JSON.parse(localStorage.getItem(`history_${userEmail}`) || '[]');
        this.updateHistory(history);
    }

    updateHistory(history = null) {
        if (!history) history = JSON.parse(localStorage.getItem(`history_${AuthManager.getUser().email}`) || '[]');
        this.historyList.innerHTML = '';
        history.slice(-5).reverse().forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.role}: ${item.feedback.substring(0, 50)}... (${new Date(item.date).toLocaleDateString()})`;
            this.historyList.appendChild(li);
        });
    }

    showUserInfo() {
        const user = AuthManager.getUser();
        const header = document.querySelector('header p');
        header.textContent += ` | Welcome, ${user.name}!`;
        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Logout';
        logoutBtn.onclick = AuthManager.logout;
        logoutBtn.style.marginLeft = '10px';
        logoutBtn.style.background = '#ff4757';
        logoutBtn.style.border = 'none';
        logoutBtn.style.padding = '5px 10px';
        logoutBtn.style.borderRadius = '5px';
        logoutBtn.style.cursor = 'pointer';
        header.parentNode.appendChild(logoutBtn);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (!AuthManager.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    new InterviewSimulator();
});