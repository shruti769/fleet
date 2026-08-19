// The eight photographs used by the prototype, bundled locally so the app
// works offline. Keys match the prototype's IMG map.
export const IMG = {
  driver: require('../../../assets/photos/driver.jpg'),
  primeMover: require('../../../assets/photos/prime-mover.jpg'),
  tanker: require('../../../assets/photos/tanker.jpg'),
  allocator: require('../../../assets/photos/allocator.jpg'),
  palletsDock: require('../../../assets/photos/pallets-dock.jpg'),
  tyreDefect: require('../../../assets/photos/tyre-defect.jpg'),
  depotYard: require('../../../assets/photos/depot-yard.jpg'),
  highway: require('../../../assets/photos/highway.jpg'),
} as const;

export type ImageKey = keyof typeof IMG;
