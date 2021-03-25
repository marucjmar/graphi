import { GraphiOperationDTO } from "./dto";
import { GraphiOperation } from "./operation";

export class GraphiClient {
  constructor(private middlewares: Composer[]) {}

  public compose(...args: Composer[]): GraphiOperation {
    const initDto: GraphiOperationDTO = {
      query: "",
      variables: "",
      result: "",
      uri: "",
      serializeResultHooks: [],
      afterRequestHooks: [],
      onUpdateResultHooks: [],
      onCancelHooks: [],
      beforeRequestHooks: [],
      makeRequest: async () => {
        throw new Error("No request function");
      },
    };

    const dto = [...this.middlewares, ...args].reduce(
      (acc: GraphiOperationDTO, composer: Composer) => {
        return composer(acc);
      },
      initDto
    );

    return new GraphiOperation(dto);
  }
}

export type Composer = (GraphiOperationDTO) => GraphiOperationDTO;
