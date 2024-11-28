export interface ServiceMethodSuccessReturnType<T> {
  data: T;
}

export interface ServiceMethodErrorReturnType {
  errors: {
    messages: string[];
    field?: string;
  }[];
  statusCode: number;
}

export type ServiceMethodReturnType<T> =
  | ServiceMethodSuccessReturnType<T>
  | ServiceMethodErrorReturnType;