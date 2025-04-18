# MCP Weather Service

A Model Context Protocol (MCP) server that provides weather data through a simple tool interface. This service uses the Open-Meteo API to provide real-time weather information without requiring any API keys.

## Features

- Implements MCP protocol for weather data access
- Uses Open-Meteo API (free, no API key required)
- Provides:
  - Temperature (°C)
  - Humidity (%)
  - Wind speed (m/s)
  - Detailed weather descriptions
- No API key or registration required
- Easy integration with Cursor MCP

## Installation

You can use this weather service in several ways:

### 1. Direct from GitHub (Recommended)

Add this to your Cursor's `cursor.json`:
```json
{
  "mcp": {
    "servers": {
      "weather": {
        "command": "npx",
        "args": ["github:yourusername/mcp-weather"],
        "transport": "stdio"
      }
    }
  }
}
```

### 2. Global Installation

```bash
npm install -g mcp-weather
```

Then in your `cursor.json`:
```json
{
  "mcp": {
    "servers": {
      "weather": {
        "command": "mcp-weather",
        "transport": "stdio"
      }
    }
  }
}
```

### 3. Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mcp-weather.git
cd mcp-weather
```

2. Install dependencies:
```bash
npm install
```

3. Add to your `cursor.json`:
```json
{
  "mcp": {
    "servers": {
      "weather": {
        "command": "tsx",
        "args": ["path/to/mcp-weather/src/index.ts"],
        "transport": "stdio"
      }
    }
  }
}
```

## Usage in Cursor

Once configured in your `cursor.json`, you can use the weather service in your code:

```typescript
// Get weather for a specific location
const weather = await cursor.mcp.callTool("weather/getWeather", {
  location: "London"
});

// Example response:
{
  "temperature": 12.5,      // Temperature in Celsius
  "humidity": 76,           // Humidity percentage
  "description": "Cloudy",  // Human-readable weather description
  "windSpeed": 4.2         // Wind speed in meters per second
}
```

## Weather Descriptions

The service provides detailed weather descriptions including:
- Clear sky
- Mainly clear
- Partly cloudy
- Overcast
- Foggy
- Light/Moderate/Dense drizzle
- Slight/Moderate/Heavy rain
- Snow (various intensities)
- Thunderstorms
- And more...

## Development

For local development:
```bash
# Start the server
npm start

# Run in development mode (with auto-reload)
npm run dev

# Test the client
npm test
```

## API Provider

This service uses the [Open-Meteo API](https://open-meteo.com/), which is:
- Free to use
- Requires no API key
- Has no rate limits
- Provides accurate weather data worldwide

## How It Works

1. When you request weather for a location, the service first uses Open-Meteo's Geocoding API to convert the location name to coordinates.
2. Then it uses these coordinates to fetch current weather data from Open-Meteo's Weather API.
3. The data is formatted and returned through the MCP interface.

## Error Handling

The service handles various error cases:
- Invalid location names
- API connection issues
- Rate limiting
- Invalid responses

Each error returns a clear message explaining what went wrong.

## License

MIT 

## Integration with AI Agents and Chatbots

You can integrate this weather service into your AI agents and chatbots in several ways:

### 1. Direct MCP Integration

If your AI agent supports MCP, you can register the weather service as a tool:

```typescript
const weatherTool = {
  name: "weather/getWeather",
  description: "Get current weather data for a location",
  parameters: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "The city or location to get weather for"
      }
    },
    required: ["location"]
  }
};

// Example agent configuration
const agent = new Agent({
  tools: [weatherTool],
  // ... other configuration
});

// Example usage in agent
const response = await agent.run(`
  To handle "what's the weather in Paris?":
  1. Call weather/getWeather with location="Paris"
  2. Format the response in natural language
`);
```

### 2. HTTP API Wrapper

You can wrap the MCP server in an HTTP API for non-MCP agents:

```typescript
import express from 'express';
import { Client } from '@modelcontextprotocol/sdk/client';

const app = express();
app.get('/weather/:city', async (req, res) => {
  const weather = await mcpClient.callTool("weather/getWeather", {
    location: req.params.city
  });
  res.json(weather);
});

// Then use in your agent:
const weather = await fetch(`http://your-api/weather/London`);
```

### 3. Function Calling

For AI models that support function calling (like GPT-4), define the weather function:

```typescript
const functions = [{
  name: "get_weather",
  description: "Get current weather for a location",
  parameters: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "City name"
      }
    },
    required: ["location"]
  }
}];

// Example with OpenAI
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "What's the weather in Tokyo?" }],
  functions,
  function_call: "auto"
});
```

### 4. Claude Tool Definition

For Claude and similar AI assistants, define the tool in their format:

```typescript
const weatherTool = {
  "name": "get_weather",
  "description": "Get current weather data for a location using the MCP weather service",
  "parameters": {
    "properties": {
      "location": {
        "description": "The city or location name",
        "type": "string"
      }
    },
    "required": ["location"]
  }
};
```

### Example Agent Prompts

Here are some example prompts for different scenarios:

1. Basic weather query:
```
When the user asks about weather, call weather/getWeather with their location
and format the response like: "It's [temperature]°C in [location] with [description]"
```

2. Weather comparison:
```
To compare weather between cities:
1. Get weather for first city
2. Get weather for second city
3. Compare temperature, humidity, and conditions
```

3. Weather-based recommendations:
```
To suggest activities:
1. Get weather data for the location
2. Based on temperature and conditions, recommend appropriate activities
```

### Best Practices

1. **Error Handling**: Always handle potential errors from the weather service:
   - Location not found
   - Service unavailable
   - Invalid responses

2. **Natural Language**: Convert the technical response into natural language:
```typescript
// Instead of showing raw data:
{temperature: 20, humidity: 65}

// Format it as:
"It's a pleasant 20°C with 65% humidity"
```

3. **Context Retention**: Store the last queried location for follow-up questions:
```typescript
let lastLocation = null;

// When user asks "How's the weather?"
if (question.includes("weather")) {
  const location = extractLocation(question) || lastLocation;
  lastLocation = location;
  // ... get weather
}
```

4. **Rate Limiting**: Implement rate limiting to avoid overloading the service:
```typescript
const rateLimiter = new RateLimiter({
  maxRequests: 60,
  perMinute: 1
});

async function getWeather(location) {
  await rateLimiter.waitForToken();
  return mcpClient.callTool("weather/getWeather", { location });
}
```

## Using in AI Agents

You can use this weather service in your AI agents using the MCP client. Here's how:

### 1. Setup MCP Client

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Initialize MCP client
const client = new Client({
  name: 'weather-agent',
  version: '1.0.0'
});

// Connect to the weather service
const transport = new StdioClientTransport({
  command: 'mcp-weather', // or 'npx mcp-weather' if using npx
});

await client.connect(transport);
```

### 2. Call Weather Tool in Your Agent

```typescript
async function getWeather(location: string) {
  try {
    const result = await client.callTool({
      name: 'getWeather',
      arguments: { location }
    });

    if (result?.content?.[0]?.text) {
      return JSON.parse(result.content[0].text);
    }
    return null;
  } catch (error) {
    console.error('Weather service error:', error);
    return null;
  }
}

// Example agent handler
async function handleWeatherQuery(userQuery: string) {
  // Extract location from user query
  const location = extractLocation(userQuery); // Your location extraction logic
  
  const weather = await getWeather(location);
  if (weather) {
    return `It's ${weather.temperature}°C in ${location} with ${weather.description}. ` +
           `The humidity is ${weather.humidity}% and wind speed is ${weather.windSpeed} m/s.`;
  }
  return "Sorry, I couldn't get the weather information.";
}
```

### 3. Example Agent Implementation

```typescript
class WeatherAgent {
  private mcpClient: Client;
  private lastLocation: string | null = null;

  constructor() {
    this.mcpClient = new Client({
      name: 'weather-agent',
      version: '1.0.0'
    });
  }

  async connect() {
    const transport = new StdioClientTransport({
      command: 'mcp-weather'
    });
    await this.mcpClient.connect(transport);
  }

  async handleMessage(message: string): Promise<string> {
    // Simple weather query detection
    if (message.toLowerCase().includes('weather')) {
      const location = this.extractLocation(message) || this.lastLocation;
      if (!location) {
        return "Which city would you like to know the weather for?";
      }
      
      this.lastLocation = location;
      return await this.getWeatherResponse(location);
    }
    
    return "I can help you check the weather. Just ask about any city!";
  }

  private async getWeatherResponse(location: string): Promise<string> {
    try {
      const result = await this.mcpClient.callTool({
        name: 'getWeather',
        arguments: { location }
      });

      if (result?.content?.[0]?.text) {
        const weather = JSON.parse(result.content[0].text);
        return this.formatWeatherResponse(location, weather);
      }
      
      return `Sorry, I couldn't find weather information for ${location}.`;
    } catch (error) {
      console.error('Error fetching weather:', error);
      return "Sorry, there was an error getting the weather information.";
    }
  }

  private formatWeatherResponse(location: string, weather: any): string {
    return `Current weather in ${location}:
• Temperature: ${weather.temperature}°C
• Conditions: ${weather.description}
• Humidity: ${weather.humidity}%
• Wind Speed: ${weather.windSpeed} m/s`;
  }

  private extractLocation(message: string): string | null {
    // Simple location extraction - you might want to use a more sophisticated method
    const words = message.split(' ');
    const inIndex = words.indexOf('in');
    if (inIndex !== -1 && inIndex < words.length - 1) {
      return words[inIndex + 1];
    }
    return null;
  }
}

// Usage example:
const agent = new WeatherAgent();
await agent.connect();

// Handle user messages
const response = await agent.handleMessage("What's the weather in London?");
console.log(response);
```

### Key Points

1. **Connection**: Always maintain a single MCP client connection for multiple queries
2. **Error Handling**: Handle API errors gracefully
3. **Context**: Store the last queried location for follow-up questions
4. **Formatting**: Format the weather data in a user-friendly way

The MCP client handles all the communication with the weather service, making it easy to integrate weather functionality into your AI agent. 