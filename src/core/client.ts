export class GraphiClient {
  constructor(private middlewares: Composer[]) { }

  public compose(...args: Composer[]): GraphiOperation {
    const dto = [...this.middlewares, ...args].reduce((acc: GraphiOperationDTO, composer: Composer) => {
      return composer(acc);
    }, { query: '', variables: '', result: '', uri: '', makeRequest: async() => {} });

    return new GraphiOperation(dto);
  }
}

export class GraphiOperation {
  constructor(private dto: GraphiOperationDTO) { }

  public execute() {
    return GraphiOperation._execute(this.dto);
  }

  public static async _execute(dto: GraphiOperationDTO) {
    await dto.beforeRequestHooks.reduce(async (acc, hook) => {
      return await hook(acc, { updateResult: this.updateResult });
    }, Promise.resolve(dto));

    const requestResult = await dto.makeRequest();

    await dto.afterRequestHooks.map(async (hook) => {
      await hook(dto, requestResult);
    });

    const result = await dto.serializeResultHooks.reduce(async (acc, hook) => {
      return await hook(acc, dto, { updateResult: this.updateResult });
    }, Promise.resolve(dto.result));

    return GraphiOperation.updateResult(result, dto.result);
  }

  public static updateResult(dto: any, result: any) {
    dto.result = result;
    dto.onUpdateResultHooks.forEach(hook => hook(this));

    return this;
  }
}

export type Composer = (GraphiOperationDTO) => GraphiOperationDTO;

export interface GraphiOperationDTO {
  uri: string;
  query: string,
  variables: string,
  operationName?: string,
  cache?: string,
  result: any;
  beforeRequestHooks?: Function[];
  makeRequest: () => Promise<any>;
  afterRequestHooks?: Function[];
  onUpdateResultHooks?: Function[];
  serializeResultHooks?: Array<(result: any, dto: GraphiOperationDTO, context: any) => any>;
  private?: any;
}

export class GraphiOperationDTO {
  static addOnResultUpdatedHook(dto: GraphiOperationDTO, hook: Function): GraphiOperationDTO {
    return {...dto, onUpdateResultHooks: [...dto.onUpdateResultHooks, hook]};
  }

  static addAfterRequestHooks(dto: GraphiOperationDTO, hook: Function): GraphiOperationDTO {
    return {...dto, afterRequestHooks: [...dto.afterRequestHooks, hook]};
  }

  static addBeforeRequestHooks(dto: GraphiOperationDTO, hook: Function): GraphiOperationDTO {
    return {...dto, beforeRequestHooks: [...dto.beforeRequestHooks, hook]};
  }
}

function executeHook(dto: GraphiOperationDTO): any {
  dto.makeRequest = async () => {
    console.log(dto.uri);
  }

  return dto;
}

function beforeRequest(func: Function): any {
  return (dto:  GraphiOperationDTO) => {
    return GraphiOperationDTO.addBeforeRequestHooks(dto, () => { func(dto) });
  }
}

function afterRequest(func: Function): any {
  return (dto:  GraphiOperationDTO) => {
    return GraphiOperationDTO.addAfterRequestHooks(dto, (result) => { 
      func(result)
     });
  }
}

function onResultUpdated(func: Function): any {
  return (dto:  GraphiOperationDTO) => {
    return GraphiOperationDTO.addOnResultUpdatedHook(dto, () => { func(dto) });
  }
}

function onError(func: Function): any {
  return (dto:  GraphiOperationDTO) => {
    return GraphiOperationDTO.addAfterRequestHooks(dto, () => { func(dto) });
  }
}

function onSuccess(func: Function): any {
  const currentResult = null;

  return (dto:  GraphiOperationDTO) => {
    return GraphiOperationDTO.addAfterRequestHooks(dto, (result) => { 
      if (!currentResult) {
        func(result)
      }
     });
  }
}

function refreshInterval(interval: number): any {
  let timer = null;

  return (dto: GraphiOperationDTO) => {
    return GraphiOperationDTO.addAfterRequestHooks(dto, () => { 
      timer = setTimeout(() => {
        GraphiOperation._execute(dto);
      }, interval);
    });
  }
}

function useCache(opts: any): any {
  return (dto: GraphiOperationDTO) => {
    return GraphiOperationDTO.addBeforeRequestHooks(dto, (_, { updateResult }) => { 
      if (opts.initialData) {
        updateResult({});
      }
    });
  }
}

let loading = false;

const operation = new GraphiClient([executeHook]).compose(
  useCache({ initialData: true }),
  refreshInterval(10000),
  beforeRequest(() => { loading = true; }),
  afterRequest(() => { loading = false; }),
  onResultUpdated(() => alert()),
  onSuccess(() => alert('done')),
  onError(() => alert()),
);

operation.execute();
