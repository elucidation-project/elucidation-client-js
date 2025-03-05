import { ConnectionEvent, Direction, Status } from "../../src";
import { ElucidationRecorder } from "../../src/client/recorder";
import { describe, expect, it, jest } from "@jest/globals";
import axios from "axios";

describe("Elucidation Recorder", () => {
  describe("recordEvent", () => {
    function newEvent(): ConnectionEvent {
      return {
        eventDirection: Direction.INBOUND,
        communicationType: "JMS",
        connectionIdentifier: "SOME_MESSAGE",
        observedAt: new Date().getTime(),
        serviceName: "my-service",
      };
    }

    it("should receive a successful result when recording succeeds", async () => {
      jest
        .spyOn(axios, "post")
        .mockReturnValue(Promise.resolve({ status: 200 }));

      const event = newEvent();

      const recorder = new ElucidationRecorder("http://localhost:1234");
      const result = await recorder.recordNewEvent(event);

      expect(result.status).toEqual(Status.SUCCESS);
      expect(result.hasErrorMessage()).toBeFalsy();
      expect(result.hasException()).toBeFalsy();
    });

    it("should receive an error result when error message returned from service", async () => {
      jest
        .spyOn(axios, "post")
        .mockReturnValue(Promise.resolve({ status: 500 }));

      const event = newEvent();

      const recorder = new ElucidationRecorder("http://localhost:1234");
      const result = await recorder.recordNewEvent(event);

      expect(result.status).toEqual(Status.ERROR);
      expect(result.hasErrorMessage()).toBeTruthy();
      expect(result.errorMessage).toContain("Status: 500");
      expect(result.hasException()).toBeFalsy();
    });

    it("should receive an error result when exception is thrown on request", async () => {
      jest.spyOn(axios, "post").mockImplementation(() => {
        throw new Error("Something bad happened");
      });

      const event = newEvent();

      const recorder = new ElucidationRecorder("http://localhost:1234");
      const result = await recorder.recordNewEvent(event);

      expect(result.status).toEqual(Status.ERROR);
      expect(result.hasErrorMessage()).toBeFalsy();
      expect(result.hasException()).toBeTruthy();
      expect(result.exception).toEqual(new Error("Something bad happened"));
    });
  });

  describe("track", () => {
    it("should receive a successful result when recording succeeds", async () => {
      jest
        .spyOn(axios, "post")
        .mockReturnValue(Promise.resolve({ status: 200 }));

      const recorder = new ElucidationRecorder("http://localhost:1234");
      const result = await recorder.track("a-service", "HTTP", ["/some/path"]);

      expect(result.status).toEqual(Status.SUCCESS);
      expect(result.hasErrorMessage()).toBeFalsy();
      expect(result.hasException()).toBeFalsy();
    });

    it("should receive an error result when error message returned from service", async () => {
      jest
        .spyOn(axios, "post")
        .mockReturnValue(Promise.resolve({ status: 500 }));

      const recorder = new ElucidationRecorder("http://localhost:1234");
      const result = await recorder.track("b-service", "HTTP", [
        "/some/other/path",
      ]);

      expect(result.status).toEqual(Status.ERROR);
      expect(result.hasErrorMessage()).toBeTruthy();
      expect(result.errorMessage).toContain("Status: 500");
      expect(result.hasException()).toBeFalsy();
    });

    it("should receive an error result when exception is thrown on request", async () => {
      jest.spyOn(axios, "post").mockImplementation(() => {
        throw new Error("Something bad happened");
      });

      const recorder = new ElucidationRecorder("http://localhost:1234");
      const result = await recorder.track("c-service", "HTTP", [
        "/never/gonna/get/it",
      ]);

      expect(result.status).toEqual(Status.ERROR);
      expect(result.hasErrorMessage()).toBeFalsy();
      expect(result.hasException()).toBeTruthy();
      expect(result.exception).toEqual(new Error("Something bad happened"));
    });
  });

  it("should support a string baseUri", async () => {
    const axiosSpy = jest
      .spyOn(axios, "post")
      .mockReturnValue(Promise.resolve({ status: 200 }));

    const event = {} as ConnectionEvent;

    const recorder = new ElucidationRecorder("http://string-based-uri:1234");
    await recorder.recordNewEvent(event);

    expect(axiosSpy).toHaveBeenCalledWith(
      "http://string-based-uri:1234/elucidate/event",
      {},
    );
  });

  it("should support a function baseUri", async () => {
    const axiosSpy = jest
      .spyOn(axios, "post")
      .mockReturnValue(Promise.resolve({ status: 200 }));

    const event = {} as ConnectionEvent;

    const recorder = new ElucidationRecorder(
      () => "http://function-based-uri:1234",
    );
    await recorder.recordNewEvent(event);

    expect(axiosSpy).toHaveBeenCalledWith(
      "http://function-based-uri:1234/elucidate/event",
      {},
    );
  });
});
