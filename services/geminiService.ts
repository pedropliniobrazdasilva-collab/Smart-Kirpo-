
const fallbackQuote = "Acredite em você mesmo e em tudo que você é. Saiba que existe algo dentro de você que é maior que qualquer obstáculo.";

const fetchMotivationalQuote = async (): Promise<string> => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'quote' }),
    });

    if (!response.ok) {
      console.error("Error fetching motivational quote from proxy:", response.statusText);
      return fallbackQuote;
    }
    
    const data = await response.json();
    if (data.text) {
        return data.text.trim();
    }
    return fallbackQuote;

  } catch (error) {
    console.error("Error fetching motivational quote:", error);
    return fallbackQuote;
  }
};

export default fetchMotivationalQuote;
