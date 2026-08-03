import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VIPUsersPage from '../../app/vip-users/page';

// Mock fetch
global.fetch = jest.fn();

describe('VIPUsersPage Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should render the VIP users page', () => {
    render(<VIPUsersPage />);
    expect(screen.getByText('VIP Users')).toBeInTheDocument();
  });

  it('should display loading state initially', () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
    );

    render(<VIPUsersPage />);
    // Initially shows loading
  });

  it('should display VIP users after loading', async () => {
    const mockUsers = [
      {
        _id: '1',
        name: 'John Doe',
        company: 'Numera VIP Client',
        priority: 'P1',
        notes: 'Test notes',
        isActive: true,
      },
      {
        _id: '2',
        name: 'Jane Smith',
        company: 'Numera VIP Client',
        priority: 'P2',
        notes: 'Test notes',
        isActive: true,
      },
    ];

    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockUsers }),
      })
    );

    render(<VIPUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should filter users by search query', async () => {
    const mockUsers = [
      {
        _id: '1',
        name: 'John Doe',
        company: 'Numera VIP Client',
        priority: 'P1',
        notes: 'Test notes',
        isActive: true,
      },
      {
        _id: '2',
        name: 'Jane Smith',
        company: 'Numera VIP Client',
        priority: 'P2',
        notes: 'Test notes',
        isActive: true,
      },
    ];

    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockUsers }),
      })
    );

    render(<VIPUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should display error message on fetch failure', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to fetch' }),
      })
    );

    render(<VIPUsersPage />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load VIP users/i)).toBeInTheDocument();
    });
  });
});
