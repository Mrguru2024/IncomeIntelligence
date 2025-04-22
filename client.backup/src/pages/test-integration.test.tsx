// A simple test to verify our Jest setup works
import React from "react";
import { render, screen } from "@testing-library/react";

// A simple component for testing
const TestComponent = () => {
  return <div data-testid="test-component">Test Component</div>;
};

describe("Test Integration", () => {
  it("renders a test component", () => {
    render(<TestComponent />);
    const element = screen.getByTestId("test-component");
    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe("Test Component");
  });
});
