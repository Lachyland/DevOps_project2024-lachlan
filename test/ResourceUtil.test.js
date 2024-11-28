const { readStudent } = require('../utils/read-util');

const { describe, it, before, after, afterEach } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const chai = require('chai');
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
                adminNumber: '1234567A',
                name: 'John Doe',
                diploma: 'Information Technology',
                cGPA: 3.5,
                toObject: function () {
                    return { ...this };
                },
            },
        ];

        sinon.stub(student, 'find').resolves(mockStudents);

        chai.request(baseUrl)
            .get('/read-student')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array').with.length(1);
                expect(res.body[0]).to.have.property('adminNumber').that.equals('1234567A');
                done();
            });
    });

    it('should handle empty responses gracefully', (done) => {
        sinon.stub(student, 'find').resolves([]);

        chai.request(baseUrl)
            .get('/read-student')
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('message').that.equals('No student records found');
                done();
            });
    });

    it('should create a query object with adminNumber if provided', async () => {
        const req = { query: { adminNumber: '1234567A' } };
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };

        const findStub = sinon.stub(student, 'find').resolves([]);

        const { readStudent } = require('../utils/read-util');
        await readStudent(req, res);

        expect(findStub.calledWith({ adminNumber: '1234567A' })).to.be.true;
    });

    it('should create an empty query object if adminNumber is not provided', async () => {
        const req = { query: {} };
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };

        const findStub = sinon.stub(student, 'find').resolves([]);

        const { readStudent } = require('../utils/read-util');
        await readStudent(req, res);

        expect(findStub.calledWith({})).to.be.true;
    });

    it('should correctly format the students with cGPA as string', async () => {
        const req = { query: {} };
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };

        const mockStudents = [
            {
                adminNumber: '1234567A',
                name: 'John Doe',
                diploma: 'Information Technology',
                cGPA: 3.5,
                toObject: function () {
                    return { ...this };
                },
            },
        ];

        sinon.stub(student, 'find').resolves(mockStudents);

        const { readStudent } = require('../utils/read-util');
        await readStudent(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.called).to.be.true;

        const responseData = res.json.getCall(0).args[0];
        expect(responseData[0].cGPA).to.equal('3.5'); // Ensure cGPA is converted to string
    });

    it('should return 500 and log the error if student.find() fails', async () => {
        const req = { query: {} };
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };

        const errorMessage = 'Database query failed';
        sinon.stub(student, 'find').throws(new Error(errorMessage));

        const { readStudent } = require('../utils/read-util');
        await readStudent(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWith(sinon.match({ message: `Server error: ${errorMessage}` }))).to.be.true;
    });

    it('should call student.find() with the correct query (Line 16)', async () => {
        const req = { query: { adminNumber: '1234567A' } };
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };

        const findStub = sinon.stub(student, 'find').resolves([]); // Simulate successful find

        await readStudent(req, res);

        expect(findStub.calledOnceWith({ adminNumber: '1234567A' })).to.be.true;
    });

    it('should return 404 if no students are found (Line 20)', async () => {
        const req = { query: {} };
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };

        sinon.stub(student, 'find').resolves([]); // Simulate no students found

        await readStudent(req, res);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWith({ message: 'No student records found' })).to.be.true;
    });

    it('should correctly format students and convert cGPA to string (Lines 28-29)', async () => {
        const req = { query: {} };
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };

        const mockStudents = [
            {
                adminNumber: '1234567A',
                name: 'John Doe',
                diploma: 'Information Technology',
                cGPA: 3.5,
                toObject: function () {
                    return { ...this };
                },
            },
        ];

        sinon.stub(student, 'find').resolves(mockStudents);

        await readStudent(req, res);

        expect(res.status.calledWith(200)).to.be.true;

        const responseData = res.json.getCall(0).args[0];
        expect(responseData).to.be.an('array').with.length(1);
        expect(responseData[0]).to.have.property('cGPA', '3.5');
    });

    it('should create a query object with searchName if provided', async () => {
        const req = { query: { searchName: 'John' } };
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
    
        const findStub = sinon.stub(student, 'find').resolves([]); // Simulate successful find
    
        await readStudent(req, res);
    
        expect(findStub.calledWith({ name: { $regex: 'John', $options: 'i' } })).to.be.true;
    });

    it('should create a query object with filterDiploma if provided', async () => {
        const req = { query: { filterDiploma: 'Information Technology' } };
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
    
        const findStub = sinon.stub(student, 'find').resolves([]); // Simulate successful find
    
        await readStudent(req, res);
    
        expect(findStub.calledWith({ diploma: 'Information Technology' })).to.be.true;
    });

    it('should sort students by CGPA if sortCGPA is provided', async () => {
        const req = { query: { sortCGPA: 'asc' } };
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
    
        const mockStudents = [
            { adminNumber: '1234567A', name: 'John Doe', cGPA: 3.5, toObject: function () { return { ...this }; } },
            { adminNumber: '2345678B', name: 'Jane Doe', cGPA: 3.8, toObject: function () { return { ...this }; } }
        ];
    
        sinon.stub(student, 'find').resolves(mockStudents);
    
        await readStudent(req, res);
    
        const responseData = res.json.getCall(0).args[0];
        expect(responseData[0].cGPA).to.equal('3.5');
        expect(responseData[1].cGPA).to.equal('3.8');
    });
    it('should return 500 and log the error if student.find() fails', async () => {
        const req = { query: {} };
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
    
        const errorMessage = 'Database query failed';
        sinon.stub(student, 'find').throws(new Error(errorMessage));
    
        await readStudent(req, res);
    
        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWith(sinon.match({ message: `Server error: ${errorMessage}` }))).to.be.true;
    });
    
    it('should correctly format students and convert cGPA to string (Line 28)', async () => {
        const req = { query: {} };
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
    
        const mockStudents = [
            {
                adminNumber: '1234567A',
                name: 'John Doe',
                diploma: 'Information Technology',
                cGPA: 3.5,
                toObject: function () {
                    return { ...this };
                },
            },
        ];
    
        sinon.stub(student, 'find').resolves(mockStudents);
    
        await readStudent(req, res);
    
        // Check if the status is 200 OK
        expect(res.status.calledWith(200)).to.be.true;
    
        // Get the formatted response data
        const responseData = res.json.getCall(0).args[0];
    
        // Verify that the 'cGPA' field is converted to a string
        expect(responseData[0]).to.have.property('cGPA').that.equals('3.5');
    });

    it('should sort students in descending order by CGPA when sortCGPA is "desc"', (done) => {
        const mockStudents = [
            {
                adminNumber: '1234567A',
                name: 'John Doe',
                diploma: 'Information Technology',
                cGPA: 3.5,
                toObject: function () {
                    return { ...this };
                },
            },
            {
                adminNumber: '2345678B',
                name: 'Jane Smith',
                diploma: 'Software Engineering',
                cGPA: 3.8,
                toObject: function () {
                    return { ...this };
                },
            },
        ];
    
        // Simulate the 'desc' sortCGPA query
        const req = { query: { sortCGPA: 'desc' } };
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
    
        // Stub the find method to return mock students
        sinon.stub(student, 'find').resolves(mockStudents);
    
        chai.request(baseUrl)
            .get('/read-student')
            .query(req.query)
            .end((err, res) => {
                expect(res).to.have.status(200);
    
                // Ensure that the CGPA sorting is applied in descending order
                const sortedStudents = res.body;
                expect(sortedStudents[0].cGPA).to.equal('3.8');
                expect(sortedStudents[1].cGPA).to.equal('3.5');
                done();
            });
    });
    
 });