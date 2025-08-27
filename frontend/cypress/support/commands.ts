// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

// Custom login command for moderators
Cypress.Commands.add('loginAsModerator', () => {
  // Mock a successful login
  window.localStorage.setItem('authToken', 'test-moderator-token');
  window.localStorage.setItem('user', JSON.stringify({
    id: 'moderator-1',
    username: 'moderator',
    roles: ['moderator'],
    email: 'moderator@example.com'
  }));
});

// Command to check for console errors
Cypress.Commands.add('checkForConsoleErrors', () => {
  const consoleErrors: string[] = [];
  
  cy.on('window:before:load', (win) => {
    cy.stub(win.console, 'error').callsFake((...args) => {
      consoleErrors.push(args.join(' '));
    });
  });
  
  afterEach(() => {
    if (consoleErrors.length > 0) {
      throw new Error(`Console errors detected: ${consoleErrors.join('\n')}`);
    }
  });
});

// Command to wait for loading states
type WaitForLoadingOptions = {
  loadingSelector?: string;
  maxWait?: number;
};

Cypress.Commands.add('waitForLoading', (options: WaitForLoadingOptions = {}) => {
  const { loadingSelector = '.ant-spin, [data-cy=loading]', maxWait = 10000 } = options;
  
  // First, wait for any loading spinners to appear
  cy.get(loadingSelector, { timeout: 1000 }).should('exist');
  
  // Then wait for them to disappear
  cy.get(loadingSelector, { timeout: maxWait }).should('not.exist');
});

// Command to handle API retries
Cypress.Commands.add('retryableRequest', (requestFn, options = {}) => {
  const { retries = 3, delay = 1000 } = options;
  
  const makeRequest = (attempt = 1) => {
    return cy.then(() => {
      return requestFn().catch((error) => {
        if (attempt < retries) {
          cy.wait(delay);
          return makeRequest(attempt + 1);
        }
        throw error;
      });
    });
  };
  
  return makeRequest();
});

// Command to check for broken images
Cypress.Commands.add('checkImages', () => {
  cy.get('img').each(($img) => {
    cy.wrap($img).should('be.visible').and(($img) => {
      expect(($img[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
      expect(($img[0] as HTMLImageElement).naturalHeight).to.be.greaterThan(0);
    });
  });
});

// Command to check for broken links
Cypress.Commands.add('checkLinks', () => {
  cy.get('a').each(($a) => {
    const href = $a.prop('href');
    if (href && !href.includes('#')) {
      cy.request({
        url: href,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.lessThan(400);
      });
    }
  });
});

// Type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      loginAsModerator(): Chainable<void>;
      checkForConsoleErrors(): Chainable<void>;
      waitForLoading(options?: {
        loadingSelector?: string;
        maxWait?: number;
      }): Chainable<JQuery<HTMLElement>>;
      retryableRequest(
        requestFn: () => Cypress.Chainable,
        options?: { retries?: number; delay?: number }
      ): Cypress.Chainable;
      checkImages(): Chainable<JQuery<HTMLImageElement>>;
      checkLinks(): Chainable<JQuery<HTMLAnchorElement>>;
      checkA11yWithThreshold(thresholds?: {
        critical?: number;
        serious?: number;
        moderate?: number;
        minor?: number;
      }): Chainable<void>;
    }
  }
}
