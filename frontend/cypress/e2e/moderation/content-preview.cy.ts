/// <reference types="cypress" />

describe('Content Preview Component', () => {
  const testContent = {
    id: 'test-content-1',
    text: 'This is a test post with some **markdown** formatting and a [link](https://example.com)',
    author: {
      id: 'user-1',
      username: 'testuser',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    createdAt: '2025-08-18T12:00:00Z',
    media: [
      {
        type: 'image',
        url: 'https://picsum.photos/800/400',
        alt: 'Test image'
      }
    ],
    likes: 5,
    comments: 2,
    shares: 1
  };

  beforeEach(() => {
    // Mock the API for any media loading
    cy.intercept('GET', '**/media/*', { fixture: 'test-image.jpg' }).as('mediaRequest');
    
    // Mount the component with test content
    cy.mount(`
      <div class="moderation-container">
        <ContentPreview 
          content="${testContent.text.replace(/"/g, '&quot;')}"
          :author="${JSON.stringify(testContent.author).replace(/"/g, '&quot;')}"
          :created-at="'2025-08-18T12:00:00Z'"
          :media="${JSON.stringify(testContent.media).replace(/"/g, '&quot;')}"
          :likes="5"
          :comments="2"
          :shares="1"
        />
      </div>
    `, {
      global: {
        components: {
          ContentPreview: () => import('@/components/moderation/ContentPreview.vue')
        }
      }
    });
  });

  it('should render content correctly', () => {
    // Check for accessibility issues
    cy.checkA11yWithThreshold({
      critical: 0,
      serious: 0,
      moderate: 2
    });

    // Verify basic content is displayed
    cy.contains(testContent.text).should('be.visible');
    cy.contains(testContent.author.username).should('be.visible');
    
    // Verify markdown is rendered
    cy.get('strong').should('contain', 'markdown');
    cy.get('a').should('have.attr', 'href', 'https://example.com');
    
    // Verify media is loaded
    cy.get('img').should('be.visible')
      .and(($img) => {
        expect(($img[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
      });
    
    // Verify metadata
    cy.contains('5 Likes').should('be.visible');
    cy.contains('2 Comments').should('be.visible');
    cy.contains('1 Share').should('be.visible');
  });

  it('should handle different content types', () => {
    // Test with video content
    const videoContent = {
      ...testContent,
      media: [{
        type: 'video',
        url: 'https://example.com/video.mp4',
        thumbnail: 'https://picsum.photos/800/400',
        duration: 120
      }]
    };

    cy.mount(`
      <ContentPreview 
        content="${videoContent.text}"
        :author="${JSON.stringify(videoContent.author).replace(/"/g, '&quot;')}"
        :media="${JSON.stringify(videoContent.media).replace(/"/g, '&quot;')}"
      />
    `, {
      global: {
        components: {
          ContentPreview: () => import('@/components/moderation/ContentPreview.vue')
        }
      }
    });

    // Verify video player is rendered
    cy.get('video').should('be.visible');
    cy.get('.video-play-button').should('be.visible');
    cy.contains('2:00').should('be.visible');
  });

  it('should handle long content with read more', () => {
    const longText = 'a '.repeat(500); // 1000 characters
    
    cy.mount(`
      <ContentPreview 
        content="${longText}"
        :author="${JSON.stringify(testContent.author).replace(/"/g, '&quot;')}"
      />
    `, {
      global: {
        components: {
          ContentPreview: () => import('@/components/moderation/ContentPreview.vue')
        }
      }
    });

    // Verify read more functionality
    cy.contains('Read more').should('be.visible').click();
    cy.contains(longText).should('be.visible');
    cy.contains('Show less').should('be.visible').click();
    cy.contains('Read more').should('be.visible');
  });

  it('should handle missing or invalid data', () => {
    // Test with minimal props
    cy.mount(`
      <ContentPreview 
        content="Minimal content"
        :author="${JSON.stringify({ username: 'test' }).replace(/"/g, '&quot;')}"
      />
    `, {
      global: {
        components: {
          ContentPreview: () => import('@/components/moderation/ContentPreview.vue')
        }
      }
    });

    // Verify it renders without errors
    cy.contains('Minimal content').should('be.visible');
    cy.contains('test').should('be.visible');
    
    // Test with empty content
    cy.mount(`
      <ContentPreview 
        content=""
        :author="${JSON.stringify({ username: 'test' }).replace(/"/g, '&quot;')}"
      />
    `, {
      global: {
        components: {
          ContentPreview: () => import('@/components/moderation/ContentPreview.vue')
        }
      }
    });

    // Should handle empty content gracefully
    cy.get('.content-preview').should('exist');
  });

  it('should handle media loading errors', () => {
    // Mock a failed image load
    cy.intercept('GET', '**/media/*', {
      statusCode: 404,
      body: 'Not found'
    }).as('failedMedia');

    cy.mount(`
      <ContentPreview 
        content="Content with broken image"
        :author="${JSON.stringify(testContent.author).replace(/"/g, '&quot;')}"
        :media="[${JSON.stringify({
          type: 'image',
          url: 'https://example.com/broken.jpg',
          alt: 'Broken image'
        }).replace(/"/g, '&quot;')}]"
      />
    `, {
      global: {
        components: {
          ContentPreview: () => import('@/components/moderation/ContentPreview.vue')
        }
      }
    });

    // Verify error state is handled
    cy.get('img').should('have.attr', 'alt', 'Failed to load image');
  });
});
