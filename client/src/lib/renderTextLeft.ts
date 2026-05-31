export const renderTextLeft = (max: number, cur: number) => {
  if (max >= cur) {
    return `${max - cur} character left`;
  } else {
    return `${cur - max} character extra`;
  }
};
