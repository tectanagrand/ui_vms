import useAxiosPrivate from './useAxiosPrivate';

export default async function useFetcherSWR() {
  const axiosPrivate = useAxiosPrivate();
  const fetcher = (url) => {
    axiosPrivate.get(url).then((res) => res.data);
  };
  return fetcher;
}
