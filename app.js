/** @jsxImportSource https://esm.sh/react@18.2.0 */
import React, { useState, useEffect } from "https://esm.sh/react@18.2.0";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";

function TestCaseManager() {
  const [testCases, setTestCases] = useState([]);
  const [newTestCase, setNewTestCase] = useState({
    title: "",
    description: "",
    status: "Not Started",
    priority: "Medium"
  });

  useEffect(() => {
    fetchTestCases();
  }, []);

  async function fetchTestCases() {
    try {
      const response = await fetch("/test-cases");
      const cases = await response.json();
      setTestCases(cases);
    } catch (error) {
      console.error("Failed to fetch test cases", error);
    }
  }

  async function addTestCase(e) {
    e.preventDefault();
    try {
      const response = await fetch("/test-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTestCase)
      });
      if (response.ok) {
        fetchTestCases();
        setNewTestCase({ title: "", description: "", status: "Not Started", priority: "Medium" });
      }
    } catch (error) {
      console.error("Failed to add test case", error);
    }
  }

  async function deleteTestCase(id) {
    try {
      const response = await fetch(`/test-cases/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchTestCases();
      }
    } catch (error) {
      console.error("Failed to delete test case", error);
    }
  }

  return (
    <div className="test-case-manager">
      <h1>🧪 Software Test Case Manager</h1>
      <form onSubmit={addTestCase}>
        <input
          type="text"
          placeholder="Test Case Title"
          value={newTestCase.title}
          onChange={(e) => setNewTestCase({...newTestCase, title: e.target.value})}
          required
        />
        <textarea
          placeholder="Test Case Description"
          value={newTestCase.description}
          onChange={(e) => setNewTestCase({...newTestCase, description: e.target.value})}
          required
        />
        <select 
          value={newTestCase.status}
          onChange={(e) => setNewTestCase({...newTestCase, status: e.target.value})}
        >
          <option>Not Started</option>
          <option>In Progress</option>
          <option>Passed</option>
          <option>Failed</option>
        </select>
        <select 
          value={newTestCase.priority}
          onChange={(e) => setNewTestCase({...newTestCase, priority: e.target.value})}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <button type="submit">Add Test Case</button>
      </form>

      <div className="test-case-list">
        {testCases.map((testCase) => (
          <div key={testCase.id} className="test-case-item">
            <h3>{testCase.title}</h3>
            <p>{testCase.description}</p>
            <div className="test-case-meta">
              <span>Status: {testCase.status}</span>
              <span>Priority: {testCase.priority}</span>
              <button onClick={() => deleteTestCase(testCase.id)}>🗑️ Delete</button>
            </div>
          </div>
        ))}
      </div>
      <a 
        href={import.meta.url.replace("esm.town", "val.town")} 
        target="_top" 
        style={{ color: '#888', textDecoration: 'none', fontSize: '0.8em' }}
      >
        View Source
      </a>
    </div>
  );
}

function App() {
  return <TestCaseManager />;
}

function client() {
  createRoot(document.getElementById("root")).render(<App />);
}
if (typeof document !== "undefined") { client(); }

export default async function server(request: Request): Promise<Response> {
  const { sqlite } = await import("https://esm.town/v/stevekrouse/sqlite");
  const KEY = new URL(import.meta.url).pathname.split("/").at(-1);
  const SCHEMA_VERSION = 1;

  await sqlite.execute(`
    CREATE TABLE IF NOT EXISTS ${KEY}_test_cases_${SCHEMA_VERSION} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT,
      priority TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  if (request.method === "GET" && new URL(request.url).pathname === "/test-cases") {
    const result = await sqlite.execute(`SELECT * FROM ${KEY}_test_cases_${SCHEMA_VERSION}`);
    return new Response(JSON.stringify(result.rows), {
      headers: { "Content-Type": "application/json" }
    });
  }

  if (request.method === "POST" && new URL(request.url).pathname === "/test-cases") {
    const testCase = await request.json();
    await sqlite.execute(
      `INSERT INTO ${KEY}_test_cases_${SCHEMA_VERSION} (title, description, status, priority) VALUES (?, ?, ?, ?)`,
      [testCase.title, testCase.description, testCase.status, testCase.priority]
    );
    return new Response("Test case added", { status: 201 });
  }

  if (request.method === "DELETE" && /^\/test-cases\/\d+$/.test(new URL(request.url).pathname)) {
    const id = new URL(request.url).pathname.split("/").pop();
    await sqlite.execute(`DELETE FROM ${KEY}_test_cases_${SCHEMA_VERSION} WHERE id = ?`, [id]);
    return new Response("Test case deleted", { status: 200 });
  }

  return new Response(`
    <html>
      <head>
        <title>Software Test Case Manager</title>
        <style>${css}</style>
      </head>
      <body>
        <div id="root"></div>
        <script src="https://esm.town/v/std/catch"></script>
        <script type="module" src="${import.meta.url}"></script>
      </body>
    </html>
  `, {
    headers: { "Content-Type": "text/html" }
  });
}

const css = `
body {
  font-family: system-ui, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f4f4f4;
}

.test-case-manager {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

input, textarea, select, button {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.test-case-list {
  display: grid;
  gap: 10px;
}

.test-case-item {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 4px;
}

.test-case-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}
`;
