#!/usr/bin/env tsx
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import fetch from 'node-fetch';
import { z } from 'zod';

interface GeocodingResult {
  results?: Array<{
    latitude: number;
    longitude: number;
  }>;
}

interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
}
interface DailyWeatherData {
  daily: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    wind_speed_10m: number[];
    weather_code: number[];
  };
}


// Weather API configuration
const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

// Helper function to convert weather codes to descriptions
function getWeatherDescription(code: number): string {
  const weatherCodes: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return weatherCodes[code] || 'Unknown';
}

async function main() {
  // Initialize the MCP server
  const server = new McpServer({
    name: 'weather-server',
    version: '1.0.0'
  });

  // Add weather tool using the new syntax
  server.tool(
  "getWeather",
  {
    location: z.string().describe("The location to get weather data for (city name)"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("The date to get weather data for (YYYY-MM-DD)")
  },
  async ({ location, date }) => {
    try {
      // 1. Koordinaten holen
      const geocodingResponse = await fetch(
        `${GEOCODING_API_URL}?name=${encodeURIComponent(location)}&count=1`
      );
      if (!geocodingResponse.ok) {
        return {
          content: [{ type: "text", text: `Geocoding API error: ${geocodingResponse.statusText}` }]
        };
      }
      const geocodingData = await geocodingResponse.json() as GeocodingResult;
      if (!geocodingData.results || geocodingData.results.length === 0) {
        return {
          content: [{ type: "text", text: "Location not found" }]
        };
      }
      const { latitude, longitude } = geocodingData.results[0];

      // 2. Datum als YYYY-MM-DD-String
      const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;

      // 3. Wetterdaten holen
      const weatherResponse = await fetch(
        `${WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&start_date=${dateStr}&end_date=${dateStr}&timezone=auto`
      );
      if (!weatherResponse.ok) {
        return {
          content: [{ type: "text", text: `Weather API error: ${weatherResponse.statusText}` }]
        };
      }
      const weatherData = await weatherResponse.json() as DailyWeatherData;

      // 4. Das richtige Tages-Array-Element finden
      const idx = weatherData.daily.time.findIndex((d: string) => d === dateStr);
      if (idx === -1) {
        return {
          content: [{ type: "text", text: `No weather data for ${dateStr}` }]
        };
      }

      const weatherDescription = getWeatherDescription(weatherData.daily.weather_code[idx]);

      const weatherInfo = {
        date: dateStr,
        temperature: weatherData.daily.temperature_2m[idx],
        humidity: weatherData.daily.relative_humidity_2m[idx],
        windSpeed: weatherData.daily.wind_speed_10m[idx],
        description: weatherDescription
      };

      return {
        content: [{
          type: "text",
          text: JSON.stringify(weatherInfo, null, 2)
        }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: "text",
          text: `Error fetching weather data: ${errorMessage}`
        }]
      };
    }
  }
);


  // Create and connect the transport
  const transport = new StdioServerTransport();
  
  try {
    await server.connect(transport);
    console.error('Weather server ready to accept commands via stdin/stdout');
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Run the server
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 
