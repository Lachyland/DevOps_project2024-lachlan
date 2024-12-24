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

  it('should display a message when no students are found', () => {
    // Mock the allStudents array to be empty
    cy.window().then((win) => {
        win.allStudents = [];
        win.displayNoStudentsMessage();
    });

    cy.get('#tableContent').should('contain', 'No students found');
});

it('should sort students by cGPA in descending order', () => {
  const students = [
      { name: 'Jane Smith', cGPA: 3.6 },
      { name: 'John Doe', cGPA: 3.5 },
      { name: 'Wei Short', cGPA: 2.1 }
  ];

  // Mock the allStudents array
  cy.window().then((win) => {
      win.allStudents = students;
      win.filterStudents(); // Assuming this function re-renders the table based on sorting
  });

  // Set sortCGPA to 'desc'
  cy.get('#sortCGPA').select('desc');
  cy.window().then((win) => win.filterStudents());

  // Wait for the table to update
  cy.wait(500); // Adjust the wait time as necessary

  // Verify the order of students
  cy.get('tbody#tableContent tr').first().should('contain', 'Jane Smith'); // Highest CGPA
  cy.get('tbody#tableContent tr').eq(1).should('contain', 'John Doe');
  cy.get('tbody#tableContent tr').last().should('contain', 'Wei Short');
});

it('should sort students by cGPA in ascending order', () => {
  const students = [
      { name: 'Jane Smith', cGPA: 3.6 },
      { name: 'John Doe', cGPA: 3.5 },
      { name: 'Wei Short', cGPA: 2.1 }
  ];

  // Mock the allStudents array
  cy.window().then((win) => {
      win.allStudents = students;
      win.filterStudents(); // Assuming this function renders the table
  });

  // Set sortCGPA to 'asc'
  cy.get('#sortCGPA').select('asc');
  cy.window().then((win) => win.filterStudents());

  // Wait for the table to update
  cy.wait(500); // Adjust the wait time as necessary

  // Verify the order of students
  cy.get('tbody#tableContent tr').first().should('contain', 'Wei Short'); // Lowest CGPA
  cy.get('tbody#tableContent tr').eq(1).should('contain', 'John Doe');
  cy.get('tbody#tableContent tr').last().should('contain', 'Jane Smith');
});


it('should display an error message on the page', () => {
  const errorMessage = 'An error occurred while fetching data.';
  
  // Call the function directly
  cy.window().then((win) => {
      win.displayErrorMessage(errorMessage);
  });

  // Check if the error message is displayed
  cy.get('#errorMessage').should('contain', errorMessage);
});

it('should display a message when no students are found', () => {
  // Mock the allStudents array to be empty
  cy.window().then((win) => {
      win.allStudents = [];
      win.displayNoStudentsMessage();
  });

  cy.get('#tableContent').should('contain', 'No students found');
});


});
