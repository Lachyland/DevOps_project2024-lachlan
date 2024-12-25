describe('Student Search and View Functionality', () => {
  let baseUrl;

  // Start the server before tests and retrieve the base URL
  before(() => {
    cy.task('startServer').then((url) => {
      baseUrl = url;
    });
  });

  // Stop the server after tests
  after(() => {
    cy.task('stopServer');
  });

  beforeEach(() => {
    // Visit the base URL before each test
    cy.visit(baseUrl);
  });

  it('should load the page and display all students', () => {
    cy.get('tbody#tableContent', { timeout: 10000 }).should('exist');
    cy.get('tbody#tableContent tr').should('have.length.greaterThan', 0);
  });

  it('should search for a student by name', () => {
    const searchQuery = 'John Doe'; // Example search query

    cy.get('#searchName').clear().type(searchQuery);
    cy.get('tbody#tableContent').should('contain', searchQuery);
  });

  it('should filter students by diploma', () => {
    const diploma = 'Cybersecurity & Digital Forensics';

    cy.get('#filterDiploma').select(diploma);
    cy.get('tbody#tableContent tr').each((row) => {
      cy.wrap(row).contains(diploma);
    });
  });

  it('should construct query parameters based on selected filters', () => {
    const searchName = 'John Doe';
    const sortCGPA = 'desc';
    const diploma = 'Cybersecurity & Digital Forensics';

    // Apply filters
    cy.get('#searchName').clear().type(searchName);
    cy.get('#sortCGPA').select(sortCGPA);
    cy.get('#filterDiploma').select(diploma);

    // Stub the XHR request to capture the URL
    cy.intercept('GET', '/read-student*', (req) => {
      const url = new URL(req.url, window.location.origin);
      expect(url.searchParams.get('name')).to.eq(searchName);
      expect(url.searchParams.get('sortCGPA')).to.eq(sortCGPA);
      expect(url.searchParams.get('diploma')).to.eq(diploma);
    }).as('fetchStudents');

    // Trigger the fetch
    cy.window().then((win) => win.fetchAndDisplayStudents());
    cy.wait('@fetchStudents');
  });

  it('should construct URL without unnecessary parameters when optional fields are empty', () => {
    const searchName = 'Jane';

    cy.get('#searchName').type(searchName);
    cy.get('#sortCGPA').select('');
    cy.get('#filterDiploma').select('');

    cy.intercept('GET', '/read-student*', (req) => {
      const url = new URL(req.url, window.location.origin);
      expect(url.searchParams.get('name')).to.eq(searchName);
      expect(url.searchParams.has('sortCGPA')).to.be.false;
      expect(url.searchParams.has('diploma')).to.be.false;
    }).as('fetchStudents');

    cy.window().then((win) => win.fetchAndDisplayStudents());
    cy.wait('@fetchStudents');
  });

  it('should construct URL without "name" parameter if searchName is empty', () => {
    cy.get('#searchName').clear();
    cy.get('#sortCGPA').select('asc');
    cy.get('#filterDiploma').select('Cybersecurity & Digital Forensics');

    cy.intercept('GET', '/read-student*', (req) => {
      const url = new URL(req.url, window.location.origin);
      expect(url.searchParams.has('name')).to.be.false;
      expect(url.searchParams.get('sortCGPA')).to.eq('asc');
      expect(url.searchParams.get('diploma')).to.eq('Cybersecurity & Digital Forensics');
    }).as('fetchStudents');

    cy.window().then((win) => win.fetchAndDisplayStudents());
    cy.wait('@fetchStudents');
  });

  it('should construct URL without "sortCGPA" parameter if sortCGPA is not selected', () => {
    cy.get('#searchName').type('John Doe');
    cy.get('#sortCGPA').select('');
    cy.get('#filterDiploma').select('Cybersecurity & Digital Forensics');

    cy.intercept('GET', '/read-student*', (req) => {
      const url = new URL(req.url, window.location.origin);
      expect(url.searchParams.get('name')).to.eq('John Doe');
      expect(url.searchParams.has('sortCGPA')).to.be.false;
      expect(url.searchParams.get('diploma')).to.eq('Cybersecurity & Digital Forensics');
    }).as('fetchStudents');

    cy.window().then((win) => win.fetchAndDisplayStudents());
    cy.wait('@fetchStudents');
  });

  it('should construct URL without "diploma" parameter if filterDiploma is not selected', () => {
    cy.get('#searchName').type('Jane');
    cy.get('#sortCGPA').select('desc');
    cy.get('#filterDiploma').select('');

    cy.intercept('GET', '/read-student*', (req) => {
      const url = new URL(req.url, window.location.origin);
      expect(url.searchParams.get('name')).to.eq('Jane');
      expect(url.searchParams.get('sortCGPA')).to.eq('desc');
      expect(url.searchParams.has('diploma')).to.be.false;
    }).as('fetchStudents');

    cy.window().then((win) => win.fetchAndDisplayStudents());
    cy.wait('@fetchStudents');
  });

  it('should construct URL without query parameters when no filters are applied', () => {
    cy.get('#searchName').clear();
    cy.get('#sortCGPA').select('');
    cy.get('#filterDiploma').select('');

    cy.intercept('GET', '/read-student*', (req) => {
      const url = new URL(req.url, window.location.origin);
      expect(url.search).to.eq('');
    }).as('fetchStudents');

    cy.window().then((win) => win.fetchAndDisplayStudents());
    cy.wait('@fetchStudents');
  });

  it('should filter students by name', () => {
    const students = [
      { name: 'John Doe', diploma: 'Cybersecurity & Digital Forensics', cGPA: 3.5 },
      { name: 'Jane Smith', diploma: 'Information Technology', cGPA: 3.8 },
    ];

    cy.intercept('GET', '/read-student*', {
      statusCode: 200,
      body: students,
    }).as('fetchStudents');

    cy.window().then((win) => {
      win.fetchAndDisplayStudents();
    });

    cy.wait('@fetchStudents');

    // Type in the search box to filter by name
    cy.get('#searchName').clear().type('John Doe');
    cy.get('#tableContent').should('contain', 'John Doe');
    cy.get('#tableContent').should('not.contain', 'Jane Smith');
  });

  it('should sort students by cGPA', () => {
    const students = [
      { name: 'John Doe', diploma: 'Cybersecurity & Digital Forensics', cGPA: 3.5 },
      { name: 'Jane Smith', diploma: 'Information Technology', cGPA: 3.8 },
    ];

    cy.intercept('GET', '/read-student*', {
      statusCode: 200,
      body: students,
    }).as('fetchStudents');

    cy.window().then((win) => {
      win.fetchAndDisplayStudents();
    });

    cy.wait('@fetchStudents');

    // Select sorting option
    cy.get('#sortCGPA').select('desc');
    cy.get('#tableContent tr').first().should('contain', 'Jane Smith'); // Highest cGPA first
  });

});