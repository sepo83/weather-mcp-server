# MCP Weather Service

A Model Context Protocol (MCP) server that provides weather data through a simple tool interface. This service uses the Open-Meteo API to provide real-time weather information without requiring any API keys.

## Installation

```bash
# Global installation
npm install -g @rehmatalisayany/weather-mcp-server

# Or use directly with npx (recommended)
npx @rehmatalisayany/weather-mcp-server
```

## Quick Start

### 1. Add to Cursor MCP

Add this to your `cursor.json`:
```json
{
  "mcp": {
    "servers": {
      "weather": {
        "command": "npx",
        "args": ["@rehmatalisayany/weather-mcp-server"],
        "transport": "stdio"
      }
    }
  }
}
```

### 2. Use in Your Code

```typescript
// In your Cursor editor
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

## Using in AI Agents

### Basic Setup

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

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
    // Using the npm package
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['@rehmatalisayany/weather-mcp-server']
    });
    await this.mcpClient.connect(transport);
  }

  async getWeather(location: string): Promise<string> {
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
      console.error('Error:', error);
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
}
```

### Example Usage

```typescript
// Initialize and connect
const agent = new WeatherAgent();
await agent.connect();

// Get weather
const response = await agent.getWeather("London");
console.log(response);

// Example output:
// Current weather in London:
// • Temperature: 12.5°C
// • Conditions: Cloudy
// • Humidity: 76%
// • Wind Speed: 4.2 m/s
```

### Advanced Implementation

Here's a more complete agent implementation with message handling and context retention:

```typescript
class AdvancedWeatherAgent {
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
      command: 'npx',
      args: ['@rehmatalisayany/weather-mcp-server']
    });
    await this.mcpClient.connect(transport);
  }

  async handleMessage(message: string): Promise<string> {
    // Handle weather queries
    if (message.toLowerCase().includes('weather')) {
      const location = this.extractLocation(message) || this.lastLocation;
      if (!location) {
        return "Which city would you like to know the weather for?";
      }
      
      this.lastLocation = location;
      return await this.getWeatherResponse(location);
    }
    
    // Handle follow-up questions
    if (this.lastLocation && message.toLowerCase().includes('how about tomorrow')) {
      return "I can only provide current weather information.";
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
      console.error('Error:', error);
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
    const words = message.split(' ');
    const inIndex = words.indexOf('in');
    if (inIndex !== -1 && inIndex < words.length - 1) {
      return words[inIndex + 1];
    }
    return null;
  }
}

// Usage example:
const agent = new AdvancedWeatherAgent();
await agent.connect();

// Handle various queries
console.log(await agent.handleMessage("What's the weather in Tokyo?"));
console.log(await agent.handleMessage("How about tomorrow?")); // Uses context
console.log(await agent.handleMessage("What's the weather?")); // Uses last location
```

## Features

- Real-time weather data using Open-Meteo API (free, no API key required)
- Temperature in Celsius
- Humidity percentage
- Wind speed in m/s
- Detailed weather descriptions
- Error handling
- Context retention for follow-up questions

## Weather Descriptions

Available weather descriptions include:
- Clear sky
- Mainly clear
- Partly cloudy
- Overcast
- Foggy
- Light/Moderate/Dense drizzle
- Rain (various intensities)
- Snow (various intensities)
- Thunderstorms

## NPM Package

This package is available on npm as [@rehmatalisayany/weather-mcp-server](https://www.npmjs.com/package/@rehmatalisayany/weather-mcp-server).

## License

MIT 