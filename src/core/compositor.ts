export class GraphiCompositor {
  public compose(...args: Composer[]): GraphiOperationDTO {
    return args.reduce((acc: GraphiOperationDTO, composer: Composer) => {
      return composer(acc);
    }, { query: '', variables: '', result: '' });
  }
}

export type Composer = (GraphiOperationDTO) => GraphiOperationDTO;

export interface GraphiOperationDTO {
  query: string,
  variables: string,
  operationName?: string,
  result: any;
}

new GraphiCompositor().compose(
  () => 1 + 1,
  () => 1 + 1,
  () => 1 + 1,
)
