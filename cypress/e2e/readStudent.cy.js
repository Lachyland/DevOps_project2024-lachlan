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
    // Wait for the table to be visible
    cy.get('tbody#tableContent', { timeout: 10000 }).should('exist');

    // Ensure rows exist in the table
    cy.get('tbody#tableContent tr').should('have.length.greaterThan', 0);
  });

  it('should search for a student by name', () => {
    const searchQuery = "John Doe"; // Example search query

    // Type a name in the search input field and trigger the search
    cy.get('#searchName').clear().type(searchQuery);

    // Ensure the search request is triggered and check that the correct student is in the table
    cy.get('tbody#tableContent').should('contain', searchQuery);
  });

  it('should filter students by diploma', () => {
    const diploma = "Cybersecurity & Digital Forensics"; // Example diploma filter

    // Select a diploma from the dropdown
    cy.get('#filterDiploma').select(diploma);

    // Verify that each row in the table matches the selected diploma
    cy.get('tbody#tableContent tr').each((row) => {
      cy.wrap(row).contains(diploma); // Each row should contain the selected diploma
    });
  });

  it('should sort students by cGPA (highest to lowest)', () => {
    // Select "Highest to Lowest" option in the cGPA sort dropdown
    cy.get('#sortCGPA').select('desc');

    // Verify that the rows are sorted by cGPA
    let previousCGPA = 4;
    cy.get('tbody#tableContent tr').each((row) => {
      cy.wrap(row)
        .find('td:nth-child(5)') // The cGPA column (5th column)
        .invoke('text')
        .then((cgpaText) => {
          const cgpa = parseFloat(cgpaText);
          expect(cgpa).to.be.at.most(previousCGPA); // Ensure CGPA is in descending order
          previousCGPA = cgpa;
        });
    });
  });

  it('should construct query parameters when all filters are applied', () => {
    cy.get('#searchName').type('John Doe');
    cy.get('#sortCGPA').select('desc');
    cy.get('#filterDiploma').select('Cybersecurity & Digital Forensics');

    // Stub the XHR request to capture the URL
    cy.intercept('GET', '/read-student*', (req) => {
      const url = new URL(req.url, window.location.origin);
      expect(url.searchParams.get('name')).to.eq('John Doe');
      expect(url.searchParams.get('sortCGPA')).to.eq('desc');
      expect(url.searchParams.get('diploma')).to.eq('Cybersecurity & Digital Forensics');
    }).as('fetchStudents');

    // Trigger the fetch
    cy.window().then((win) => win.fetchAndDisplayStudents());
    cy.wait('@fetchStudents');
  });

  it('should construct query parameters when some filters are applied', () => {
    cy.get('#searchName').type('Jane');
    cy.get('#sortCGPA').select('asc');

    // Stub the XHR request to capture the URL
    cy.intercept('GET', '/read-student*', (req) => {
      const url = new URL(req.url, window.location.origin);
      expect(url.searchParams.get('name')).to.eq('Jane');
      expect(url.searchParams.get('sortCGPA')).to.eq('asc');
      expect(url.searchParams.has('diploma')).to.be.false; // No diploma selected
    }).as('fetchStudents');

    // Trigger the fetch
    cy.window().then((win) => win.fetchAndDisplayStudents());
    cy.wait('@fetchStudents');
  });

  it('should construct URL without query parameters when no filters are applied', () => {
    cy.get('#searchName').clear();
    cy.get('#sortCGPA').select('');
    cy.get('#filterDiploma').select('');

    // Stub the XHR request to capture the URL
    cy.intercept('GET', '/read-student*', (req) => {
      const url = new URL(req.url, window.location.origin);
      expect(url.search).to.eq(''); // No query parameters in URL
    }).as('fetchStudents');

    // Trigger the fetch
    cy.window().then((win) => win.fetchAndDisplayStudents());
    cy.wait('@fetchStudents');
  });

  it('should construct URL without the "name" parameter if searchName is empty', () => {
    cy.get('#searchName').clear(); // Ensure the input is empty
    cy.get('#sortCGPA').select('asc');
    cy.get('#filterDiploma').select('Cybersecurity & Digital Forensics');

    cy.intercept('GET', '/read-student*', (req) => {
      const url = new URL(req.url, window.location.origin);
      expect(url.searchParams.has('name')).to.be.false; // No "name" parameter
      expect(url.searchParams.get('sortCGPA')).to.eq('asc');
      expect(url.searchParams.get('diploma')).to.eq('Cybersecurity & Digital Forensics');
    }).as('fetchStudents');

    cy.window().then((win) => win.fetchAndDisplayStudents());
    cy.wait('@fetchStudents');
  });

  it('should construct URL without the "sortCGPA" parameter if sortCGPA is not selected', () => {
    cy.get('#searchName').type('John Doe');
    cy.get('#sortCGPA').select(''); // Ensure no sortCGPA is selected
    cy.get('#filterDiploma').select('Cybersecurity & Digital Forensics');

    cy.intercept('GET', '/read-student*', (req) => {
      const url = new URL(req.url, window.location.origin);
      expect(url.searchParams.get('name')).to.eq('John Doe');
      expect(url.searchParams.has('sortCGPA')).to.be.false; // No "sortCGPA" parameter
      expect(url.searchParams.get('diploma')).to.eq('Cybersecurity & Digital Forensics');
    }).as('fetchStudents');

    cy.window().then((win) => win.fetchAndDisplayStudents());
    cy.wait('@fetchStudents');
  });

  it('should construct URL without the "diploma" parameter if filterDiploma is not selected', () => {
    cy.get('#searchName').type('Jane');
    cy.get('#sortCGPA').select('desc');
    cy.get('#filterDiploma').select(''); // Ensure no diploma is selected

    cy.intercept('GET', '/read-student*', (req) => {
      const url = new URL(req.url, window.location.origin);
      expect(url.searchParams.get('name')).to.eq('Jane');
      expect(url.searchParams.get('sortCGPA')).to.eq('desc');
      expect(url.searchParams.has('diploma')).to.be.false; // No "diploma" parameter
    }).as('fetchStudents');

    cy.window().then((win) => win.fetchAndDisplayStudents());
    cy.wait('@fetchStudents');
  });


});
