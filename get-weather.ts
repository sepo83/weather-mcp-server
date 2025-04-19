import { Client } from '@modelcontextprotocol/sdk/client';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio';

async function getWeather() {
  // Initialize MCP client
  const client = new Client({
    name: 'weather-test',
    version: '1.0.0'
  });

  // Connect to our local server
  // const transport = new StdioClientTransport({
  //   command: 'node',
  //   args: ['dist/index.js']
  // });

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['@rehmatalisayany/weather-mcp-server']
  });
  try {
    console.log('Connecting to weather server...');
    await client.connect(transport);
    console.log('Connected successfully!\n');

    // Get weather for Lahore
    console.log('Getting weather for Lahore...');
    const result = await client.callTool({
      name: 'getWeather',
      arguments: { location: 'Lahore' }
    });

    if (result?.content?.[0]?.text) {
      const weather = JSON.parse(result.content[0].text);
      console.log('\nCurrent weather in Lahore:');
      console.log(`• Temperature: ${weather.temperature}°C`);
      console.log(`• Conditions: ${weather.description}`);
      console.log(`• Humidity: ${weather.humidity}%`);
      console.log(`• Wind Speed: ${weather.windSpeed} m/s`);
    } else {
      console.log('No weather data in response:', result);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

getWeather().catch(console.error); 