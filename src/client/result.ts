export enum Status {
  SUCCESS = "SUCCESS",
  SKIPPED = "SKIPPED",
  ERROR = "ERROR"
}

export class ElucidationResult {
  constructor(
    public status: Status,
    public skipMessage: string | null = null,
    public errorMessage: string | null = null,
    public exception: Error | null = null
  ) {}

  static ok(): ElucidationResult {
    return new ElucidationResult(Status.SUCCESS);
  }

  static fromSkipMessage(skipMessage: string): ElucidationResult {
    return new ElucidationResult(Status.SKIPPED, skipMessage);
  }

  static fromErrorMessage(errorMessage: string): ElucidationResult {
    return new ElucidationResult(Status.ERROR, null, errorMessage);
  }

  static fromException(exception: Error): ElucidationResult {
    return new ElucidationResult(Status.ERROR, null, null, exception);
  }

  hasSkipMessage(): boolean {
    return this.skipMessage !== null;
  }

  hasErrorMessage(): boolean {
    return this.errorMessage !== null;
  }

  hasException(): boolean {
    return this.exception !== null;
  }
}
