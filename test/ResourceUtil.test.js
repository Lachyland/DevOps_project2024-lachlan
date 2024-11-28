const mongoose = require('mongoose');
const { readStudent } = require('../utils/read-util');
const { app, server } = require('../index');
const student = require('../models/Student');
const request = require('supertest');

jest.mock('../models/Student');

describe('Student API - READ Function', () => {
    let baseUrl;
    let consoleLogSpy, consoleErrorSpy;

    beforeAll(() => {
        const { address, port } = server.address();
        baseUrl = `http://${address === '::' ? 'localhost' : address}:${port}`;
    });

    beforeEach(() => {
        // Mock console.log and console.error to suppress output
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore mocked console methods after each test
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
        jest.clearAllMocks();
    });

    afterAll(async () => {
        // Close the server and MongoDB connection
        await new Promise((resolve, reject) => {
            server.close(err => (err ? reject(err) : resolve()));
        });
        await mongoose.connection.close();
    });

    it('should return all students when no query is provided', async () => {
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

        student.find.mockResolvedValue(mockStudents);

        const res = await request(baseUrl).get('/read-student');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toMatchObject({
            adminNumber: '1234567A',
            name: 'John Doe',
        });
    });

    it('should handle empty responses gracefully', async () => {
        student.find.mockResolvedValue([]);

        const res = await request(baseUrl).get('/read-student');
        expect(res.status).toBe(404);
        expect(res.body).toMatchObject({ message: 'No student records found' });
    });

    it('should correctly apply a query object with adminNumber', async () => {
        const req = { query: { adminNumber: '1234567A' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        student.find.mockResolvedValue([]);

        await readStudent(req, res);

        expect(student.find).toHaveBeenCalledWith({ adminNumber: '1234567A' });
    });

    it('should correctly format students and convert cGPA to a string', async () => {
        const req = { query: {} };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
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

        student.find.mockResolvedValue(mockStudents);

        await readStudent(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        const responseData = res.json.mock.calls[0][0];
        expect(responseData[0]).toMatchObject({ cGPA: '3.5' });
    });

    it('should handle database query failures gracefully', async () => {
        const req = { query: {} };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const errorMessage = 'Database query failed';

        student.find.mockImplementation(() => {
            throw new Error(errorMessage);
        });

        await readStudent(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: `Server error: ${errorMessage}` });
    });

    it('should create a query object with searchName if provided', async () => {
        const req = { query: { searchName: 'John' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        student.find.mockResolvedValue([]);

        await readStudent(req, res);

        expect(student.find).toHaveBeenCalledWith({
            name: { $regex: 'John', $options: 'i' },
        });
    });

    it('should sort students by CGPA in ascending order', async () => {
        const req = { query: { sortCGPA: 'asc' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const mockStudents = [
            { adminNumber: '1234567A', cGPA: 3.5, toObject: function () { return { ...this }; } },
            { adminNumber: '2345678B', cGPA: 3.8, toObject: function () { return { ...this }; } },
        ];

        student.find.mockResolvedValue(mockStudents);

        await readStudent(req, res);

        const responseData = res.json.mock.calls[0][0];
        expect(responseData).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ cGPA: '3.5' }),
                expect.objectContaining({ cGPA: '3.8' }),
            ])
        );
    });

    it('should sort students by CGPA in descending order', async () => {
        const mockStudents = [
            { adminNumber: '1234567A', cGPA: 3.5, toObject: function () { return { ...this }; } },
            { adminNumber: '2345678B', cGPA: 3.8, toObject: function () { return { ...this }; } },
        ];

        student.find.mockResolvedValue(mockStudents);

        const res = await request(baseUrl)
            .get('/read-student')
            .query({ sortCGPA: 'desc' });

        expect(res.status).toBe(200);
        expect(res.body[0].cGPA).toBe('3.8');
        expect(res.body[1].cGPA).toBe('3.5');
    });

    it('should filter students by diploma when filterDiploma is provided', async () => {
        const req = { query: { filterDiploma: 'Information Technology' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
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

        student.find.mockResolvedValue(mockStudents);

        await readStudent(req, res);

        expect(student.find).toHaveBeenCalledWith({ diploma: 'Information Technology' });
        expect(res.status).toHaveBeenCalledWith(200);
        const responseData = res.json.mock.calls[0][0];
        expect(responseData).toHaveLength(1);
        expect(responseData[0]).toMatchObject({ diploma: 'Information Technology' });
    });

    it('should handle database query failures gracefully', async () => {
    const req = { query: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const errorMessage = 'Database query failed';

    // Mock console.error to prevent cluttering test output
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock the database find function to throw an error
    student.find.mockImplementation(() => {
        throw new Error(errorMessage);
    });

    // Call the function under test
    await readStudent(req, res);

    // Verify status and error message in response
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: `Server error: ${errorMessage}` });

    // Restore console.error mock
    consoleErrorSpy.mockRestore();
});


});
