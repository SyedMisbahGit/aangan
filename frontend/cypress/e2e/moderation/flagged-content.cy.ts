/// <reference types="cypress" />

describe('Flagged Content Moderation', () => {
  beforeEach(() => {
    // Mock API responses
    cy.intercept('GET', '/api/moderation/flagged*', { fixture: 'flagged-content.json' }).as('getFlaggedContent');
    cy.intercept('POST', '/api/moderation/review/*', { statusCode: 200, body: { success: true } }).as('reviewAction');
    
    // Login as moderator
    cy.loginAsModerator();
    
    // Navigate to moderation dashboard
    cy.visit('/moderation/flagged-content');
    cy.wait('@getFlaggedContent');
  });

  it('should load and display flagged content', () => {
    // Check for accessibility issues
    cy.checkA11yWithThreshold({
      critical: 0,
      serious: 0,
      moderate: 2
    });

    // Verify table headers
    cy.get('table thead th').should('contain', 'Content');
    cy.get('table thead th').should('contain', 'Reason');
    cy.get('table thead th').should('contain', 'Status');
    cy.get('table thead th').should('contain', 'Actions');

    // Verify content is displayed
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
    
    // Verify content details
    cy.fixture('flagged-content.json').then((fixture) => {
      const firstItem = fixture.data[0];
      cy.contains(firstItem.content.text).should('be.visible');
      cy.contains(firstItem.reason).should('be.visible');
      cy.contains(firstItem.status).should('exist');
    });
  });

  it('should allow approving flagged content', () => {
    // Click approve on first item
    cy.get('table tbody tr').first().find('button[aria-label="Approve"]').click();
    
    // Verify confirmation dialog
    cy.get('.ant-modal').should('be.visible');
    cy.get('.ant-modal-title').should('contain', 'Approve Content');
    
    // Test form validation
    cy.get('button').contains('Confirm').click();
    cy.contains('Please add a note').should('be.visible');
    
    // Add a note and confirm
    const note = 'This content looks appropriate';
    cy.get('textarea').type(note);
    cy.get('button').contains('Confirm').click();
    
    // Verify API call was made with correct data
    cy.wait('@reviewAction').then((interception) => {
      expect(interception.request.body).to.include({
        action: 'approve',
        note: note
      });
      expect(interception.request.headers).to.have.property('authorization');
    });
    
    // Verify success message
    cy.contains('Content approved successfully').should('be.visible');
    
    // Verify the item is removed from the list or marked as resolved
    cy.get('table tbody tr').first().should('not.contain', 'pending');
  });

  it('should allow rejecting flagged content', () => {
    // Click reject on first item
    cy.get('table tbody tr').first().find('button[aria-label="Reject"]').click();
    
    // Verify confirmation dialog
    cy.get('.ant-modal').should('be.visible');
    cy.get('.ant-modal-title').should('contain', 'Reject Flag');
    
    // Add a note and confirm
    const note = 'This flag is not valid';
    cy.get('textarea').type(note);
    cy.get('button').contains('Confirm').click();
    
    // Verify API call was made with correct data
    cy.wait('@reviewAction').then((interception) => {
      expect(interception.request.body).to.include({
        action: 'reject',
        note: note
      });
    });
    
    // Verify success message
    cy.contains('Flag rejected successfully').should('be.visible');
  });

  it('should allow deleting inappropriate content', () => {
    // Click delete on first item
    cy.get('table tbody tr').first().find('button[aria-label="Delete"]').click();
    
    // Verify confirmation dialog
    cy.get('.ant-modal').should('be.visible');
    cy.get('.ant-modal-title').should('contain', 'Delete Content');
    
    // Add a note and confirm
    const note = 'This content violates our community guidelines';
    cy.get('textarea').type(note);
    cy.get('button').contains('Confirm').click();
    
    // Verify API call was made with correct data
    cy.wait('@reviewAction').then((interception) => {
      expect(interception.request.body).to.include({
        action: 'delete',
        note: note
      });
    });
    
    // Verify success message
    cy.contains('Content deleted successfully').should('be.visible');
  });

  it('should handle pagination', () => {
    // Mock paginated response
    cy.fixture('flagged-content.json').then((fixture) => {
      const firstPage = { ...fixture, data: fixture.data.slice(0, 5) };
      const secondPage = { ...fixture, data: fixture.data.slice(5, 10) };
      
      cy.intercept('GET', '/api/moderation/flagged?page=1&limit=5', firstPage).as('getFirstPage');
      cy.intercept('GET', '/api/moderation/flagged?page=2&limit=5', secondPage).as('getSecondPage');
      
      // Change items per page
      cy.get('.ant-pagination-options').find('.ant-select-selector').click();
      cy.get('.ant-select-item-option').contains('5 / page').click();
      
      cy.wait('@getFirstPage');
      cy.get('table tbody tr').should('have.length', 5);
      
      // Go to next page
      cy.get('.ant-pagination-next').click();
      cy.wait('@getSecondPage');
      cy.get('table tbody tr').should('have.length', 5);
    });
  });

  it('should filter content by status', () => {
    // Mock filtered response
    cy.fixture('flagged-content.json').then((fixture) => {
      const pendingItems = {
        ...fixture,
        data: fixture.data.filter((item: any) => item.status === 'pending')
      };
      
      cy.intercept('GET', '/api/moderation/flagged?status=pending', pendingItems).as('getPending');
      
      // Apply status filter
      cy.get('.ant-select-selector').first().click();
      cy.get('.ant-select-item-option').contains('Pending').click();
      
      cy.wait('@getPending');
      
      // Verify only pending items are shown
      cy.get('table tbody tr').each(($row) => {
        cy.wrap($row).find('td').eq(2).should('contain', 'pending');
      });
    });
  });

  it('should handle API errors gracefully', () => {
    // Mock error response for listing
    cy.intercept('GET', '/api/moderation/flagged*', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as('getFlaggedContentError');
    
    // Reload to trigger the error
    cy.reload();
    
    // Verify error message is shown
    cy.contains('Failed to load flagged content').should('be.visible');
    
    // Test retry functionality
    cy.intercept('GET', '/api/moderation/flagged*', { fixture: 'flagged-content.json' }).as('getFlaggedContentRetry');
    cy.contains('Retry').click();
    cy.wait('@getFlaggedContentRetry');
    
    // Verify content loads after retry
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
    
    // Test error during action
    cy.intercept('POST', '/api/moderation/review/*', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as('reviewError');
    
    // Attempt to approve content
    cy.get('table tbody tr').first().find('button[aria-label="Approve"]').click();
    cy.get('button').contains('Confirm').click();
    
    // Verify error handling
    cy.contains('Failed to process action').should('be.visible');
  });

  it('should handle empty state', () => {
    // Mock empty response
    cy.intercept('GET', '/api/moderation/flagged*', {
      data: [],
      total: 0,
      page: 1,
      limit: 10
    }).as('getEmptyFlaggedContent');
    
    // Reload to trigger empty state
    cy.reload();
    cy.wait('@getEmptyFlaggedContent');
    
    // Verify empty state is shown
    cy.contains('No flagged content found').should('be.visible');
    cy.get('table tbody tr').should('not.exist');
  });

  it('should handle unauthorized access', () => {
    // Clear auth state
    cy.clearLocalStorage();
    
    // Mock unauthorized response
    cy.intercept('GET', '/api/moderation/flagged*', {
      statusCode: 401,
      body: { error: 'Unauthorized' }
    }).as('unauthorized');
    
    // Reload to trigger auth check
    cy.reload();
    
    // Verify redirect to login
    cy.url().should('include', '/login');
    cy.contains('Please log in to continue').should('be.visible');
  });
});
