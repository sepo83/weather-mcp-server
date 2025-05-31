# Weather MCP Server in TypeScript

A Model Context Protocol (MCP) server for fetching weather data using the Open-Meteo API. This server can be integrated with supergateway in oder to deliver a sse (Server Sent Events) interface (see Dockerfile), e.g. for usage with Home Assistant (see MCP https://www.home-assistant.io/integrations/mcp/)

## Usage

### As a Langchain Agent

```bash
https://github.com/rehmat123/Langchain-typescript/blob/main/src/langchain/weather.ts
```

### In Cursor IDE

Add the following configuration to your `cursor.json`:
![alt text](image.png)

```json
{
  "mcp": {
    "servers": {
      "weather": {
        "command": "@rehmatalisayany/weather-mcp-server",
        "transport": "stdio"
      }
    }
  }
}
```

### Test using MCP Client

check get-weather.ts for source code, you can run this file to connect to MCP Server

![alt text](image-1.png)

### To connect with Local MCP Server first you need to install 

### Installation

```bash
git clone https://github.com/rehmat123/weather-mcp-server.git
```

go to directory and than
### Install dependencies and build
```bash
npm i
npm build
```

### Code usage in your Agent
 ```
   const transport = new StdioClientTransport({
     command: 'node',
     args: ['dist/index.js']
   });
```

### To connect with Remote MCP Server use this, you dont need to install and compile
```
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['@rehmatalisayany/weather-mcp-server']
  });

```
### To run with Docker providing SSE interface
```
  docker build . -t weather-mcp-server
  docker run -p 8000:8000 weather-mcp-server
```

## API

The server provides the following tool:

- `getWeather`: Get current weather for a location and a given date
  - Arguments:
    - `location`: String (city name or location)
    - `date`: The date to get weather data for (YYYY-MM-DD)
  - Returns:
    - `date`: date,
    - `temperature_min`: Minimum temperature in Celsius
    - `temperature_max`: Maximum temperature in Celsius
    - `conditions`: Weather conditions description
    - `precipitation`: Sum of precipitation for given date
    - `windSpeed_max`: maximum Wind speed in m/s

## License

MIT 
