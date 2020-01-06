export interface IChartDataSetItem<T> {
  label: string;
  data: Array<T>;
  fill: boolean;
  borderColor: string;
}

export interface IAbstractCharModel<T> {
  labels: Array<string>;
  datasets: Array<IChartDataSetItem<T>>;
}
export interface ILineChartModel extends IAbstractCharModel<number> {}
export enum EChartLegendPosition {
  bottom = 'bottom',
  top = 'top',
  right = 'right',
  left = 'left'
}
export interface IAbstractChartOptionsModel {
  title: {
    display: boolean;
    text: string;
    fontSize: number;
  };
  legend: {
    position: EChartLegendPosition;
  };
}
