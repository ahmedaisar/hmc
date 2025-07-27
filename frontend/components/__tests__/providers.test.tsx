import React from 'react';
import { render, screen } from '@testing-library/react';
import { Providers } from '../providers';

// A mock component that explicitly uses React.Children.only
const SingleChildComponent = ({ children }: { children: React.ReactNode }) => {
  // This will throw an error if 'children' is not a single React element
  const child = React.Children.only(children);
  return <div>{child}</div>;
};

describe('Providers Component', () => {
  it('should render its children correctly without React.Children.only issues', () => {
    // This test will fail if Providers passes a Fragment to a component
    // that expects a single React element (like SingleChildComponent)
    render(
      <Providers>
        <SingleChildComponent>
          <span>Test Child</span>
        </SingleChildComponent>
      </Providers>
    );

    // Assert that the content from the nested child is present
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should render multiple children if passed directly (not through SingleChildComponent)', () => {
    render(
      <Providers>
        <div>Child 1</div>
        <div>Child 2</div>
      </Providers>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });
});
