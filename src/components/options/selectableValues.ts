const selectableValues = <T extends string | number>(vector: T[]) =>
  vector.map((el) => ({
    value: el,
    label: `${el}`,
  }));

const base = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const selectableZeroToTen = selectableValues([0, ...base]);
export const selectableHalfToTen = selectableValues([0.5, ...base]);
