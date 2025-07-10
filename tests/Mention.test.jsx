import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MentionView from "src/components/formitems/MentionView";
import requests from "src/requests";

describe("MentionView", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation((message) => {
      // 忽略 Ant Design 的特定警告
      if (
        message.includes("MenuItem should not leave undefined `key`") ||
        message.includes("`Mentions.Option` is deprecated. Please use `options` instead.")
      ) {
        return;
      }

      // eslint-disable-next-line no-console
      console._originalError(message);
    });
    // eslint-disable-next-line no-console
    console._originalError = console.error;
  });

  it("should render", () => {
    const { container } = render(<MentionView restful="api/users/" />);
    expect(container).toMatchSnapshot();
  });

  it("should render in readOnly mode", () => {
    const { container } = render(<MentionView value="@admin" restful="api/users/" readOnly />);
    expect(container).toMatchSnapshot();
  });

  it("should trigger search and onChange when typing @", async () => {
    const handleChange = jest.fn();
    const fetch = jest.spyOn(requests, "get").mockResolvedValue({
      data: {
        results: [
          { id: 1, username: "admin", nickname: "管理员" },
          { id: 2, username: "skyler", nickname: "Skyler" },
        ],
      },
    });

    const { container } = render(
      <MentionView restful="api/users/" onChange={handleChange} fieldNames={{ label: "username", value: "username" }} />
    );

    const input = container.querySelector("textarea");
    await userEvent.type(input, "@");

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("api/users/", expect.objectContaining({ params: {} }));
    });

    // 继续输入
    await userEvent.type(input, "a");

    await waitFor(() => {
      expect(requests.get).toHaveBeenCalledWith("api/users/", expect.objectContaining({ params: { search: "a" } }));
      expect(handleChange).toHaveBeenCalledWith("@a");
    });
  });
});
