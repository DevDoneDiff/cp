import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Home from "../../src/app/page";

describe("foundation root route", () => {
  it("renders one accessible non-product status surface without runtime calls", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    render(<Home />);

    const main = screen.getByRole("main");
    expect(document.querySelectorAll("main")).toHaveLength(1);
    expect(within(main).getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      within(main).getByRole("heading", {
        level: 1,
        name: "Repository foundation ready",
      }),
    ).toBeVisible();
    expect(main).toHaveTextContent("The application started successfully");
    expect(within(main).queryByRole("button")).not.toBeInTheDocument();
    expect(within(main).queryByRole("link")).not.toBeInTheDocument();
    expect(main).not.toHaveTextContent(
      /address|contractor|clerk|estimate|sign in|solar/i,
    );
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });
});
