export default function formattedTimer(timer: number) {
  const minutes = Math.floor(timer / 1000 / 60);
  const seconds = Math.floor((timer / 1000) % 60);

  const formattedTime = `${minutes} : ${seconds <= 9 ? 0 : ""}${seconds}`;

  return formattedTime;
}
