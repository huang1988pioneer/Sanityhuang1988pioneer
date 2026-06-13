const TABLES = ["cronsanity"];

export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 32, lineHeight: 1.6 }}>
      <h1>Sanityhuang1988pioneer Tables</h1>
      <p>Available Appwrite table schemas:</p>
      <ul>
        {TABLES.map((table) => (
          <li key={table}>
            <code>{table}</code>
          </li>
        ))}
      </ul>
      <p>
        Create table endpoint: <code>/api/create-table?table=cronsanity</code>
      </p>
    </main>
  );
}
