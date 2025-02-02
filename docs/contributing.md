# Contributing Guide

## Contribute to translations

[![](https://hosted.weblate.org/widget/project-graph/287x66-black.png)](https://hosted.weblate.org/engage/project-graph/)

[Go to Weblate](https://hosted.weblate.org/engage/project-graph/)

## Contribute to app

### Install Rust and Node.js

- Install Rust：https://www.rust-lang.org/tools/install
- Install Node.js：https://nodejs.org/en/download/
- Install pnpm：`npm install -g pnpm`
- For Android development, install Android SDK and NDK

### Install dependencies

```sh
pnpm install
```

### Run the app in development mode

#### Desktop

```sh
pnpm tauri dev
```

> [!WARNING]
> This will take a while to build the app and consume a lot of memory, please be patient.

#### Android

```sh
# first connect your device with adb
pnpm tauri android dev
```

### Build the app for production

```sh
pnpm tauri build
```

> [!IMPORTANT]
> In normal cases, you don't need to build the app manually, Github Actions will automatically build and release the app at 0:00 UTC every day.

### Commit and push changes

- Install Gitmoji: `pnpm install -g gitmoji-cli`
- Commit changes: `gitmoji commit`
- Push changes: `git push`

### Submitting Suggestions

If the functionality being submitted spans a large time period, it is recommended to pull the dev branch every day, as the project may undergo significant code refactoring at any time.

If the functionality being submitted is small with a limited scope of code changes, you can directly modify and commit on the dev branch.

If the functionality being submitted is large with extensive code changes, it is recommended to create a new branch first, and then modify and commit on the new branch.
