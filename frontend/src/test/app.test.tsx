import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App";

describe("app routing", () => {
  it("shows login page by default", async () => {
    render(<App />);
    expect(await screen.findByText("Login")).toBeInTheDocument();
  });
});
