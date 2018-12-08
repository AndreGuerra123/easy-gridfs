var fs = require('fs')
var path = require('path')

var grid = require('gridfs-stream');
var mime = require('mime-types')
var OID = require("mongodb").ObjectID

function easyGridFS(db, driver) {
    this.gfs = grid(db, driver);
    return this;
}

easyGridFS.prototype.validateOBID = function(id){
        if(OID.isValid(id.toString())){
            return id.toString()
        }else{
            throw new Error(id.toString()+' is not a valid ObjectId.')
        }
}

easyGridFS.prototype.saveFile = async function (filepath, filename, callback) {
    try {
        var ws = this.gfs.createWriteStream({
            filename: filename || path.basename(filepath),
            mode: 'w',
            content_type: mime.lookup(filepath) || 'application/octet-stream'
        })
        ws.on('close', function (file) {
            callback(null, file);
        });
        ws.on('error', function (err) {
            callback(err, null)
        })  
        var rs = fs.createReadStream(filepath)
        rs.on('error', function (err) {
            callback(err, null)
        })
        rs.pipe(ws);
          
    } catch (err) {
        callback(err, null);
    }
};
easyGridFS.prototype.getFileInfo = function (id, callback) {
    try {
        var _id = this.validateOBID(id)
        this.gfs.findOne({
            _id
        }, function (err, file) {
            if (err) callback(err, null)
            else if (!file) callback(new Error('File does not exist.'), null)
            else callback(null, file)
        });
    } catch (err) {
        callback(err, null)
    }

};

easyGridFS.prototype.getFileData = async function (id, callback) {
   
    try {
        var _id = this.validateOBID(id)
        let file;
        let data = [];
        await this.gfs.findOne({
           _id
        }, function (err, f) {
            if (err) callback(err, null)
            else if (!f) callback(new Error('File not found.'), null)
            else {
                file = f
            }
        });
        var rs = this.gfs.createReadStream({
           _id
        })
        rs.on('data', function (chunk) {
            data.push(chunk);
        });
        rs.on('end', function () {
            data = Buffer.concat(data);
            callback(null, 'data:' + file.contentType + ';base64,' + Buffer.from(data).toString('base64'));
        });
        rs.on('error', function (err) {
            callback(err, null)
        })
    } catch (err) {
        callback(err, null)
    }
};

easyGridFS.prototype.getFileBase64 = async function (id, callback) {
    
    try {
        let data = [];
        var _id = this.validateOBID(id)
        var rs = this.gfs.createReadStream({
            _id
        })
        rs.on('data', function (chunk) {
            data.push(chunk);
        });
        rs.on('end', function () {
            data = Buffer.concat(data);
            callback(null, Buffer.from(data).toString('base64'));
        });
        rs.on('error', function (err) {
            callback(err, null)
        })
    } catch (err) {
        callback(err, null)
    }
};

easyGridFS.prototype.pipe = function(id,response){
    try {
        var _id = this.validateOBID(id)
        var rs = this.gfs.createReadStream({
            _id
        })
        rs.pipe(response)
        rs.on('error', function (err) {
            response.status(404).json(err)
        })
    } catch (err) {
        response.status(404).json(err)
    }
}


easyGridFS.prototype.removeFile = function (id, callback) {
    try {
        var _id = this.validateOBID(id)
        this.gfs.remove({
            _id
        }, function (err, _gs) {
            if (err) callback(err)
            else callback(null)
        });
    } catch (err) {
        callback(err)
    }
};

easyGridFS.prototype.existFile = function (id, callback) {
    try {
        _id = this.validateOBID(id)
        this.gfs.exist({
           _id
        }, function (err, found) {
            if (err) callback(err, null)
            else callback(null, found)
        });
    } catch (err) {
        callback(err, null)
    }

};

module.exports = easyGridFS;