class MapVehiclesQueryModel extends GraphiQuery {
  @attr('id')
  public id: string;

  @attr()
  public name: string;

  @attr()
  public registrationNumber: string;

  @attr('tags { name }')
  public tags: Tag[];

  private names: string[];

  @computed('name', 'registrationNumber')
  public fullName(name: string, registrationNumber: string): string {
    return `${registrationNumber} ${name}`;
  }

  public setNames(names: string[]): void {
    return (this.names = names);
  }
}

const query = gql`query asd {
  vehicles @model(MapVehiclesQueryModel) 
}`;
