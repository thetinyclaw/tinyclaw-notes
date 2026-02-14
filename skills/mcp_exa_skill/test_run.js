// Tiny test harness for MCP-EXA skill
const { main } = require('./index');

(async () => {
  const query = "Find latest research on exa AI capabilities";
  const tools = ["web_search_exa", "get_code_context_exa"];
  try {
    const result = await main(query, tools);
    console.log("TEST RESULT:", JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("TEST FAILED:", e);
  }
})();
