import { useQuery } from "@tanstack/react-query";
import {axiosInstance} from "../lib/axios";

const useAuthUser = () => {
  const {
    data: authUser,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const response = await axiosInstance.get("/auth/me");
      return response.data.user;
    },
    retry: false,
  });

  return {
    authUser,
    isLoading,
    refetch,
  };
};

export default useAuthUser;