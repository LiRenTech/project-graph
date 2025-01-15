# Freqently Asked Questions

## macOS

### Cannot open app {#macos-cannot-open}

![image](https://s2.loli.net/2024/12/14/1YmknvPljQyR98U.png)

Solution: Open Terminal and run the following command:

```sh
sudo xattr -r -d com.apple.quarantine /Applications/Project\ Graph.app
```

Input your password when prompted. This command will remove the quarantine attribute from the app, allowing it to be opened normally.
