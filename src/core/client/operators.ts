import { DTO, GraphiOperationDTO } from "./dto";
import { GraphiOperation } from "./operation";

export function beforeRequest(func: Function): any {
  return (dto: GraphiOperationDTO) => {
    return DTO.addBeforeRequestHooks(dto, () => {
      func(dto);
    });
  };
}

export function afterRequest(func: Function): any {
  return (dto: GraphiOperationDTO) => {
    return DTO.addAfterRequestHooks(dto, (result) => {
      func(result);
    });
  };
}

export function onResultUpdated(func: Function): any {
  return (dto: GraphiOperationDTO) => {
    return DTO.addOnResultUpdatedHook(dto, () => {
      func(dto);
    });
  };
}

export function onError(func: Function): any {
  return (dto: GraphiOperationDTO) => {
    return DTO.addAfterRequestHooks(dto, () => {
      func(dto);
    });
  };
}

export function onSuccess(func: Function): any {
  const currentResult = null;

  return (dto: GraphiOperationDTO) => {
    return DTO.addAfterRequestHooks(dto, (result) => {
      if (!currentResult) {
        func(result);
      }
    });
  };
}

export function refreshInterval(interval: number): any {
  let timer = null;

  return (dto: GraphiOperationDTO) => {
    let dtox = DTO.addAfterRequestHooks(dto, (newDto) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        GraphiOperation._execute(newDto);
      }, interval);
    });

    dtox = DTO.addOnCancelHooks(dtox, () => {
      clearTimeout(timer);
    });

    return dtox;
  };
}

export function useCache(opts: any): any {
  return (dto: GraphiOperationDTO) => {
    return DTO.addBeforeRequestHooks(dto, (_, { updateResult }) => {
      if (opts.initialData) {
        updateResult({});
      }
    });
  };
}

export function fromQuery(opts: any): any {
  return (dto: GraphiOperationDTO) => {
    let newDto = DTO.setQuery(dto, opts.query);
    return DTO.setVariables(newDto, opts.variables);
  };
}
