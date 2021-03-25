export interface GraphiOperationDTO {
  uri: string;
  query: string;
  variables: string;
  operationName?: string;
  cache?: string;
  result: any;
  beforeRequestHooks?: Function[];
  makeRequest: () => Promise<any>;
  afterRequestHooks: Function[];
  onUpdateResultHooks: Function[];
  onCancelHooks: Function[];
  serializeResultHooks: Array<
    (result: any, dto: GraphiOperationDTO, context: any) => any
  >;
  private?: any;
}

export class DTO {
  static addOnResultUpdatedHook(
    dto: GraphiOperationDTO,
    hook: Function
  ): GraphiOperationDTO {
    return { ...dto, onUpdateResultHooks: [...dto.onUpdateResultHooks, hook] };
  }

  static addAfterRequestHooks(
    dto: GraphiOperationDTO,
    hook: Function
  ): GraphiOperationDTO {
    return { ...dto, afterRequestHooks: [...dto.afterRequestHooks, hook] };
  }

  static addBeforeRequestHooks(
    dto: GraphiOperationDTO,
    hook: Function
  ): GraphiOperationDTO {
    return { ...dto, beforeRequestHooks: [...dto.beforeRequestHooks, hook] };
  }

  static addOnCancelHooks(
    dto: GraphiOperationDTO,
    hook: Function
  ): GraphiOperationDTO {
    return { ...dto, onCancelHooks: [...dto.onCancelHooks, hook] };
  }

  static setQuery(dto: GraphiOperationDTO, query: string): GraphiOperationDTO {
    return { ...dto, query };
  }

  static setVariables(
    dto: GraphiOperationDTO,
    variables: string
  ): GraphiOperationDTO {
    return { ...dto, variables };
  }

  static setMakeRequest(
    dto: GraphiOperationDTO,
    func: Function
  ): GraphiOperationDTO {
    return {
      ...dto,
      makeRequest() {
        return func.call(this);
      },
    };
  }
}
