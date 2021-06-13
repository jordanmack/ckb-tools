# CKB.tools

[CKB.tools](https://ckb.tools/) is a online collection of free development tools created for use on Nervos Network.

## Developing

These instructions describe how to launch, run, and develop using the CKB.tools code base.
If you don't need to develop and just want to use the tools, visit the [CKB.tools](https://ckb.tools/) website.

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
