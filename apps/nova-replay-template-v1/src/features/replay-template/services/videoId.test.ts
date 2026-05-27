import { describe, expect, it } from "vitest";
import { parseYouTubeVideoId } from "./videoId";

describe("parseYouTubeVideoId", () => {
  it("parses watch URL video id", () => {
    expect(parseYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ"
    );
  });

  it("parses shorts URL video id", () => {
    expect(parseYouTubeVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ"
    );
  });

  it("returns null for invalid value", () => {
    expect(parseYouTubeVideoId("not-a-youtube-url")).toBeNull();
  });
});

