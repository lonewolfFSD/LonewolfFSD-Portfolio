import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const showOfflineToast = (message = "Something went wrong.", options = {}) => {
  toast.error(message, {
    position: options.position || "bottom-left",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    theme: "dark",
    className: "expand-toast",
    toastId: options.toastId || `offline-toast-${Date.now()}`, // Unique ID for each toast
  });
};

export const dismissOfflineToast = (toastId) => {
  toast.dismiss(toastId);
};