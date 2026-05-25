import React from "react";
import { jest } from "@jest/globals";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import HomeScreen from "../screens/HomeScreen";

const mockSeekTo = jest.fn();
const mockPlay = jest.fn(() => Promise.resolve());
const mockPause = jest.fn();
const mockRemove = jest.fn();
const mockAddListener = jest.fn(() => ({ remove: jest.fn() }));

const mockStorage: Record<string, string> = {
  "stopOnPress.v1": "true",
};

jest.mock("expo-audio", () => ({
  createAudioPlayer: jest.fn(() => ({
    seekTo: mockSeekTo,
    play: mockPlay,
    pause: mockPause,
    remove: mockRemove,
    addListener: mockAddListener,
  })),
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async (key: string) => mockStorage[key] ?? null),
  setItem: jest.fn(async (key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: jest.fn(async (key: string) => {
    delete mockStorage[key];
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("expo-document-picker", () => ({
  getDocumentAsync: jest.fn(),
}));

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage["stopOnPress.v1"] = "true";
  });

  it("renders the home screen and shows the main button", () => {
    const { getByText } = render(<HomeScreen />);

    expect(getByText("BIG RED BUTTON")).toBeTruthy();
    expect(getByText("PRESS ME")).toBeTruthy();
  });

  it("starts audio playback when the button is pressed", async () => {
    const { getByText } = render(<HomeScreen />);

    fireEvent.press(getByText("PRESS ME"));

    await waitFor(() => expect(mockSeekTo).toHaveBeenCalledWith(0));
    expect(mockPlay).toHaveBeenCalled();
    expect(getByText("GOING!")).toBeTruthy();
  });

  it("loads saved stop preference and persists toggle changes", async () => {
    const { getByText, getByRole } = render(<HomeScreen />);

    fireEvent.press(getByText("⚙️"));
    const toggle = getByRole("switch");

    await waitFor(() => expect(toggle.props.value).toBe(true));

    fireEvent(toggle, "valueChange", false);

    await waitFor(() => expect(toggle.props.value).toBe(false));
    expect(
      require("@react-native-async-storage/async-storage").setItem,
    ).toHaveBeenCalledWith("stopOnPress.v1", "false");
  });

  it("restarts audio when stop-on-press is disabled", async () => {
    mockStorage["stopOnPress.v1"] = "false";
    const { getByText, getByRole } = render(<HomeScreen />);

    fireEvent.press(getByText("⚙️"));

    await waitFor(() =>
      expect(getByRole("switch").props.value).toBe(false),
    );

    fireEvent.press(getByText("PRESS ME"));
    await waitFor(() => expect(mockSeekTo).toHaveBeenCalledWith(0));
    expect(mockPlay).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText("GOING!"));
    await waitFor(() => expect(mockSeekTo).toHaveBeenCalledTimes(2));
    expect(mockPlay).toHaveBeenCalledTimes(2);
  });
});
