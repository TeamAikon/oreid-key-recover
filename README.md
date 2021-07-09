# oreid-key-recover

Recover keys from oreid key backup file

# Setup

npm install --global pkg

# To build executable packages

The pkg library requires Node 14 or higher. Use can use ```nvm current``` to see if you are running Node 14, if not you can switch to it using nvm

```
nvm use node v14.16.1
```

```
npm run build
```


If you get 'FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory', make sure you are passing in the option max_old_space_size=4096. It should already be set on npm run build command. However if you need to add it manually, you can do the following on the command prompt:

```export NODE_OPTIONS=--max_old_space_size=4096```

<br><br>
# How to recover keys from an encrypted Oreid backup file

### Setup
- Download or receive a key backup file via email (oreid-backup.json)
- Download a password decrypt program for your operating system (oreid-key-recover-macos, oreid-key-recover-linux, OR oreid-key-recover-win.exe )
<br><br>
### To run on Mac
- Open a command prompt
- Run ```./oreid-key-recover-macos {backup filename}```
- Enter you wallet password: nnnn
- Your keys will be shown - protect your keys

### To run on Windows
- Run ```oreid-key-recover-win.exe {backup filename}```

### To run on Linux
- Run ```./oreid-key-recover-linux {backup filename}```
