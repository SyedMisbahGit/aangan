/// <reference types="@percy/cypress" />

// Custom command to take visual snapshots
Cypress.Commands.add('takeSnapshot', (name: string, options = {}) => {
  // Hide elements that might cause flaky tests
  const hideElements = [
    '.percy-hide',
    '[data-percy-hide]',
    '.ant-skeleton',
    '.ant-spin',
    '[data-cy=loading]',
    ...(options.hideElements || [])
  ];

  // Wait for all images to load
  cy.get('img:not([src*="data:image"])').each(($img) => {
    cy.wrap($img).should('be.visible').and(($img) => {
      expect(($img[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
    });
  });

  // Take the snapshot with Percy
  cy.percySnapshot(name, {
    ...options,
    widths: [375, 768, 1280],
    minHeight: 800,
    percyCSS: `
      ${hideElements.join(', ')} { 
        visibility: hidden !important; 
      }
      
      /* Fix for animations */
      *, *:before, *:after {
        animation-duration: 0s !important;
        transition: none !important;
      }
      
      /* Hide scrollbars for consistency */
      ::-webkit-scrollbar {
        display: none !important;
      }
      
      ${options.percyCSS || ''}
    `
  });});

// Add TypeScript support for the custom command
declare global {
  namespace Cypress {
    interface Chainable {
      takeSnapshot(
        name: string, 
        options?: {
          hideElements?: string[];
          percyCSS?: string;
          [key: string]: any;
        }
      ): Chainable<void>;
    }
  }
}
