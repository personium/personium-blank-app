const webdav = require('webdav');
const mime = require('mime-types');
const { agent } = require('./net');
const path = require('path').posix;
const fs = require('fs');
const {promisify} = require('util');
const readAsync = promisify(fs.readFile);


class PersoniumWebdavClient {
  constructor(boxURL, access_token) {
    this.client = webdav.createClient(boxURL, {
      httpAgent: agent,
      httpsAgent: agent,
      token: {
        token_type: 'Bearer',
        access_token,
      },
      proxy: false,
    });

    this.getDirectoryContents = this.client.getDirectoryContents;
  }

  createCollection(collectionPath) {
    return this.client.createDirectory( collectionPath );
  }

  createEngine(enginePath) {
    return this.client.createDirectory(
      enginePath,
      {
        data:'<?xml version="1.0" encoding="utf-8"?><D:mkcol xmlns:D="DAV:" xmlns:p="urn:x-personium:xmlns"><D:set><D:prop><D:resourcetype><D:collection/><p:service/></D:resourcetype></D:prop></D:set></D:mkcol>'
      }
    );
  }

  putFile(dstPath, srcPath, options={}) {
    const defaultOption = {
      overwrite: true,
      onUploadProgress: console.log,
      headers: {
        'Content-Type': mime.lookup(dstPath) || 'application/octet-stream',
      },
    };
    const _options = Object.assign({}, defaultOption, options);
    return readAsync(srcPath).then(buff => 
      this.client.putFileContents(
        dstPath,
        buff,
        _options,
      )
    );
  }

  putFileToEngine(enginePath, srcFile, dstFilename) {
    const dstPath = path.join(enginePath, '__src', dstFilename);
    return this.putFile(dstPath, srcFile);
  }
};

module.exports = PersoniumWebdavClient;