import { GraphiOperationDTO } from "./dto";

export class GraphiOperation {
  constructor(private dto: GraphiOperationDTO) {}

  public execute() {
    return GraphiOperation._execute(this.dto);
  }

  public cancel() {
    return GraphiOperation._cancel(this.dto);
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

    return GraphiOperation.updateResult(dto, result);
  }

  public static updateResult(dto: GraphiOperationDTO, result: any) {
    const newDto: GraphiOperationDTO = { ...dto, result };
    dto.onUpdateResultHooks.forEach((hook) => hook(newDto));

    return newDto;
  }

  public static _cancel(dto: GraphiOperationDTO) {
    dto.onCancelHooks.forEach((hook) => hook(this));

    return dto;
  }
}
