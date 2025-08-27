/// <reference types="@percy/cypress" />

describe('Visual Regression: Moderation Components', () => {
  beforeEach(() => {
    // Mock API responses
    cy.intercept('GET', '/api/moderation/flagged*', { fixture: 'flagged-content.json' });
    
    // Login as moderator
    cy.loginAsModerator();
  });

  it('displays the flagged content list correctly', () => {
    cy.visit('/moderation/flagged-content');
    
    // Wait for content to load
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
    
    // Take a snapshot of the full page
    cy.takeSnapshot('Moderation - Flagged Content List');
    
    // Take a snapshot of a single item
    cy.get('table tbody tr').first().as('firstItem');
    cy.takeSnapshot('Moderation - Single Flagged Item', {
      scope: '@firstItem',
      percyCSS: `
        /* Hide timestamps and other dynamic content */
        time, .timestamp, [data-cy=timestamp] { 
          visibility: hidden !important; 
        }
      `
    });
  });

  it('shows the error boundary when content fails to load', () => {
    // Force an error state
    cy.intercept('GET', '/api/moderation/flagged*', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    });
    
    cy.visit('/moderation/flagged-content');
    
    // Wait for error state
    cy.contains('Failed to load flagged content').should('be.visible');
    
    // Take a snapshot of the error state
    cy.takeSnapshot('Moderation - Error State', {
      percyCSS: `
        /* Hide dynamic error messages */
        .ant-alert-message { 
          color: transparent !important; 
        }
      `
    });
  });

  it('displays the content preview correctly', () => {
    // Visit a page that shows the content preview
    cy.visit('/moderation/flagged-content');
    
    // Click to open the preview
    cy.get('table tbody tr').first().find('[data-cy=preview-button]').click();
    
    // Wait for preview to load
    cy.get('.content-preview').should('be.visible');
    
    // Take a snapshot of the preview
    cy.takeSnapshot('Moderation - Content Preview', {
      scope: '.content-preview',
      widths: [375, 768], // Test mobile and tablet views
      percyCSS: `
        /* Hide dynamic content */
        time, .timestamp, [data-cy=timestamp] { 
          visibility: hidden !important; 
        }
        
        /* Ensure consistent images */
        img {
          filter: blur(5px);
          opacity: 0.8;
        }
      `
    });
  });

  it('shows the moderation actions menu', () => {
    cy.visit('/moderation/flagged-content');
    
    // Open the actions menu
    cy.get('table tbody tr').first().find('[data-cy=actions-button]').click();
    
    // Take a snapshot of the dropdown menu
    cy.takeSnapshot('Moderation - Actions Menu', {
      scope: '.ant-dropdown',
      widths: [768, 1280], // Test tablet and desktop views
      percyCSS: `
        /* Hide dropdown arrow */
        .ant-dropdown-arrow {
          display: none !important;
        }
      `
    });
  });
});
