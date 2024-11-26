const { describe, it, before, after } = require('mocha');
const { expect } = require('chai');

const { app, server } = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

let baseUrl;

describe('Student API', () => {
    before(async () => {
        const { address, port } = server.address();
        baseUrl = `http://${address === '::' ? 'localhost' : address}:${port}`;
    });

    after(() => {
        return new Promise((resolve) => {
            server.close(() => {
                resolve();
            });
        });
    });

    describe('GET /read-student', () => {
        it('should return all students', (done) => {
            chai.request(baseUrl)
                .get('/read-student')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array'); // Assuming the route returns an array of students
                    expect(res.body).to.not.be.empty; // Ensure some data is returned
                    done();
                });
        });
    });
});
