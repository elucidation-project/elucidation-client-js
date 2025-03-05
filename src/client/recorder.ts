import axios from "axios";
import { ElucidationResult } from "./result";
import { ConnectionEvent } from "../model/connection-event";

export class ElucidationRecorder {
  private readonly baseUri: string | (() => string);

  constructor(baseUri: string | (() => string)) {
    this.baseUri = baseUri;
  }

  private resolveBaseUri(): string {
    if (typeof this.baseUri === "string") {
      return this.baseUri;
    }

    return this.baseUri();
  }

  async recordNewEvent(event: ConnectionEvent): Promise<ElucidationResult> {
    try {
      const response = await axios.post(
        `${this.resolveBaseUri()}/elucidate/event`,
        event,
      );

      if (response.status >= 200 && response.status < 300) {
        return ElucidationResult.ok();
      }

      const errorMessage = `Unable to record connection event due to a problem communicating with the elucidation server. Status: ${response.status}, Body: ${response.data}`;
      return ElucidationResult.fromErrorMessage(errorMessage);
    } catch (error) {
      return ElucidationResult.fromException(error);
    }
  }

  async track(
    serviceName: string,
    communicationType: string,
    identifiers: Array<string>,
  ): Promise<ElucidationResult> {
    try {
      const response = await axios.post(
        `${this.resolveBaseUri()}/elucidate/trackedIdentifier/${serviceName}/${communicationType}`,
        identifiers,
      );

      if (response.status >= 200 && response.status < 300) {
        return ElucidationResult.ok();
      }

      const errorMessage = `Unable to load tracked identifiers due to a problem communicating with the elucidation server. Status: ${response.status}, Body: ${response.data}`;
      return ElucidationResult.fromErrorMessage(errorMessage);
    } catch (error) {
      return ElucidationResult.fromException(error);
    }
  }
}
