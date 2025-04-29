import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

interface AvatarContextType {
  avatarURL: string;
  setAvatarURL: (url: string) => void;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export const AvatarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [avatarURL, setAvatarURL] = useState<string>("");

  useEffect(() => {
    const loadAvatar = async () => {
      const user = auth.currentUser;
      if (!user) {
        setAvatarURL("");
        return;
      }
      try {
        console.log("Context loading avatar for UID:", user.uid);
        const userDoc = doc(db, "users", user.uid, "profile", "avatar");
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.avatar) {
            console.log("Context avatar found:", data.avatar.substring(0, 50) + "...");
            setAvatarURL(data.avatar);
          } else {
            console.log("No custom avatar in Firestore");
            setAvatarURL(""); // Allow provider avatar
          }
        } else {
          console.log("No avatar document");
          setAvatarURL("");
        }
      } catch (err) {
        console.error("Context load avatar error:", err);
        setAvatarURL("");
      }
    };
    loadAvatar();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadAvatar();
      } else {
        setAvatarURL("");
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AvatarContext.Provider value={{ avatarURL, setAvatarURL }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error("useAvatar must be used within an AvatarProvider");
  }
  return context;
};