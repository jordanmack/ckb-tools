# CKB.tools

[CKB.tools](https://ckb.tools/) is a online collection of free development tools created for use on Nervos Network.

## Developing

These instructions describe how to develop using the CKB.tools code base.

### Prerequisites

- Node.js

### Install Dependencies

```
npm i --force
```

### Configure

Edit the `src/config.js` file.

### Start the Development Server
```
npm start
```

### Building
```
npm run build
```

### Deploying

Build the project, then copy the complete contents of the `build` directory to the document root of the web server.
