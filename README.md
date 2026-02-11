# 🧠 Symptor – 3D Medical Symptom Visualizer

Symptor is an **advanced MERN-based medical visualization web application** that allows users to explore the human body in **3D**, enter symptoms or pain areas, and visually understand which **body parts or organs are affected**.

⚠️ This application is **educational and informational only** and **not a medical diagnosis tool**.

---

## 🚀 Features

### 🔐 Authentication
- Secure user **Sign Up / Login**
- JWT-based authentication
- Protected routes
- User session management

---

### 🧍‍♂️ 3D Human Anatomy Visualizer
- Realistic **GLB human anatomy model**
- Interactive **rotate, zoom, and inspect**
- Optimized for web performance
- Camera auto-fit & centering for tall anatomy models
- Smooth OrbitControls with restricted angles

---

### 🎯 Symptom & Pain-Based Highlighting
- Enter symptoms (e.g., headache, chest pain, leg pain)
- Select specific pain areas
- Automatically **highlights affected organs/body parts** in the 3D model
- Rule-based mapping (no AI / ML)

Examples:
- Headache → Brain highlighted
- Chest pain → Heart & lungs highlighted
- Leg pain → Leg muscles / bones highlighted

---

### 🩺 Symptom Checker
- Searchable symptom input
- Supports **all body systems** (not limited to nervous system)
- Disease-to-organ mapping using backend logic
- Severity indicators & guidance

---

### 💬 Medical Chatbot (Rule-Based)
- Context-aware chatbot
- Asks follow-up questions based on symptoms
- Explains affected systems and organs
- Stores chat history per user
- No external AI APIs used

---

### 🧑‍💼 Admin Capabilities
- Manage diseases, symptoms, and organ mappings
- Fully configurable without code changes
- Scalable rule-based architecture

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Three.js
- @react-three/fiber & drei
- Tailwind CSS / CSS Modules

### Backend
- Node.js
- Express.js
- JWT Authentication
- Bcrypt for password hashing

### Database
- MongoDB (Mongoose)

### 3D
- GLTF / GLB anatomy models
- Bounding-box based centering & scaling
- Optimized rendering & lazy loading

---

## 🧱 Project Structure

```

medical_auth_app/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── App.jsx
│   └── public/models/
│       └── human.glb
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   └── server.js
│
└── README.md

````

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Sanjeev032/Symptor.git
cd Symptor
````

### 2️⃣ Install Dependencies

#### Backend

```bash
cd server
npm install
```

#### Frontend

```bash
cd client
npm install
```

---

### 3️⃣ Environment Variables

Create a `.env` file in `server/`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

### 4️⃣ Run the Application

#### Backend

```bash
cd server
npm run dev
```

#### Frontend

```bash
cd client
npm run dev
```

---

## ⚠️ Disclaimer

> This application does not provide medical diagnosis or treatment.
> Always consult a qualified healthcare professional for medical concerns.

---

## 🎯 Why This Project Is Special

* Advanced **3D medical visualization**
* Pure **MERN stack** (no Python, no ML)
* Real-world healthcare architecture
* Rule-based intelligence
* Performance-optimized anatomy rendering
* Interview & portfolio ready

---

## 📌 Future Enhancements

* Severity-based color gradients
* Zoom-to-organ animation
* Multi-language support
* Mobile gesture optimization
* Export health reports (PDF)

