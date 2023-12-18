import axios from 'axios';
import { useSession } from 'src/provider/sessionProvider';

const useRefreshToken = () => {
  const { setAccessToken, logOut } = useSession();
  const refresh = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_URL_LOC}/user/refresh`, {
        withCredentials: true,
      });
      setAccessToken(response.data.accessToken);
      return response.data.accessToken;
    } catch (error) {
      console.log(error);
      setTimeout(() => {
        window.location.replace(`${window.location.hostname}/login`);
      }, 100);
    }
  };

  return refresh;
};

export default useRefreshToken;
