export interface interfaceRequest extends Request {
  user: {
    _id: any;
    password: string;
  };
}
