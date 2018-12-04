var gridfsLockingStream = require('gridfs-locking-stream');
var fs = require('file-system');
var path = require('path');
var async = require('async');


function easyGridFS(db, driver) {

    var gfs = gridfsLockingStream(db,driver);
    var self = this;

    this.saveFile = function (path, name, callback) {
        try {
            if (typeof path == 'undefined') throw '(path) of the image is undefined in (putFile) function';
            if (typeof name == 'undefined') throw '(name) of the image is undefined in (putFile) function';
            // if (typeof extension == 'undefined') throw '(extension) of the image is undefined in (putFile) function';
            gfs.createWriteStream(
                {filename: name},
                function (err, writestream) {
                    if (err) callback(err, null);
                    else {
                        if (writestream) {
                            fs.createReadStream(path).pipe(writestream);

                            writestream.on('close', function (file) {
                                callback(null, file);
                            });
                        }
                    }
                });
        }
        catch (err) {
            callback(err, null);
        }
    };
    
    this.getFileInfo = function (id, callback) {
        try {
            if (typeof id == 'undefined') throw '(id) of the image is undefined in (getInfoById) function';
            gfs.findOne({_id: id}, function (err, file) {
                if (err) callback(err, null);
                else if (!file) throw 'File not found.'
                else callback(null, file);
            });
        }
        catch (err) {
            callback(err, null);
        }
    };
    
    this.getFileData = function (id, callback) {
        let contentType = null;
        let data = [];
        try {
            if (typeof id == 'undefined') throw '(id) of the image is undefined in (getFileById) function';
            
            gfs.findOne({_id:id},function(err,file){
                      if (err) throw err;
                      else if (!file) throw 'File not found.'
                      else{
                      contentType = file.contentType
                      }  
            })
            gfs.createReadStream({_id: id},function(err,rs) {
                      if (err) throw err;
                      else {
                          readStream.on('data', function (chunk) {
                                        data.push(chunk);
                                    });
                          readStream.on('end', function () {
                                        data = Buffer.concat(data);
                                        callback(null,'data:'+contentType+';base64,' + Buffer(data).toString('base64'));
                                    });
                          readStream.on('error',function(err){
                                    throw err;
                                    });
                      }       
            });
           
        }catch (err) {
            callback(err, null);
        }
    };
    
    
    this.getFileBase64 = function (id, callback) {
        try {
            if (typeof id == 'undefined') throw '(id) of the image is undefined in (getFileById) function';
            let data = [];
            gfs.createReadStream({_id: id},function(err,rs) {
                      if (err) throw err;
                      else {
                          readStream.on('data', function (chunk) {
                                        data.push(chunk);
                                    });
                          readStream.on('end', function () {
                                        data = Buffer.concat(data);
                                        callback(null,Buffer(data).toString('base64'));
                                    });
                          readStream.on('error',function(err){
                                    throw err;
                                    });
                      }       
            });
           
        }catch (err) {
            callback(err, null);
        }
    };
            
    this.removeFile = function (id, callback) {
        try {
            if (typeof id == 'undefined') throw '(id) of the image is undefined in (removeFile) function';
            gfs.remove({_id: id}, function (err, result) {
                if (err) callback(err, null);
                else if (result) callback(null, result);
            });
        }
        catch (err) {
            callback(err, null);
        }
    };
  
    this.existFile = function (id, callback) {
        gfs.exist({_id: id}, function (err, found) {
            if (err) callback(err, null);
            else callback(null, found);
        });
    };   
    
}

module.exports = eassyGridFS;
