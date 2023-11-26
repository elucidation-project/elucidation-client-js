import {ElucidationRecorder} from "./recorder";
import {ElucidationResult} from "./result";
import {ConnectionEvent} from "../model/connection-event";

export class ElucidationClient {

  private readonly recorder: ElucidationRecorder;
  private readonly eventFactory: ((input: any) => ConnectionEvent);
  private readonly enabled: boolean;

  private constructor(recorder: ElucidationRecorder, eventFactory: ((input: any) => ConnectionEvent)) {
    this.recorder = recorder;
    this.eventFactory = eventFactory;
    this.enabled = recorder != null && eventFactory != null;
  }

  static of(recorder: ElucidationRecorder, eventFactory: ((input: any) => ConnectionEvent)): ElucidationClient {
    return new ElucidationClient(recorder, eventFactory);
  }

  static noop(): ElucidationClient {
    return new ElucidationClient(null, null);
  }

  async recordNewEvent(input: any): Promise<ElucidationResult> {
    if (!this.enabled) {
      return ElucidationResult.fromSkipMessage("Recorder not enabled");
    }

    if (input == null) {
      return ElucidationResult.fromErrorMessage("input is null; cannot create event");
    }

    try {
      const event = this.eventFactory(input);
      if (event != null) {
        return this.recorder.recordNewEvent(event);
      }

      return ElucidationResult.fromErrorMessage("event is missing; cannot record");
    } catch (error) {
      return ElucidationResult.fromException(error);
    }
  }

  async trackIdentifiers(serviceName: string, communicationType: string, identifiers: Array<string>): Promise<ElucidationResult> {
    if (!this.enabled) {
      return ElucidationResult.fromSkipMessage("Recorder not enabled");
    }

    try {
      return await this.recorder.track(serviceName, communicationType, identifiers);
    } catch (error) {
      return ElucidationResult.fromException(error);
    }
  }
}
