export interface ServiceMethodSuccessReturnType<T> {
  data: T;
}

export interface ServiceMethodErrorReturnType {
  error: string;
  statusCode: number;
}

export type ServiceMethodReturnType<T> =
  | ServiceMethodSuccessReturnType<T>
  | ServiceMethodErrorReturnType;