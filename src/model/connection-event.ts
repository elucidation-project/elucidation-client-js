import {Direction} from "./direction";

export interface ConnectionEvent {
  id?: number;
  serviceName: string;
  eventDirection: Direction;
  communicationType: string;
  connectionIdentifier: string;
  observedAt?: number;
}
