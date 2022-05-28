declare module "vue-simple-context-menu" {
  const VueSimpleContextMenu: import("vue").DefineComponent<>;

  export interface IOption {
    name: string;
    slug: string;
  }

  export interface OptionEvent<T> {
    item: T;
    option: IOption;
  }

  export default VueSimpleContextMenu;
}
