import Toast from "react-native-toast-message";

type ToastType = "success" | "error" | "info";

export const useToast = () => {
  const show = (
    message: string,
    type: ToastType = "error",
    duration = 3000,
  ) => {
    Toast.show({
      type,
      text1:
        type === "success" ? "Success" : type === "error" ? "Error" : "Info",
      text2: message,
      duration,
      position: "top",
    });
  };

  return {
    success: (message: string) => show(message, "success"),
    error: (message: string) => show(message, "error"),
    info: (message: string) => show(message, "info"),
  };
};
