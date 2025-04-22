import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "./ThemeToggle";

const mockSetTheme = jest.fn();

jest.mock("lucide-react", () => ({
  Moon: () => <div data-testid="moon-icon" />,
  Sun: () => <div data-testid="sun-icon" />,
}));

const mockUseTheme = jest.fn().mockReturnValue({
  theme: "light",
  setTheme: mockSetTheme,
});

jest.mock("@/hooks/useTheme", () => ({
  useTheme: () => mockUseTheme(),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  it("renders theme toggle button", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("shows sun icon in light mode", () => {
    render(<ThemeToggle />);
    expect(screen.getByTestId("sun-icon")).toBeInTheDocument();
  });

  it("calls setTheme when clicked", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });
});
