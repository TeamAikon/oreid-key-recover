# oreid-key-recover
Recover keys from oreid key backup file

# Setup
npm install --global pkg

# To build executable packages
npm run build

If you get 'FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory'
Try running on cli:

export NODE_OPTIONS=--max_old_space_size=4096 
