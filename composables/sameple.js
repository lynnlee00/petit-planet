export default function () {
  const filter = useState('filter', () => 'all')
  const count = ref(0);
  const add = () => {
    count.value++;
  };

  return {
    filter, count, add
  }
  //使用方法 const { count, add } = useCount();
}