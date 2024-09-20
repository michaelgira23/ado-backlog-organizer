# Azure DevOps Work Item Organizer with Copilot

> Organizing your Azure DevOps Backlog. For Microsoft Hackathon 2024.

## Usage

[Follow these instructions](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/getting-started/extension-sideloading) to load the development build of the extension onto the browser. The directory you should add is `./ado-backlog-organizer-extension/build`

## Development

### Browser Extension

The browser extension source code is located in `./ado-backlog-organizer-extension`.

To rebuild the browser extension:

```bash
npm install
npm run build
```

This will output files in `./ado-backlog-organizer-extension/build`. These files should automatically take effect when you close and re-open the extension popup.

### Backend

The backend is used to query Azure DevOps and OpenAI API, and its source code is located in `./search`.

To run locally, first create a `.env` file in the root of the repository (at the same level as this README) with the following contents:

```dotenv
OPENAI_API_KEY=YOUR_API_KEY_HERE
```

Since this file is in the `.gitignore`, you can safely put in credentials without worrying about accidentally committing them.

To run the backend locally:

```bash
npm install
npm start
```

And you should be able to send a POST request to <http://localhost:8080/suggestions>

## Credits

Listed in alphabetical order:

- Anne George
- Darren Tu
- Elizabeth Barton
- Harry Suzuki
- Michael Gira
- Mitchell Bifeld
- Sachin Naik
