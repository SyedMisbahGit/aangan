import React from 'react';
import { mount } from 'cypress/react18';
import ModerationErrorBoundary from '../../../src/components/moderation/ModerationErrorBoundary';
import { Result, Button } from 'antd';

// Test component that will throw an error
const ErrorComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div data-cy="safe-component">Safe content</div>;
};

describe('ModerationErrorBoundary', () => {
  it('renders children when there is no error', () => {
    mount(
      <ModerationErrorBoundary componentName="Test Component">
        <div data-cy="child">Child component</div>
      </ModerationErrorBoundary>
    );

    cy.get('[data-cy="child"]').should('be.visible');
    cy.get('.moderation-error-boundary').should('not.exist');
  });

  it('displays error fallback when child throws an error', () => {
    // Prevent error logs from cluttering the test output
    cy.on('uncaught:exception', () => false);
    
    mount(
      <ModerationErrorBoundary componentName="Test Component">
        <ErrorComponent shouldThrow={true} />
      </ModerationErrorBoundary>
    );

    // Verify error boundary is shown
    cy.get('.moderation-error-boundary').should('be.visible');
    cy.contains('Error in Test Component').should('be.visible');
    cy.contains('An error occurred while loading the content').should('be.visible');
    cy.get('button').contains('Retry').should('be.visible');
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = cy.stub().as('retryHandler');
    
    mount(
      <ModerationErrorBoundary 
        componentName="Test Component"
        onRetry={onRetry}
      >
        <ErrorComponent shouldThrow={true} />
      </ModerationErrorBoundary>
    );

    // Click retry button
    cy.get('button').contains('Retry').click();
    cy.get('@retryHandler').should('have.been.calledOnce');
  });

  it('reloads the page when no onRetry handler is provided', () => {
    // Stub window.location.reload
    const reloadStub = cy.stub(window.location, 'reload');
    
    mount(
      <ModerationErrorBoundary componentName="Test Component">
        <ErrorComponent shouldThrow={true} />
      </ModerationErrorBoundary>
    );

    // Click retry button
    cy.get('button').contains('Retry').click().then(() => {
      expect(reloadStub).to.be.calledOnce;
    });
  });

  it('displays custom error message when provided', () => {
    const customMessage = 'Custom error message';
    
    mount(
      <ModerationErrorBoundary 
        componentName="Test Component"
        errorMessage={customMessage}
      >
        <ErrorComponent shouldThrow={true} />
      </ModerationErrorBoundary>
    );

    cy.contains(customMessage).should('be.visible');
  });

  it('applies custom className and style', () => {
    mount(
      <ModerationErrorBoundary 
        componentName="Test Component"
        className="custom-class"
        style={{ backgroundColor: 'red' }}
      >
        <ErrorComponent shouldThrow={true} />
      </ModerationErrorBoundary>
    );

    cy.get('.moderation-error-boundary')
      .should('have.class', 'custom-class')
      .should('have.css', 'background-color', 'rgb(255, 0, 0)');
  });

  it('passes through additional props to the Card component', () => {
    mount(
      <ModerationErrorBoundary 
        componentName="Test Component"
        data-testid="error-boundary"
        title="Error Card"
      >
        <ErrorComponent shouldThrow={true} />
      </ModerationErrorBoundary>
    );

    cy.get('.ant-card').should('have.attr', 'data-testid', 'error-boundary');
    cy.get('.ant-card-head-title').should('contain', 'Error Card');
  });

  it('handles nested error boundaries correctly', () => {
    mount(
      <ModerationErrorBoundary componentName="Outer Boundary">
        <div>
          <ModerationErrorBoundary componentName="Inner Boundary">
            <ErrorComponent shouldThrow={true} />
          </ModerationErrorBoundary>
          <div data-cy="sibling">Sibling content</div>
        </div>
      </ModerationErrorBoundary>
    );

    // Only the inner boundary should show the error
    cy.contains('Error in Inner Boundary').should('be.visible');
    cy.contains('Error in Outer Boundary').should('not.exist');
    cy.get('[data-cy="sibling"]').should('be.visible');
  });
});
