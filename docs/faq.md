# Freqently Asked Questions

## macOS

### Cannot open app {#macos-cannot-open}

![image](https://s2.loli.net/2024/12/14/1YmknvPljQyR98U.png)

Solution: Open Terminal and run the following command:

```sh
sudo xattr -r -d com.apple.quarantine /Applications/Project\ Graph.app
```

Input your password when prompted. This command will remove the quarantine attribute from the app, allowing it to be opened normally.

## Auto Backup

If the JSON project file is directly placed on the desktop, a backup file with a white icon may appear at times during editing. If no special situation occurs (such as sudden file corruption), the backup file can be manually deleted.

> [!TIP]
> If you do not want to see too many backup files, you can disable auto backup in the settings. We actually recommend placing each JSON project file in a specific folder. This way, images pasted into the project can be automatically saved to this folder, avoiding mixing with images from other project files.

### How to Restore Backup Files?

You can rename one of the backup files to change its extension back to json and overwrite the original json file. Each backup file contains a timestamp, so you can choose one that is more recent for restoration.
