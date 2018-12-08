var chai = require('chai')
chai.use(require('chai-string'));
var should = chai.should()
var easyGridFS = require('../index.js');
var mongodb = require('mongodb')
var base64 = require('./base64.js')
let db;
let egfs;


describe('easyGridFS mongodb', function () {

    beforeAll(function (done) {
        // Use connect method to connect to the server
        mongodb.MongoClient.connect('mongodb://localhost:27017', function (err, client) {
            if (err) done(err)
            db = client.db('test');
            egfs = new easyGridFS(db, mongodb)
            done();
        });
    });
    describe('meta', function () {
        it('should generate a valid easy-gridfs driver instance', function () {
            should.exist(egfs, 'Easy-gridfs object instance does not exist.')
            should.exist(egfs.gfs, 'Easy-gridfs grid streaming object instance does not exist.')
        });
        it('.saveFile should be a function', function () {
            (typeof (egfs.saveFile)).should.equals('function')
        });
        it('.getFileInfo should be a function', function () {
            (typeof (egfs.getFileInfo)).should.equals('function')
        });
        it('.getFileData should be a function', function () {
            (typeof (egfs.getFileData)).should.equals('function')
        });
        it('.getFileBase64 should be a function', function () {
            (typeof (egfs.getFileBase64)).should.equals('function')
        });
        it('.existFile should be a function', function () {
            (typeof (egfs.existFile)).should.equals('function')
        });
        it('.removeFile should be a function', function () {
            (typeof (egfs.removeFile)).should.equals('function')
        });
        it('.validateOBID should be a function', function () {
            (typeof (egfs.validateOBID)).should.equals('function')
        })
    });

    it('should save a file', function (done) {
        egfs.saveFile('./spec/test.png', 'named_test', function (err, file) {
            should.not.exist(err)
            should.exist(file)
            done()
        })
    });

    it('should save a file without name', function (done) {
        var path = "./spec/test.png"
        egfs.saveFile(path, null, function (err, file) {
            should.not.exist(err)
            should.exist(file)
            should.equal(file.filename, 'test.png')
            done()
        })
    });

    it('should fail to save a file without path', function (done) {
        var name = "test.png"
        egfs.saveFile(null, name, function (err, file) {
            should.exist(err)
            should.not.exist(file)
            done()
        })
    });

    it('should fail to save a file with non existing path', function (done) {
        var path = "./spec/nevergonnahappen/test.png"
        egfs.saveFile(path, 'no_file', function (err, file) {
            should.exist(err)
            should.not.exist(file)
            done()
        })
    });

    it('should get info of a existing file', function (done) {
        var path = "./spec/test.png"
        egfs.saveFile(path, null, function (err, file) {
            should.not.exist(err)
            should.exist(file)
            egfs.getFileInfo(file._id, function (err2, info) {
                should.not.exist(err2)
                should.exist(info)
                done()
            })
        })
    })

    it('should fail to get the info of non existing file id', function (done) {
        var nonexistent = '551137c2f9e1fac808a5f572'
        egfs.getFileInfo(nonexistent, function (err2, info) {
            should.exist(err2)
            should.not.exist(info)
            done()
        })
    })

    it('should fail to get the info of invalid file id', function (done) {
        var nonexistent = 'abc'
        egfs.getFileInfo(nonexistent, function (err2, info) {
            should.exist(err2)
            should.not.exist(info)
            done()
        })
    })

    it('should fail to get the info of undefined file id', function (done) {
        var nonexistent = null
        egfs.getFileInfo(nonexistent, function (err2, info) {
            should.exist(err2)
            should.not.exist(info)
            done()
        })
    })

    it('should store the correct content type of file', function (done) {
        var path = "./spec/test.png"
        egfs.saveFile(path, null, function (err, file) {
            should.not.exist(err)
            should.exist(file)
            egfs.getFileInfo(file._id, function (err2, info) {
                should.not.exist(err2)
                should.exist(info)
                info.contentType.should.equal('image/png')
                done()
            })
        })
    })

    it('should get data of a existing file', function (done) {
        var path = "./spec/test.png"
        egfs.saveFile(path, null, function (err, file) {
            should.not.exist(err)
            should.exist(file)
            egfs.getFileData(file._id, function (err2, data) {
                should.not.exist(err2)
                should.exist(data)
                data.should.startWith('data')
                data.should.containIgnoreSpaces(';base64,')
                data.should.containIgnoreSpaces(base64)
                done()
            })
        })
    })

    it('should fail to get the data of non existing file id', function (done) {
        var nonexistent = '551137c2f9e1fac808a5f572'
        egfs.getFileInfo(nonexistent, function (err, data) {
            should.exist(err)
            should.not.exist(data)
            done()
        })
    })

    it('should fail to get the data of invalid file id', function (done) {
        var nonexistent = 'abc'
        egfs.getFileInfo(nonexistent, function (err, data) {
            should.exist(err)
            should.not.exist(data)
            done()
        })
    })

    it('should fail to get the data of undefined file id', function (done) {
        var nonexistent = null
        egfs.getFileInfo(nonexistent, function (err, data) {
            should.exist(err)
            should.not.exist(data)
            done()
        })
    })

    it('should get base64 of a existing file', function (done) {
        var path = "./spec/test.png"
        egfs.saveFile(path, null, function (err, file) {
            should.not.exist(err)
            should.exist(file)
            egfs.getFileBase64(file._id, function (err2, data) {
                should.not.exist(err2)
                should.exist(data)
                data.should.not.startWith('data')
                data.should.not.containIgnoreSpaces(';base64,')
                data.should.containIgnoreSpaces(base64)
                done()
            })
        })
    })

    it('should fail to get the base64 of non existing file id', function (done) {
        var nonexistent = '551137c2f9e1fac808a5f572'
        egfs.getFileBase64(nonexistent, function (err, data) {
            should.exist(err)
            should.not.exist(data)
            done()
        })
    })

    it('should fail to get the base64 of invalid file id', function (done) {
        var nonexistent = 'abc'
        egfs.getFileBase64(nonexistent, function (err, data) {
            should.exist(err)
            should.not.exist(data)
            done()
        })
    })

    it('should fail to get the base64 of undefined file id', function (done) {
        var nonexistent = null
        egfs.getFileBase64(nonexistent, function (err, data) {
            should.exist(err)
            should.not.exist(data)
            done()
        })
    })

    it('should find existing file', function (done) {
        var path = "./spec/test.png"
        egfs.saveFile(path, null, function (err, file) {
            should.not.exist(err)
            should.exist(file)
            egfs.existFile(file._id, function (err2, found) {
                should.not.exist(err2)
                should.equal(found, true)
                done()
            })
        })
    })

    it('should not find non existing file id', function (done) {
        var nonexistent = '551137c2f9e1fac808a5f572' //this is valid should say not found
        egfs.existFile(nonexistent, function (err, found) {
            should.not.exist(err)
            should.equal(found, false)
            done()
        })
    })

    it('should throw on finding invalid file id', function (done) {
        var nonexistent = 'abcd' //this is invalid, should throw
        egfs.existFile(nonexistent, function (err, found) {
            should.exist(err)
            should.not.exist(found)
            done()
        })
    })

    it('should throw on finding undefined file id', function (done) {
        var nonexistent = undefined //this is invalid, should throw
        egfs.existFile(nonexistent, function (err, found) {
            should.exist(err)
            should.not.exist(found)
            done()
        })
    })

    it('should remove existing file', function (done) {
        var path = "./spec/test.png"
        egfs.saveFile(path, null, function (err, file) {
            should.not.exist(err)
            should.exist(file)
            egfs.removeFile(file._id, function (err2) {
                should.not.exist(err2)
                egfs.existFile(file._id, function (err3, found) {
                    should.not.exist(err3)
                    should.equal(found, false)
                    done()
                })
            })
        })
    })

    it('should not throw on removing non existing file id', function (done) {
        var nonexistent = '551137c2f9e1fac808a5f572'
        egfs.removeFile(nonexistent, function (err) {
            should.not.exist(err)
            done()
        })
    })

    it('should throw on removing invalid file id', function (done) {
        var nonexistent = 'abc'
        egfs.removeFile(nonexistent, function (err) {
            should.exist(err)
            done()
        })
    })

    it('should throw on removing undefined file id', function (done) {
        var nonexistent = null
        egfs.removeFile(nonexistent, function (err) {
            should.exist(err)
            done()
        })
    })

    afterAll(done => {
        db.dropDatabase((err)=>{
            if(err) done(err)
            else db.close(done)
        })
        
    });

});