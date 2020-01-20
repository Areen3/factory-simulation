export interface IChartDataSetItem<T> {
  name: string;
  value: T;
}

export interface IAbstractCharModel<T> {
  name: string;
  series: Array<IChartDataSetItem<T>>;
}

export interface IAbstractNgxChartModel<T> {
  name: string;
  value: T;
}
export interface ILineChartItem extends IAbstractCharModel<number> {}
export type TLineChartModel = Array<ILineChartItem>;
export interface IAdvancedPipeChartModel extends IAbstractNgxChartModel<number> {}
export interface ITreeMapChartModel extends IAbstractNgxChartModel<number> {}
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
