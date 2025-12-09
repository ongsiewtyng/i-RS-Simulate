# i-RS-Simulate

A mock of i-RS web for client demo — a lightweight simulation environment for front-end / client testing and demonstration.  

---

## 🚀 Why This Project Exists

- **Purpose:** Provide a mock version of i-RS web so clients and frontend developers can test and demo UI without depending on the real backend.  
- **When to use:** Useful during development, UI prototyping, or client demos — especially when the real backend is unavailable or unstable.  
- **Benefits:** Fast setup, no external dependencies (aside from the mock), clear isolation between frontend and underlying services, making demos/reviews more predictable and stable.

---

## 🔧 Features

- Mocked endpoints simulating behavior of i-RS backend  
- Configurable data responses (supports customization via JSON / code)  
- Easy to run locally — minimal setup required  
- Written in TypeScript (frontend + mock server), easily extendable  

---

## 📦 Getting Started (Run Locally)

### Prerequisites

- Node.js (v16+ recommended)  
- A valid `GEMINI_API_KEY` (if you plan to integrate with external services)

### Installation & Running

```bash
git clone https://github.com/ongsiewtyng/i-RS-Simulate.git
cd i-RS-Simulate
npm install
````

Create a `.env.local` (or equivalent) file and set the environment variable:

```
GEMINI_API_KEY=your_api_key_here
```

Then run:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) (or configured port) to view the mock client UI.

---

## 📝 Project Structure

```
i-RS-Simulate/
├── components/       # React / UI components
├── services/         # Mock service layer / API mocks
├── App.tsx           # Main app entry
├── index.tsx         # React entry point
├── constants.ts      # Config/constants for mocking
├── metadata.json     # Metadata & configuration
├── vite.config.ts    # Build configuration
└── ...               # Other files and configs
```

This structure makes it easy to locate UI components vs mock logic vs configuration.

---

## 🧪 Usage & Examples

Here’s a basic example of how you might consume the mock API in code:

```ts
import { fetchMockData } from "./services/mockApi";

async function loadData() {
  const data = await fetchMockData();
  console.log("Mocked data:", data);
}
```

You can extend or override the mock responses in `services/` to simulate different backend behaviors (e.g. success, error, timeouts).

Please make sure to run `npm install` and `npm run dev` after changes to verify nothing breaks.


## 👤 Author & Acknowledgments

* Created by **ongsiewtyng**
* Based on the original idea for mocking client-side behavior for i-RS web

---

## 🧠 Notes & Limitations

* This mock is meant for **frontend demos and testing only** — do **not** use it for production or as a real backend.
* Mock data may not reflect real-world complexity or edge cases — use with caution.
* External service integrations (if any) may still require real API keys or proper configuration.
