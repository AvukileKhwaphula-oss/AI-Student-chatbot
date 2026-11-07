from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

training_data = [
    ("hello", "greeting"),
    ("hi", "greeting"),
    ("hey", "greeting"),
    ("good morning", "greeting"),
    ("good afternoon", "greeting"),
    ("how are you", "greeting"),
    ("hello unibot", "greeting"),

    #registration questions
    ("when does registration close", "registration"),
    ("when can I register", "registration"),
    ("registration dates", "registration"),
    ("how do I register", "registration"),
    ("when does CPUT registration open", "registration"),
    ("how can I complete my registration", "registration"),
    ("registration deadline", "registration"),
    ("I want to register", "registration"),
    ("how do I register online", "registration"),
    ("is registration open", "registration"),

    # Registration documents
    ("what documents do I need for registration", "registration_documents"),
    ("documents required for registration", "registration_documents"),
    ("registration documents", "registration_documents"),
    ("which documents must I submit", "registration_documents"),
    ("do I need a certified ID copy", "registration_documents"),
    ("what paperwork is required to register", "registration_documents"),
    ("what must I upload for registration", "registration_documents"),

    # NSFAS questions
    ("how do I apply for NSFAS", "nsfas"),
    ("NSFAS information", "nsfas"),
    ("financial aid", "nsfas"),
    ("NSFAS application", "nsfas"),
    ("how can I check my NSFAS status", "nsfas"),
    ("when does NSFAS open", "nsfas"),
    ("when will NSFAS pay me", "nsfas"),
    ("how do I get student funding", "nsfas"),
    ("NSFAS allowance", "nsfas"),
    ("I need financial assistance", "nsfas"),

    # Class timetable questions
    ("where can I find my class timetable", "timetable"),
    ("where can I see my timetable", "timetable"),
    ("when are my classes", "timetable"),
    ("what is my lecture timetable", "timetable"),
    ("how do I check my timetable", "timetable"),
    ("class schedule", "timetable"),
    ("lecture schedule", "timetable"),
    ("what time is my next class", "timetable"),
    ("my timetable", "timetable"),
    ("where is my class schedule", "timetable"),

    # Examinations questions
    ("when are exams", "exams"),
    ("exam timetable", "exams"),
    ("where can I find my exam timetable", "exams"),
    ("when do examinations start", "exams"),
    ("how do I check my examination timetable", "exams"),
    ("exam dates", "exams"),
    ("when am I writing my exams", "exams"),
    ("examination schedule", "exams"),

    #Student accommodation questions
    ("student accommodation", "accommodation"),
    ("where can I apply for accommodation", "accommodation"),
    ("accommodation information", "accommodation"),
    ("how do I apply for residence", "accommodation"),
    ("how can I get a room in residence", "accommodation"),
    ("CPUT student residence", "accommodation"),
    ("residence application dates", "accommodation"),
    ("is student accommodation available", "accommodation"),
    ("where can I stay as a student", "accommodation"),
    ("how do I apply for student housing", "accommodation"),

    # ICT Suport 
    ("I need IT help", "ict_support"),
    ("my computer is not working", "ict_support"),
    ("ICT support", "ict_support"),
    ("technical support", "ict_support"),
    ("I cannot connect to WiFi", "ict_support"),
    ("I forgot my student password", "ict_support"),
    ("I cannot log into the student portal", "ict_support"),
    ("my account is not working", "ict_support"),
    ("I have a computer problem", "ict_support"),
    ("I need help with software", "ict_support"),

    # General help
    ("help me", "general_help"),
    ("I need assistance", "general_help"),
    ("what can you help me with", "general_help"),
    ("what services do you provide", "general_help"),
    ("I have a question", "general_help"),
    ("I need student support", "general_help"),
]


training_sentences = [item[0] for item in training_data]
training_labels = [item[1] for item in training_data]

vectorizer = TfidfVectorizer(
    lowercase=True,
    ngram_range=(1, 2)
)

X = vectorizer.fit_transform(training_sentences)

model = LogisticRegression(max_iter=1000)
model.fit(X, training_labels)


def predict_intent(message):
    message = message.lower().strip()

    #Recognise NSFAS questions
    nsfas_keywords = [
        "nsfas",
        "financial aid",
        "financial funding",
        "student funding",
        "funding application",
        "funding status",
        "student allowance"
    ]

    if any(keyword in message for keyword in nsfas_keywords):
        return "nsfas", 1.0

    # Recognise exam questions
    exam_keywords = [
        "exam", "exams", "examination",
        "examinations", "writing my paper",
        "exam timetable"
    ]

    if any(keyword in message for keyword in exam_keywords):
        return "exams", 1.0

    # Recognise accommodation questions
    accommodation_keywords = [
        "accommodation", "residence",
        "student housing", "place to stay"
    ]

    if any(keyword in message for keyword in accommodation_keywords):
        return "accommodation", 1.0

    # Recognise class timetable questions
    timetable_keywords = [
        "class timetable", "lecture timetable",
        "class schedule", "lecture schedule",
        "lecture times", "my timetable",
        "my classes", "when are my classes"
    ]

    if any(keyword in message for keyword in timetable_keywords):
        return "class_timetable", 1.0

    # Use the machine-learning model for other questions
    message_vector = vectorizer.transform([message])
    probabilities = model.predict_proba(message_vector)[0]

    best_index = probabilities.argmax()
    intent = model.classes_[best_index]
    confidence = probabilities[best_index]

  
def get_response(intent, confidence):
    if confidence < 0.35:
        return (
            "I'm not sure I understood your question. Please try asking "
            "about NSFAS, registration, class timetables, examinations, "
            "accommodation, or ICT support."
        )

    responses = {
        "greeting": (
            "Hello! 👋 I'm UniBot, your CPUT student support assistant. "
            "How can I help you today?"
        ),

        "nsfas": (
            "You can apply for NSFAS funding through the official website: "
            "https://www.nsfas.org.za/. Create or sign in to your myNSFAS "
            "account, complete the required information, provide any "
            "requested supporting documents, review your details, and "
            "submit your application. Check the official NSFAS website "
            "for current application dates and requirements."
        ),

        "registration": (
            "For CPUT registration information, check the official CPUT "
            "website and your student portal for registration dates "
            "and instructions."
        ),

        "registration_documents": (
            "The documents required for registration can depend on your "
            "qualification and circumstances. Check the official CPUT "
            "registration instructions and your student portal."
        ),

        "class_timetable": (
            "Check your CPUT student portal or the official communication "
            "from your faculty for your class and lecture timetable."
        ),

        "exams": (
            "Check your CPUT student portal and faculty announcements "
            "for your examination timetable and examination instructions."
        ),

        "accommodation": (
            "For student accommodation information, check the official "
            "CPUT website and contact the university's student housing "
            "office for current application instructions."
        ),

        "ict_support": (
            "For ICT assistance, contact CPUT's official IT support "
            "service or consult the university's support channels."
        ),

        "general_help": (
            "I can help with NSFAS, registration, class timetables, "
            "examinations, accommodation, and ICT support. What would "
            "you like to know?"
        )
    }

    return responses.get(
        intent,
        "I can help with NSFAS, registration, class timetables, "
        "examinations, accommodation, and ICT support. Please rephrase "
        "your question."
    )
