var fs = require('fs')
var path = require('path')

var grid = require('gridfs-stream');
var mime = require('mime-types')

function easyGridFS(db, driver) {
    this.gfs = grid(db, driver);
    return this;
}

easyGridFS.prototype.saveFile = function (filepath, filename, callback) {
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
    } catch (error) {
        callback(error, null);
    }

};
easyGridFS.prototype.getFileInfo = function (_id, callback) {

        this.gfs.findOne({
            _id
        }, function (err, file) {
            if (err) callback(err, null)
            else if (!file) callback(new Error('File does not exist.'), null)
            else callback(null, file)
        });

};

easyGridFS.prototype.getFileData = function (_id, callback) {

        let data = [];
        let gfs = this.gfs;
        gfs.findOne({
            _id
        }, function (err, file) {
            if (err) callback(err, null)
            else if (!file) callback(new Error('File not found.'), null)
            else {
                var rs = gfs.createReadStream({
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
            }
        });
        
   
};

easyGridFS.prototype.getFileBase64 = async function (_id, callback) {

 
        let data = [];
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
    
};

easyGridFS.prototype.getJSON = async function (_id, callback) {

 
    let data = [];
    var rs = this.gfs.createReadStream({
        _id
    })
    rs.on('data', function (chunk) {
        data.push(chunk);
    });
    rs.on('end', function () {
        data = Buffer.concat(data);
        callback(null, JSON.parse(Buffer.from(data)));
    });
    rs.on('error', function (err) {
        callback(err, null)
    })

};


easyGridFS.prototype.pipe = function (_id, res, done) { //This is not tested
        var rs = this.gfs.createReadStream({
            _id
        })
        rs.pipe(res)
        rs.on('error', function (err) {
            done(err)
        })
        rs.on('end', done)

}


easyGridFS.prototype.removeFile = function (_id, callback) {
   
        try {
            this.gfs.remove({
                _id
            }, function (err, _gs) {
                if (err) throw err;
                else callback(null)
            });
        } catch (error) {
            callback(error)
        }

};

easyGridFS.prototype.existFile = function (_id, callback) {
    try {
        this.gfs.exist({
            _id
        }, function (err, found) {
            if (err) throw err;
            else callback(null, found)
        });
    } catch (error) {
        callback(error, null)
    }

};

module.exports = easyGridFS;