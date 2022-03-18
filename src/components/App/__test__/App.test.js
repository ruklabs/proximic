import { render, screen } from '@testing-library/react';
import App from '../App';
import { AuthProvider } from '../../../contexts/AuthContext';

it('renders App', () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
});
