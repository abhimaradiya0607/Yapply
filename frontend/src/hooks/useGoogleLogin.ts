import { useMutation, useQueryClient } from "@tanstack/react-query";
import {axiosInstance} from "../lib/axios";

const useGoogleLogin = () => {
  const queryClient = useQueryClient();

  const {
    mutateAsync: googleLoginMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (code: string) => {
      const response = await axiosInstance.post(
        "/auth/google",
        { code }
      );

      return response.data;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["authUser"],
      });
    },
  });

  return {
    googleLoginMutation,
    isPending,
    error,
  };
};

export default useGoogleLogin;