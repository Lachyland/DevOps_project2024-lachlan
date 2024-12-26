const { readStudent } = require('../utils/read-util');

const { describe, it, before, after, afterEach } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const chai = require('chai');
const fs = require('fs').promises;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const { app, server } = require('../index');
const student = require('../models/Student');

let baseUrl;

describe('Student API - READ Function', () => {
    before(async () => {
        const { address, port } = server.address();
        baseUrl = `http://${address === '::' ? 'localhost' : address}:${port}`;
    });

    after(() => {
        return new Promise((resolve, reject) => {
            server.close(err => {
                if (err) reject(err);
                resolve();
            });
        });
    });

    afterEach(() => {
        sinon.restore(); // Restore any mocks or stubs
    });

    it('should return all students when no query is provided', (done) => {
        const mockStudents = [
            {
                adminNumber: '2333185P',
                name: 'Sammy',
                diploma: 'Common ICT Programme',
                cGPA: 3.2,
                toObject: function () { return { ...this }; },
            },
            {
                adminNumber: '2305139D',
                name: 'Lachlan',
                diploma: 'Information Technology',
                cGPA: 3.5,
                toObject: function () { return { ...this }; },
            },
            {
                adminNumber: '1237699U',
                name: 'Taha',
                diploma: 'Information Technology',
                cGPA: 3.1,
                toObject: function () { return { ...this }; },
            },
            {
                adminNumber: '9898321P',
                name: 'Nasier',
                diploma: 'Cybersecurity & Digital Forensics',
                cGPA: 2.4,
                toObject: function () { return { ...this }; },
            }
        ];
    
        sinon.stub(student, 'find').resolves(mockStudents);
    
        chai.request(baseUrl)
            .get('/read-student')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array').with.length(4);
                expect(res.body[0]).to.have.property('adminNumber').that.equals('2333185P');
                done();
            });
    });

    it('should return students filtered by adminNumber', (done) => {
        const mockStudents = [
            { adminNumber: '2333185P', name: 'Sammy', diploma: 'Common ICT Programme', cGPA: 3.2 },
            { adminNumber: '2305139D', name: 'Lachlan', diploma: 'Information Technology', cGPA: 3.5 }
        ];
        sinon.stub(student, 'find').resolves(mockStudents);

        chai.request(baseUrl)
            .get('/read-student?adminNumber=2305139D')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array').with.length(1);
                expect(res.body[0].adminNumber).to.equal('2305139D');
                done();
            });
    });

    it('should return students filtered by name search', (done) => {
        const mockStudents = [
            { adminNumber: '2333185P', name: 'Sammy', diploma: 'Common ICT Programme', cGPA: 3.2 },
            { adminNumber: '2305139D', name: 'Lachlan', diploma: 'Information Technology', cGPA: 3.5 },
            { adminNumber: '1237699U', name: 'Taha', diploma: 'Information Technology', cGPA: 3.1 }
        ];
        sinon.stub(student, 'find').resolves(mockStudents);

        chai.request(baseUrl)
            .get('/read-student?searchName=Lachlan')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array').with.length(1);
                expect(res.body[0].name).to.equal('Lachlan');
                done();
            });
    });

    it('should return students filtered by diploma', (done) => {
        const mockStudents = [
            { adminNumber: '2333185P', name: 'Sammy', diploma: 'Common ICT Programme', cGPA: 3.2 },
            { adminNumber: '2305139D', name: 'Lachlan', diploma: 'Information Technology', cGPA: 3.5 },
            { adminNumber: '1237699U', name: 'Taha', diploma: 'Information Technology', cGPA: 3.1 },
            { adminNumber: '9898321P', name: 'Nasier', diploma: 'Cybersecurity & Digital Forensics', cGPA: 2.4 }
        ];
        
        sinon.stub(student, 'find').resolves(mockStudents);
    
        chai.request(baseUrl)
            .get('/read-student?filterDiploma=Information Technology')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array').with.length(2); // Expecting 2 students with "Information Technology" diploma
                expect(res.body[0].diploma).to.equal('Information Technology');
                expect(res.body[1].diploma).to.equal('Information Technology');
                done();
            });
    });
    
    it('should return students sorted by CGPA in ascending order', (done) => {
        const mockStudents = [
            { adminNumber: '2333185P', name: 'Sammy', diploma: 'Common ICT Programme', cGPA: 3.2 },
            { adminNumber: '2305139D', name: 'Lachlan', diploma: 'Information Technology', cGPA: 3.5 },
            { adminNumber: '1237699U', name: 'Taha', diploma: 'Information Technology', cGPA: 3.1 }
        ];
        sinon.stub(student, 'find').resolves(mockStudents);

        chai.request(baseUrl)
            .get('/read-student?sortCGPA=asc')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                expect(res.body[0].cGPA).to.be.lessThan(res.body[1].cGPA);
                done();
            });
    });

    it('should return students sorted by CGPA in descending order', (done) => {
        const mockStudents = [
            { adminNumber: '2333185P', name: 'Sammy', diploma: 'Common ICT Programme', cGPA: 3.2 },
            { adminNumber: '2305139D', name: 'Lachlan', diploma: 'Information Technology', cGPA: 3.5 },
            { adminNumber: '1237699U', name: 'Taha', diploma: 'Information Technology', cGPA: 3.1 }
        ];
        sinon.stub(student, 'find').resolves(mockStudents);

        chai.request(baseUrl)
            .get('/read-student?sortCGPA=desc')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                expect(res.body[0].cGPA).to.be.greaterThan(res.body[1].cGPA);
                done();
            });
    });

    it('should return a 404 if no students match the filters', (done) => {
        const mockStudents = [
            { adminNumber: '2333185P', name: 'Sammy', diploma: 'Common ICT Programme', cGPA: 3.2 },
            { adminNumber: '2305139D', name: 'Lachlan', diploma: 'Information Technology', cGPA: 3.5 }
        ];
        sinon.stub(student, 'find').resolves(mockStudents);

        chai.request(baseUrl)
            .get('/read-student?adminNumber=9999999X')
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('message').that.equals('No student records found');
                done();
            });
    });

    it('should return a 500 error if the file reading fails', (done) => {
        // Stub fs.readFile to simulate an error
        sinon.stub(fs, 'readFile').rejects(new Error('File read failed'));

        chai.request(baseUrl)
            .get('/read-student')
            .end((err, res) => {
                expect(res).to.have.status(500);
                expect(res.body).to.have.property('message').that.contains('File read failed');
                done();
            });
    });
    
});