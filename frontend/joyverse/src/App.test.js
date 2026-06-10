import { render, screen } from '@testing-library/react';
import App from './App';

// The default App.test was a CRA placeholder that looked for "learn react"
// which doesn't exist in JoyVerse.  This test verifies the app renders
// without crashing and redirects to the login page.
test('renders login page without crashing', () => {
  render(<App />);
  // LoginPage renders an h1 with the text "JoyVerse"
  const heading = screen.getByRole('heading', { name: /joyverse/i });
  expect(heading).toBeInTheDocument();
});
