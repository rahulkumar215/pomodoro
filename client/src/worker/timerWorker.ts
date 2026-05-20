self.onmessage = ({ data }) => {
  let timeLeft: number = data.timer;
  const interval = setInterval(() => {
    timeLeft = timeLeft - 1000;
    if (timeLeft <= 0) {
      clearInterval(interval);
    }
    self.postMessage({ id: data.id, timeLeft });
  }, 1000);
};
