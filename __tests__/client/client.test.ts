import { describe, expect, it, jest } from "@jest/globals";
import {
  ConnectionEvent,
  ElucidationClient,
  ElucidationResult,
  Status,
} from "../../src";
import { ElucidationRecorder } from "../../src/client/recorder";

describe("Elucidation Client", () => {
  describe("recordNewEvent", () => {
    describe("skips recording", () => {
      function expectSkipped(result: ElucidationResult) {
        expect(result.status).toEqual(Status.SKIPPED);
        expect(result.hasSkipMessage()).toBeTruthy();
        expect(result.skipMessage).toContain("Recorder not enabled");
      }

      it("when noop", async () => {
        const client = ElucidationClient.noop();
        const result = await client.recordNewEvent("{}");

        expectSkipped(result);
      });

      it("when not enabled", async () => {
        let client = ElucidationClient.of(null, null);
        expectSkipped(await client.recordNewEvent("{}"));

        client = ElucidationClient.of(
          new ElucidationRecorder("http://localhost:1234"),
          null,
        );
        expectSkipped(await client.recordNewEvent("{}"));

        client = ElucidationClient.of(null, () => {
          return {} as ConnectionEvent;
        });
        expectSkipped(await client.recordNewEvent("{}"));
      });
    });
    describe("returns error", () => {
      it("when no event", async () => {
        const recorder = new ElucidationRecorder("http://localhost:1234");
        const factory = () => {
          return null as ConnectionEvent;
        };

        const client = ElucidationClient.of(recorder, factory);
        const result = await client.recordNewEvent("{}");

        expect(result.status).toEqual(Status.ERROR);
        expect(result.hasException()).toBeFalsy();
        expect(result.hasErrorMessage()).toBeTruthy();
        expect(result.errorMessage).toContain(
          "event is missing; cannot record",
        );
      });

      it("when input is null", async () => {
        const recorder = new ElucidationRecorder("http://localhost:1234");
        const factory = () => {
          return {} as ConnectionEvent;
        };

        const client = ElucidationClient.of(recorder, factory);
        const result = await client.recordNewEvent(null);

        expect(result.status).toEqual(Status.ERROR);
        expect(result.hasException()).toBeFalsy();
        expect(result.hasErrorMessage()).toBeTruthy();
        expect(result.errorMessage).toContain(
          "input is null; cannot create event",
        );
      });

      it("when exception thrown recording", async () => {
        const recorder = new ElucidationRecorder("http://localhost:1234");
        const factory = () => {
          return {} as ConnectionEvent;
        };

        const recorderSpy = jest
          .spyOn(recorder, "recordNewEvent")
          .mockImplementation(() => {
            throw new Error("oops");
          });

        const client = ElucidationClient.of(recorder, factory);
        const result = await client.recordNewEvent("{}");

        expect(result.status).toEqual(Status.ERROR);
        expect(result.hasException()).toBeTruthy();
        expect(result.exception).toEqual(new Error("oops"));
        expect(recorderSpy).toHaveBeenCalledWith({});
      });
    });
    it("should return success result when processed ok", async () => {
      const recorder = new ElucidationRecorder("http://localhost:1234");
      const factory = () => {
        return {} as ConnectionEvent;
      };

      const recorderSpy = jest
        .spyOn(recorder, "recordNewEvent")
        .mockImplementation(() => Promise.resolve(ElucidationResult.ok()));

      const client = ElucidationClient.of(recorder, factory);
      const result = await client.recordNewEvent("{}");

      expect(result.status).toEqual(Status.SUCCESS);
      expect(result.hasSkipMessage()).toBeFalsy();
      expect(result.hasException()).toBeFalsy();
      expect(result.hasErrorMessage()).toBeFalsy();
      expect(recorderSpy).toHaveBeenCalledWith({});
    });
  });

  describe("trackIdentifiers", () => {
    describe("skips sending", () => {
      function expectSkipped(result: ElucidationResult) {
        expect(result.status).toEqual(Status.SKIPPED);
        expect(result.hasSkipMessage()).toBeTruthy();
        expect(result.skipMessage).toContain("Recorder not enabled");
      }

      it("when noop", async () => {
        const client = ElucidationClient.noop();
        const result = await client.trackIdentifiers("foo", "HTTP", []);

        expectSkipped(result);
      });

      it("when not enabled", async () => {
        let client = ElucidationClient.of(null, null);
        expectSkipped(await client.trackIdentifiers("foo", "HTTP", []));

        client = ElucidationClient.of(
          new ElucidationRecorder("http://localhost:1234"),
          null,
        );
        expectSkipped(await client.trackIdentifiers("foo", "HTTP", []));

        client = ElucidationClient.of(null, () => {
          return {} as ConnectionEvent;
        });
        expectSkipped(await client.trackIdentifiers("foo", "HTTP", []));
      });
    });
    describe("returns error", () => {
      it("when exception thrown recording", async () => {
        const recorder = new ElucidationRecorder("http://localhost:1234");
        const factory = () => {
          return {} as ConnectionEvent;
        };

        const recorderSpy = jest
          .spyOn(recorder, "track")
          .mockImplementation(() => {
            throw new Error("oops");
          });

        const client = ElucidationClient.of(recorder, factory);
        const result = await client.trackIdentifiers("foo", "HTTP", []);

        expect(result.status).toEqual(Status.ERROR);
        expect(result.hasException()).toBeTruthy();
        expect(result.exception).toEqual(new Error("oops"));
        expect(recorderSpy).toHaveBeenCalledWith("foo", "HTTP", []);
      });
    });
    it("should return success result when processed ok", async () => {
      const recorder = new ElucidationRecorder("http://localhost:1234");
      const factory = () => {
        return {} as ConnectionEvent;
      };

      const recorderSpy = jest
        .spyOn(recorder, "track")
        .mockImplementation(() => Promise.resolve(ElucidationResult.ok()));

      const client = ElucidationClient.of(recorder, factory);
      const result = await client.trackIdentifiers("foo", "HTTP", []);

      expect(result.status).toEqual(Status.SUCCESS);
      expect(result.hasSkipMessage()).toBeFalsy();
      expect(result.hasException()).toBeFalsy();
      expect(result.hasErrorMessage()).toBeFalsy();
      expect(recorderSpy).toHaveBeenCalledWith("foo", "HTTP", []);
    });
  });
});
