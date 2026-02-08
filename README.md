
# Seven Doors to Hell 🚪🔥

**Seven Doors to Hell** is an immersive, browser-based Augmented Reality (AR) horror arcade experience. It combines real-time computer vision (TensorFlow.js & MediaPipe) with Generative AI (Google Gemini) to transform your webcam feed into a series of interactive nightmares.

Turn off the lights, allow camera access, and see if you can survive the rituals.

## 🕹️ The Seven Doors (Game Modes)

1.  **👻 Ghost in the Mirror**
    *   **The Ritual:** Look directly at your reflection to summon the entity.
    *   **Defense:** If the ghost gets too close, wave your hand to banish it back into the darkness.
    *   **Tech:** Uses face attention detection and hand tracking.

2.  **🌀 Flying Ghosts (Swarm)**
    *   **The Ritual:** Spirits are drawn to your presence.
    *   **Control:** Move your index finger in a circular motion to cast a spell, creating a vortex that controls the flight path of the spirits.
    *   **Tech:** Hand velocity tracking and particle physics.

3.  **🦇 Bat Catcher**
    *   **The Ritual:** The gates have opened, releasing vampire bats.
    *   **Objective:** Swat the bats with your hands before they escape.
    *   **Tech:** Collision detection between hand landmarks and moving sprites.

4.  **🗡️ Possession**
    *   **The Ritual:** An occult ceremony gone wrong.
    *   **Actions:** 
        *   *Head Bang:* Nod your head violently to fuse the mask to your face.
        *   *The Dagger:* Use your finger to wield the ritual dagger and poke the cursed eyes.
    *   **Tech:** Face landmark tracking (eyes/nose) and gesture recognition.

5.  **🦟 Mosquito Killer**
    *   **The Ritual:** Giant, mutated insects plague the swamp.
    *   **Weapons:**
        *   *Racket Mode:* Hold your hand up to summon an electric zapper.
        *   *Hands Mode:* Clap your real hands together to crush them.
    *   **Tech:** Hand skeleton tracking and multi-hand distance calculation.

6.  **🤡 Creepy Clown**
    *   **The Ritual:** A demonic jester hides in the dark void.
    *   **Objective:** Wait for him to peek out from the edges of the screen, then throw virtual tomatoes at him.
    *   **Tech:** Hand velocity history to detect "throwing" motions.

7.  **🐍 Snake Eater**
    *   **The Ritual:** Feed the serpent or become the meal.
    *   **Objective:** Use your index finger to guide the Viper's head to eat 10 rats within 60 seconds.
    *   **Failure:** If time runs out, the snake explodes.
    *   **Tech:** "Follow-the-leader" pathing algorithms and game loop timers.

---

## 🛠️ Technology Stack

*   **Frontend:** React, TypeScript, Tailwind CSS.
*   **Computer Vision:** 
    *   TensorFlow.js backend.
    *   MediaPipe Face Detection (for gaze and head tracking).
    *   MediaPipe Hands (for skeletal hand tracking and gestures).
*   **Generative AI:** 
    *   **Google Gemini 2.5 Flash Image:** Generates all game assets (ghosts, bats, snakes, items) on-the-fly at runtime, ensuring a unique visual style every time the app loads.
*   **Audio:** 
    *   **Web Audio API:** A custom procedural audio engine generates sound effects (screams, explosions, electrical zaps) using oscillators and noise buffers in real-time. No external MP3 files are used.

---

## 🚀 Getting Started

### Prerequisites

*   Node.js installed.
*   A webcam.
*   A Google Gemini API Key.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/seven-doors-to-hell.git
    cd seven-doors-to-hell
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add your API key:
    ```
    API_KEY=your_google_gemini_api_key_here
    ```

4.  **Run the application:**
    ```bash
    npm start
    ```

5.  **Open your browser:**
    Navigate to `http://localhost:3000` (or the port shown in your terminal).

---

## ⚠️ Troubleshooting

*   **Camera Issues:** Ensure you have granted the browser permission to access your webcam. The app requires a video feed to function.
*   **Loading Stuck:** The app generates assets using AI when a mode is selected. This may take a few seconds. If it hangs, check your internet connection and API Key quota.
*   **Performance:** This app uses heavy client-side processing for computer vision. For the best experience, use a device with hardware acceleration enabled (GPU).

---

## 📜 License

This project is open-source. Use it to scare your friends.
