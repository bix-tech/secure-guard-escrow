# Secure Guard Escrow

Welcome to your Secure Guard Escrow project and to the internet computer development community. By default, creating a new project adds this README and some template files to your project directory. You can edit these template files to customize your project and to include your own code to speed up the development cycle.

To get started, you might want to explore the project directory structure and the default configuration file. Working with this project in your development environment will not affect any production deployment or identity tokens.

## Project Overview and Process

In this section, you can provide a detailed overview of your project's process. This can include step-by-step instructions, screenshots, and GIFs that demonstrate how to use your project or show what it does.

Here's a GIF showing the process:

![Process GIF](https://media.giphy.com/media/lQdjAXS0unmSD7e2wX/giphy.gif)

![Another Process GIF](https://media.giphy.com/media/cSnHEwxOv20PGU4EJe/giphy.gif)

![Yet Another Process GIF](https://media.giphy.com/media/X8bpAvLuSFCxr7vke5/giphy.gif)

If you want to start working on your project right away, you might want to try the following commands:

```bash
cd icp_escrow_service/
dfx help
dfx canister --help
```

## Running the project locally

If you want to test your project locally, you can use the following commands:

```bash
# Starts the replica, running in the background
dfx start --background

# Deploys your canisters to the replica and generates your candid interface
dfx deploy
```

Once the job completes, your application will be available at `http://localhost:4943?canisterId={asset_canister_id}`.

If you have made changes to your backend canister, you can generate a new candid interface with

```bash
npm run generate
```

at any time. This is recommended before starting the frontend development server, and will be run automatically any time you run `dfx deploy`.

If you are making frontend changes, you can start a development server with

```bash
npm run dev
```

Which will start a server at `http://localhost:5173`, proxying API requests to the replica at port 4943.

```bash
npm run setup
```

For first time user, it is recommended to use npm run setup first. By running npm run setup, it is basically running every command that is needed so that we can be sure that everything is setup accordingly.
