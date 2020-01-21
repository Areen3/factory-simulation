// REVIEW js example generic interface without specific type
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
// REVIEW js example type declaration
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
  // REVIEW js example nested interface declaration
  title: {
    display: boolean;
    text: string;
    fontSize: number;
  };
  legend: {
    position: EChartLegendPosition;
  };
}
