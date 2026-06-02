# Contributing to Gym Connect

Thank you for your interest in contributing! This guide will help you get started.

## Code of Conduct

Be respectful and inclusive. We're all here to learn and build together.

## Getting Help

- **Questions?** Check the docs in `docs/` folder
- **Bug found?** Open a GitHub issue with details
- **Feature idea?** Discuss in issues before implementing

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourname/gym-connect.git`
3. Create a feature branch: `git checkout -b feature/my-feature`
4. Set up dev environment: See [GETTING_STARTED.md](GETTING_STARTED.md)

## Running Tests

```bash
# Mobile
cd mobile && npm test

# Backend
cd backend && ./mvnw test
```

## Code Style

### JavaScript/TypeScript

- Use Prettier for formatting
- Use ESLint for linting
- 2-space indentation
- PascalCase for components
- camelCase for functions/variables

```bash
cd mobile
npm run lint
npx prettier --write src/
```

### Java

- Follow Google Java Style Guide
- 4-space indentation
- PascalCase for classes/interfaces
- camelCase for methods/fields

```bash
cd backend
./mvnw format:format
```

## Commit Messages

Use clear, descriptive commit messages:

```
feat: Add user authentication
fix: Resolve database connection issue
docs: Update API documentation
style: Format code with prettier
refactor: Extract user service logic
test: Add unit tests for PR service
```

## Pull Request Process

1. **Create PR with description**
   - Clear title explaining the change
   - Detailed description of what and why
   - Link to related issues

2. **Code Review**
   - Ensure tests pass
   - Code follows style guide
   - Documentation is updated

3. **Approval & Merge**
   - At least 1 approval required
   - All CI checks pass
   - Squash and merge to main

## Feature Development Checklist

- [ ] Feature branch created from `develop`
- [ ] Code written with tests
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Code style formatted
- [ ] PR created with description
- [ ] Code review approved

## Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

## Testing Guidelines

### Mobile App

```typescript
// Use React Testing Library
test('renders home screen with PRs', () => {
  render(<HomeScreen />);
  expect(screen.getByText(/Personal Records/i)).toBeInTheDocument();
});
```

### Backend

```java
// Use JUnit 5 and Mockito
@Test
public void testCreatePR() {
    // Arrange
    PersonalRecordDTO dto = new PersonalRecordDTO();

    // Act
    PersonalRecordDTO result = service.createPR(userId, dto);

    // Assert
    assertNotNull(result.getId());
}
```

## Documentation Standards

- Use Markdown for all docs
- Include code examples
- Add screenshots where helpful
- Keep docs up-to-date with code

## Performance

- Check React components for unnecessary re-renders
- Use memoization for expensive computations
- Lazy-load screens in React Navigation
- Use database indexes for frequent queries
- Profile with React DevTools and Java Flight Recorder

## Security

- Never commit secrets or API keys
- Use `.env` files for sensitive config
- Validate all user inputs
- Sanitize database queries
- Implement CSRF protection for backend

## Accessibility

- Touch targets at least 44x44 points
- Color contrast ratio 4.5:1
- Support screen readers
- Test with accessibility tools

## Performance Checklist

- [ ] No console errors/warnings
- [ ] API calls optimized (no N+1 queries)
- [ ] Components memoized where needed
- [ ] Images optimized
- [ ] Build size acceptable

## Resources

- **React Native**: https://reactnative.dev/docs/getting-started
- **Spring Boot**: https://spring.io/guides/gs/rest-service/
- **Supabase**: https://supabase.com/docs
- **Firebase**: https://firebase.google.com/docs

## Questions?

Open an issue or ask in discussions section. We're here to help!

Thank you for contributing! 🙌
