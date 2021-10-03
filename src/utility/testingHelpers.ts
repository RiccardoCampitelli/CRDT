export const moveTimeForwards = (now: Date) =>
  jest.setSystemTime(now.setMinutes(now.getMinutes() + 1));