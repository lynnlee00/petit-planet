export default num => {
  if (!num) {
    return num;
  }
  const parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');

  //使用方法 $ {{ {{ toThousands(19999) }} }}
};